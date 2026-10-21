const bridgeUrl = String(process.env.REDFINGER_BRIDGE_URL || 'http://127.0.0.1:8790').trim().replace(/\/$/, '');
const bridgeToken = String(process.env.REDFINGER_BRIDGE_TOKEN || '').trim();

const configured = () => Boolean(bridgeUrl);

function bridgeEndpoint(path) {
  if (!configured()) throw new Error('Redfinger bridge is not configured on this server.');
  const url = new URL(path, `${bridgeUrl}/`);
  if (url.origin !== new URL(bridgeUrl).origin) throw new Error('Invalid Redfinger bridge path.');
  if (url.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(url.hostname)) {
    throw new Error('Redfinger bridge must use HTTPS or localhost.');
  }
  return url;
}

async function bridgeRequest(path, options = {}) {
  const response = await fetch(bridgeEndpoint(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(bridgeToken ? { Authorization: `Bearer ${bridgeToken}` } : {}),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(path.startsWith('/v1/inventory') ? 120_000 : 25_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Redfinger bridge failed (${response.status}).`);
  return payload;
}

const cleanText = (value, max = 120) => String(value ?? '').trim().slice(0, max);
const cleanStatus = value => ['Online', 'Offline', 'Rebooting'].includes(value) ? value : 'Offline';

function normalizeDevice(raw, session = {}) {
  const code = cleanText(raw.deviceCode ?? raw.device_code ?? raw.padCode, 100);
  const padId = Number(raw.padId ?? raw.pad_id);
  const userPadId = Number(raw.userPadId ?? raw.user_pad_id);
  if (!code || !Number.isSafeInteger(padId) || padId <= 0 || !Number.isSafeInteger(userPadId) || userPadId <= 0) {
    throw new Error('Provider returned a device without its verified identity tuple.');
  }
  const days = Math.max(0, Number(raw.remainingDays ?? raw.remaining_days ?? raw.leftOnlineTime) || 0);
  return {
    id: `${code}:${padId}:${userPadId}`,
    name: cleanText(raw.name ?? raw.deviceName ?? raw.device_name ?? raw.padName, 80),
    deviceCode: code,
    padId,
    userPadId,
    account: cleanText(raw.account ?? session.label ?? session.name ?? 'Redfinger', 80),
    sessionId: cleanText(raw.sessionId ?? raw.session_id ?? session.id, 60),
    region: cleanText(raw.region ?? raw.roomName ?? raw.idcCode, 50),
    android: cleanText(raw.android ?? raw.androidVersion ?? raw.android_version ?? raw.romVersion, 30),
    status: cleanStatus(raw.status),
    remainingDays: days,
    expiresAt: cleanText(raw.expiresAt ?? raw.expires_at, 40),
    lastSeenAt: cleanText(raw.lastSeenAt ?? raw.last_seen_at, 40),
    captureAvailable: Boolean(raw.captureAvailable ?? raw.capture_available),
  };
}

function normalizeInventory(payload) {
  const sessions = Array.isArray(payload.sessions) ? payload.sessions.slice(0, 5).map((session, index) => ({
    id: cleanText(session.id ?? `S${index + 1}`, 60),
    label: cleanText(session.label ?? session.name ?? `Session ${index + 1}`, 80),
    status: session.status === 'healthy' ? 'healthy' : 'unavailable',
    deviceCount: Math.max(0, Number(session.deviceCount ?? session.device_count) || 0),
  })) : [];
  const sessionMap = new Map(sessions.map(session => [session.id, session]));
  const devices = (Array.isArray(payload.devices) ? payload.devices : []).map(raw => normalizeDevice(raw, sessionMap.get(cleanText(raw.sessionId ?? raw.session_id, 60))));
  return { sessions, devices, fetchedAt: Date.now(), capabilities: { reboot: Boolean(payload.capabilities?.reboot), renew: Boolean(payload.capabilities?.renew), capture: Boolean(payload.capabilities?.capture), logs: true } };
}

const snapshotFor = (db, userId) => {
  const row = db.prepare('SELECT payload,updated_at AS updatedAt FROM redfinger_snapshots WHERE user_id=?').get(userId);
  return row ? { ...JSON.parse(row.payload), cached: true, fetchedAt: row.updatedAt } : null;
};

const saveSnapshot = (db, userId, inventory) => db.prepare('INSERT INTO redfinger_snapshots (user_id,payload,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').run(userId, JSON.stringify(inventory), inventory.fetchedAt);

const recordEvent = (db, userId, deviceId, type, message) => db.prepare('INSERT INTO redfinger_events (user_id,device_id,event_type,message,created_at) VALUES (?,?,?,?,?)').run(userId, deviceId || null, type, cleanText(message, 240), Date.now());

export function createRedfingerHandler({ db, json, readBody }) {
  return async function handleRedfinger(req, res, url, user) {
    if (!url.pathname.startsWith('/api/redfinger')) return false;
    if (req.method === 'GET' && url.pathname === '/api/redfinger/status') {
      json(res, 200, { configured: configured(), cached: Boolean(snapshotFor(db, user.id)) }); return true;
    }
    if (req.method === 'GET' && url.pathname === '/api/redfinger/devices') {
      if (!configured()) { const cached = snapshotFor(db, user.id); json(res, cached ? 200 : 503, cached || { error: 'Redfinger bridge is not configured on this server.', configured: false }); return true; }
      try { const inventory = normalizeInventory(await bridgeRequest('/v1/inventory')); saveSnapshot(db, user.id, inventory); recordEvent(db, user.id, null, 'FETCH', `${inventory.devices.length} devices synchronized`); json(res, 200, inventory); }
      catch (error) { const cached = snapshotFor(db, user.id); json(res, cached ? 200 : 502, cached ? { ...cached, warning: error.message } : { error: error.message }); }
      return true;
    }
    if (req.method === 'POST' && url.pathname === '/api/redfinger/sync') {
      const inventory = normalizeInventory(await bridgeRequest('/v1/inventory?refresh=1')); saveSnapshot(db, user.id, inventory); recordEvent(db, user.id, null, 'FETCH', `${inventory.devices.length} devices synchronized manually`); json(res, 200, inventory); return true;
    }
    if (req.method === 'GET' && url.pathname === '/api/redfinger/events') {
      const deviceId = cleanText(url.searchParams.get('deviceId'), 220);
      const events = deviceId ? db.prepare('SELECT id,device_id AS deviceId,event_type AS type,message,created_at AS createdAt FROM redfinger_events WHERE user_id=? AND device_id=? ORDER BY id DESC LIMIT 200').all(user.id, deviceId) : db.prepare('SELECT id,device_id AS deviceId,event_type AS type,message,created_at AS createdAt FROM redfinger_events WHERE user_id=? ORDER BY id DESC LIMIT 200').all(user.id);
      json(res, 200, { events }); return true;
    }
    const commandMatch = url.pathname.match(/^\/api\/redfinger\/devices\/([^/]+)\/commands$/);
    if (req.method === 'POST' && commandMatch) {
      const deviceId = decodeURIComponent(commandMatch[1]), body = await readBody(req), action = cleanText(body.action, 20);
      if (!['reboot', 'renew'].includes(action)) { json(res, 400, { error: 'Unsupported Redfinger command.' }); return true; }
      if (body.confirmDeviceId !== deviceId) { json(res, 400, { error: 'Device confirmation did not match.' }); return true; }
      const snapshot = snapshotFor(db, user.id), device = snapshot?.devices?.find(item => item.id === deviceId);
      if (!device) { json(res, 404, { error: 'Refresh the inventory before sending a command.' }); return true; }
      if (!snapshot.capabilities?.[action]) { json(res, 409, { error: `${action} is not enabled by the Redfinger bridge.` }); return true; }
      const result = await bridgeRequest(`/v1/devices/${encodeURIComponent(device.deviceCode)}/commands`, { method: 'POST', body: JSON.stringify({ action, identity: { padCode: device.deviceCode, padId: device.padId, userPadId: device.userPadId }, confirmation: device.id }) });
      recordEvent(db, user.id, device.id, 'COMMAND', `${action} accepted for ${device.name}`); json(res, 202, { accepted: true, result }); return true;
    }
    const captureMatch = url.pathname.match(/^\/api\/redfinger\/devices\/([^/]+)\/capture$/);
    if (req.method === 'POST' && captureMatch) {
      const deviceId = decodeURIComponent(captureMatch[1]), snapshot = snapshotFor(db, user.id), device = snapshot?.devices?.find(item => item.id === deviceId);
      if (!device) { json(res, 404, { error: 'Refresh the inventory before requesting a capture.' }); return true; }
      if (!snapshot.capabilities?.capture) { json(res, 409, { error: 'Passive capture is not enabled by the Redfinger bridge.' }); return true; }
      const result = await bridgeRequest(`/v1/devices/${encodeURIComponent(device.deviceCode)}/capture`, { method: 'POST', body: JSON.stringify({ identity: { padCode: device.deviceCode, padId: device.padId, userPadId: device.userPadId }, passive: true }) });
      recordEvent(db, user.id, device.id, 'CAPTURE', `Passive capture refreshed for ${device.name}`); json(res, 200, { imageUrl: cleanText(result.imageUrl, 2000), capturedAt: cleanText(result.capturedAt, 40) }); return true;
    }
    json(res, 404, { error: 'Redfinger endpoint not found.' }); return true;
  };
}
