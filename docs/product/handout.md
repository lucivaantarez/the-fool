# SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION

> **Purpose of this document:** a fully self-contained brief for another AI. It contains the entire architecture, every data model field, every hard rule, every constant with its exact value, every function contract, all known issues, all failed approaches, and the exact parse/format/health logic. An AI reading only this document should be able to understand, modify, or rebuild the vault without ever seeing the source file.

---

## 0. TL;DR — WHAT THIS IS

Saturnity Vault is a **single-file HTML5 + CSS3 + vanilla JavaScript (ES2020+)** web app with **zero dependencies** (Google Fonts CDN for display only). It stores, organizes, and retrieves **Roblox authentication cookie strings** in the browser's `localStorage`, grouped by user-defined group names and server names. No build step. No mandatory server. Open the file directly in any modern browser.

- **Current version:** v2.9 (internal spec header still references v4.7-era architecture; the version *numbering* was rebased — treat the feature set below as authoritative, not the header's "v4.7" labels)
- **Storage:** `localStorage` (primary) + optional GitHub Gist (remote sync)
- **Security gate:** hardcoded PIN `180801`
- **Architecture:** monolithic single-file SPA, imperative DOM manipulation, loose MVC (vault array = Model, `render()`/`mkCard()` = View, event listeners = Controller). No reactivity layer — all UI updates are manual DOM ops.

---

## 1. WHAT IT DOES / DOES NOT DO

### Responsible for
- Storing/organizing/retrieving Roblox auth cookie strings in `localStorage`, grouped by user-defined names + server names.
- Parsing raw cookie lines in these three formats:
  - `username:password:_|WARNING:-DO-NOT-SHARE-THIS.<cookie>`
  - `username:_|WARNING:-DO-NOT-SHARE-THIS.<cookie>`
  - `_|WARNING:-DO-NOT-SHARE-THIS.<cookie>`
- All CRUD on groups, cookies within groups, and cookie alternatives.
- Exporting vault as `.json` (full vault) or `.txt` (per-group cookie lines).
- Importing + smart-merging vault data from `.json` or `.txt`.
- Rendering full UI: PIN lock screen, sidebar, card grid, slide-out detail panel, modals, toasts, quick-copy popup, filter bar, ban checker terminal, GitHub sync dot.
- Tracking a daily-open streak + backup reminder.
- PIN lock with decoy PIN support and lockout on repeated failures.
- Optional GitHub Gist sync (user-provided PAT + Gist ID).
- Ban checking cookies via user-provided Cloudflare Worker URLs.
- Calculating + displaying a vault health score.

### NOT responsible for
- Authentication against any external service.
- Fetching/refreshing cookies from the network.
- Encrypting data at rest (localStorage is plaintext; Gist is plaintext too — use a secret Gist, rotate PATs).
- Operating the Cloudflare Worker (user deploys their own).
- Filtering banned groups from exports (ban is visual/annotation only).
- Exporting alternative cookie sets via `expTxt()` (only main cookies export).
- Making alternatives reachable via Quick Copy (detail panel only).

---

## 2. DATA MODELS (EXACT)

### Group
```
Group {
  id          : string   — base36(Date.now()) + random 3-char suffix. NEVER reused.
  name        : string   — Max 40 chars.
  serverName  : string|null — Max 60 chars.
  createdAt   : number   — Unix ms.
  pinned      : boolean
  banned      : boolean  — Visual flag ONLY; does NOT affect exports.
  alternatives: Alt[]
  cookies     : Cookie[]
  changelog   : ChangeEntry[]  — Capped at 30 entries.
  pc          : number   — [OPTIONAL] Panel column preference (1–3).
  lastChecked : number   — [OPTIONAL] Unix ms of last ban check on this group.
}
```

### Cookie
```
Cookie {
  username    : string|null
  password    : string|null
  cookie      : string   — MUST start with COOKIE_PFX (see constants).
  banStatus   : string   — [OPTIONAL] set by ban checker: 'banned'|'expired'|'facelock'
                           (ban-status display also recognizes 'active')
}
```
**Note:** v2.9 cookies may also carry a **timeline** of entries (added via `addCookieTimelineEntry(cookie, type, msg)`), used by the "Move matched" feature to log per-cookie history (e.g. a `'moved'` entry). Treat timeline as an optional array on the cookie object.

### Alt (alternative cookie set)
```
Alt {
  id      : string   — base36(Date.now()) + random 3-char suffix.
  label   : string   — Max 40 chars.
  cookies : Cookie[]
}
```

### ChangeEntry
```
ChangeEntry {
  t   : number   — Unix ms.
  msg : string   — TRUSTED HTML string. NEVER raw user input.
}
```

### Settings (stored separately from vault)
```
Settings {
  vaultName       : string
  firstCreated    : number      — Unix ms; preserved by spread merge.
  lastOpen        : string|null — toDateString()
  lastBackup      : number|null
  cardSize        : 'sm'|'md'|'lg'
  streak          : number
  lastGithubSync  : number|null — Unix ms of last successful Gist sync.
}
```

---

## 3. CONSTANTS (EXACT VALUES — DO NOT GUESS)

```javascript
// Cookie detection sentinel — LOAD-BEARING. Roblox cookies always start with this.
const COOKIE_PFX = '_|WARNING:-DO-NOT-SHARE-THIS.';

// Hardcoded real PIN. NEVER stored in localStorage, settings, or comments.
const REAL_PIN = '180801';

// localStorage key names
const SK      = 'saturnity_vault_v1';   // JSON(Group[])
const CK      = 'cv_cols';              // string 1–4
const SORT_K  = 'cv_sort';             // 'az'|'za'|'newest'|'most'
const SET_K   = 'cv_settings';          // JSON(Settings)

// Active-config resolution (multi-vault support)
// SK_ACTIVE = 'saturnity_vault_' + (localStorage 'cv_active_config' || 'default')
// On load, if the default vault is empty, the code scans all 'saturnity_vault_*'
// keys and adopts the one with the most entries as SK_ACTIVE (safety net).

// Changelog cap per group
// (ChangeEntry array capped at 30 in logChange())

// Ban-checker terminal log cap
const CKLOG_MAX = 1000;

// Color palette — 10 entries, indexed by hash(serverName) % 10. NEVER reorder.
const PALETTE = [
  {c:'#00d4ff', r:'0,212,255'},   // 0
  {c:'#7b2fff', r:'123,47,255'},  // 1
  {c:'#00ffaa', r:'0,255,170'},   // 2
  {c:'#ff6b00', r:'255,107,0'},   // 3
  {c:'#ff3060', r:'255,48,96'},   // 4
  {c:'#ffaa00', r:'255,170,0'},   // 5
  {c:'#00aaff', r:'0,170,255'},   // 6
  {c:'#ff00aa', r:'255,0,170'},   // 7
  {c:'#aaff00', r:'170,255,0'},   // 8
  {c:'#aa00ff', r:'170,0,255'},   // 9
];
```

### All localStorage keys
| Key | Value |
|---|---|
| `saturnity_vault_v1` | `JSON(Group[])` — main vault (also `saturnity_vault_<configId>` for multi-vault) |
| `cv_active_config` | active config id (default `'default'`) |
| `cv_cols` | string `'1'`–`'4'` (column count) |
| `cv_sort` | `'az'`\|`'za'`\|`'newest'`\|`'most'` |
| `cv_settings` | `JSON(Settings)` |
| `cv_pin_fails` | string(number) — PIN failure counter |
| `cv_pin_lock_until` | string(timestamp) — PIN lockout expiry |
| `cv_decoy_pin` | string — decoy PIN digits (plaintext, user-set) |
| `cv_gh_pat` | string — GitHub PAT (stored SEPARATELY, never in settings JSON, never in export) |
| `cv_gh_gist` | string — Gist ID |
| `cv_gh_enabled` | `'1'`\|`'0'` |
| `cv_worker_urls` | `JSON(string[])` — CF Worker URLs (up to 3) |

### JSON export wrapper (CONTRACTUAL — never change shape)
```json
{ "version": 1, "exported": <unix_ms>, "vault": [ /* Group[] */ ] }
```
Import handlers check `d.vault` is an Array. **Never rename `vault`. Never include `cv_gh_pat`.**

### Cloudflare Worker expected API (user deploys this)
```
POST <worker_url>
Body:     { cookie: string, username: string }
Response: { status: 'active'|'banned'|'expired'|'facelock', duration?: string, error?: string }
Timeout:  10 seconds (AbortSignal.timeout(10000))
```

### GitHub Gist API (sync)
- Sync write: `PATCH https://api.github.com/gists/<gist_id>` with header `Authorization: token <PAT>`, body = full vault JSON as file content.
- Test connection: `GET https://api.github.com/gists/<gist_id>` with PAT.

---

## 4. HARD RULES (NEVER VIOLATE)

- **[RULE-01]** `COOKIE_PFX` is the SOLE cookie detection sentinel. Never change, shorten, or make configurable. `parseLine()` returns `null` for any line without it.
- **[RULE-02]** `vault[]` is the single source of truth. Mutate it, then call `saveVault()` immediately. Never render from any other source.
- **[RULE-03]** Group IDs are never reused. Sync-vault merge uses ID equality. Changing ID generation breaks all existing saved vaults.
- **[RULE-04]** All user strings rendered into innerHTML MUST go through `esc()` (group.name, serverName, alt.label, username, cookie in display). `esc()` does NOT escape single quotes — use double-quote HTML attribute delimiters when interpolating.
- **[RULE-05]** Changelog entries cap at 30 per group (`logChange()`). Never remove the cap — unbounded growth causes localStorage quota errors.
- **[RULE-06]** `saveVault()` MUST start with `if(decoyMode)return;`. In decoy mode the real vault must NEVER be written. Do not move or bypass this guard.
- **[RULE-07]** `saveVault()` surfaces `QuotaExceededError` as an `'err'` toast. Do not re-silence. Do not retry inside `saveVault()`.
- **[RULE-08]** `customConfirm()` is async and MUST be awaited. Never replace with `window.confirm()` (removed v3.1).
- **[RULE-09]** `pending[]` must be populated by `openAddModal()` before `confirmAdd()` or `mergeIntoGroup()` is called.
- **[RULE-10]** Per-server group limit is **18**. Enforced only in `confirmAdd()`.
- **[RULE-11]** All modals use `openMod(id)`/`closeMod(id)` only. Never set `display` directly on `.m-ov` elements.
- **[RULE-12]** JSON export wrapper shape is contractual: `{version:1, exported:<ms>, vault:Group[]}`. All import handlers check `d.vault` as Array. Never rename `vault`.
- **[RULE-13]** `import-f` (.json) and `update-f` (sync) are DISTINCT: import-f prepends new groups (no review); update-f opens review modal (or updates by username for .txt).
- **[RULE-14]** `vault[]` is only fully reassigned during purge, delete, and json-import. Every reassignment must immediately call `saveVault()`. All other mutations use in-place array methods.
- **[RULE-15]** `mkCkItem` edit save MUST route to correct cookie array: `opts.isAlt` + valid `altIdx` → `g.alternatives[altIdx].cookies[i]`; otherwise → `g.cookies[i]`. Never bypass this branch. (This is the v4.6 fix for critical BUG-01.)
- **[RULE-16]** Copy button in `mkCkItem` MUST call `getCopyFmt()` on every click. Never pre-compute a static `copyFmt` (goes stale after edits).
- **[RULE-17]** `REAL_PIN` (`'180801'`) must NEVER be stored anywhere — not localStorage, not settings, not a nearby comment. Exists only as the constant at the top of the script. Decoy PINs ARE stored plaintext in `cv_decoy_pin` (intentional; they protect nothing and the real PIN isn't derivable from them).
- **[RULE-18]** `decoyMode` must propagate to every vault mutation path. `saveVault()` has the guard. Any new direct `localStorage.setItem(SK,...)` must also check `decoyMode` (currently there are ZERO such calls).
- **[RULE-19]** GitHub PAT stored in `cv_gh_pat` separately from settings JSON. Never include in exported vault JSON. Never log in any toast/console message.
- **[RULE-20]** CF Worker round-robin: `banWorkerIdx` increments after each use AND after each network error (skips a failed worker on next request).
- **[RULE-21]** `#powerdown` exists in HTML+CSS (CRT shutoff animation) but has no JS trigger. Do not remove — reserved for future feature.
- **[RULE-22]** `PALETTE` (10 entries) must not be reordered. `hash % 10` assigns colors — reordering re-colors all existing groups.

---

## 5. SOFT GUIDELINES

- **[GUIDE-01]** Prefer partial DOM updates over full `render()` for single-card changes (pin, ban, cookie count). Use `render()` only when structure changes (groups added/removed, server renamed).
- **[GUIDE-02]** New Group fields: initialize in `confirmAdd()`, add defensive fallback (`||default`) at every read site, update DATA MODELS.
- **[GUIDE-03]** Toast types: `'ok'` (green), `'warn'` (yellow), `'err'` (red) only.
- **[GUIDE-04]** New detail panel sections live inside `#p-scroll`, not `.detail-panel` root.
- **[GUIDE-05]** Do not reorder PALETTE. New colors can be appended (increment modulus; currently 10).
- **[GUIDE-06]** Animation durations: card entrance stagger 30ms/card, delete 350ms, new-glow 3s, fly-in 400ms, stat counter 500ms, PIN glitch 500ms, sync dot pulse 1s.
- **[GUIDE-07]** New persistent settings: add to `defSettings()` with a default. `loadSettings()` spread merge is backwards-compatible.
- **[GUIDE-08]** `flavorCount()` strings are intentional flavor text. Do not replace.
- **[GUIDE-09]** For alt cookies, always pass BOTH `opts.isAlt:true` AND `opts.altIdx:N` to `mkCkItem()`. Never one only.
- **[GUIDE-10]** Ban checker logs use `btLog(msg, type)` — never write to `bt-log` div directly.
- **[GUIDE-11]** GitHub sync errors: update sync dot to `'err'` AND set `ghPendingSync=true` so next `saveVault()` retries. Never clear `ghPendingSync` without a confirmed success.
- **[GUIDE-12]** Health score max 100, min 0. Grade thresholds: A≥90, B≥75, C≥60, D≥45, F<45.

---

## 6. AI INSTRUCTIONS (from the file's own header)

- **[AI-01]** `vault[]` is sacred. Every mutation MUST be followed by `saveVault()` (which guards decoyMode + calls `scheduleGhSync()`).
- **[AI-02]** All user strings into innerHTML MUST use `esc()`. `esc()` does NOT escape single quotes — use double-quote attributes.
- **[AI-03]** Do not split into multiple files. Single-file is required.
- **[AI-04]** New Group fields: default in `confirmAdd()`, fallback at read sites, update DATA MODELS.
- **[AI-05]** `mkCkItem` edit save MUST branch on `opts.isAlt` (RULE-15). Do not "simplify."
- **[AI-06]** `mkCkItem` copy button MUST use `getCopyFmt()` each click (RULE-16).
- **[AI-07]** No framework patterns. Vanilla JS + imperative DOM only.
- **[AI-08]** `COOKIE_PFX` is a load-bearing sentinel. Never change (RULE-01).
- **[AI-09]** New modals: HTML class `"m-ov"` auto-closes on backdrop click via existing global listener. Use `openMod`/`closeMod` only.
- **[AI-10]** Detail panel additions belong inside `#p-scroll`.
- **[AI-11]** PALETTE must not be reordered (RULE-22).
- **[AI-12]** No additional network requests without user config + explicit user action. No silent telemetry/background fetches.
- **[AI-13]** `buildAltSection`/`rebuildEntries` uses closure over g, body, head, chev. Don't break closure refs. `body.innerHTML` cleared at top of each `rebuildEntries()` — all inner listeners re-created fresh.
- **[AI-14]** `logChange()` accepts trusted HTML strings only — never raw user input.
- **[AI-15]** Three file handlers (`#import-f`, `#import-tf`, `#update-f`) have completely different behaviors. Do not conflate (RULE-13).
- **[AI-16]** JSON export wrapper is contractual. Never include `cv_gh_pat` (RULE-19, FAILED-09).
- **[AI-17]** `saveVault()` decoyMode guard at TOP (RULE-18). New direct `setItem(SK,...)` must also check decoyMode.
- **[AI-18]** GitHub PAT must never appear in toasts, console, exported JSON, or any visible UI (RULE-19).
- **[AI-19]** `btLog()` messages are NOT HTML-escaped. Only pass internally-generated strings; `esc()` first if interpolating cookie/username.
- **[AI-20]** Alt cookies: pass BOTH `opts.isAlt:true` AND `opts.altIdx:N` (GUIDE-09).
- **[AI-21]** `applyFilter()` composites `activeFilter` AND search query. New filter dimensions must be `data-*` attrs on `.gcard` (set in `mkCard`).
- **[AI-22]** This documentation header must be updated whenever functions/fields/bugs/rules/version change.

---

## 7. STATE VARIABLES (module-level)

```
vault[]            — Array of Group objects. Source of truth.
pending[]          — Staged cookies for add-group modal.
panelId            — ID of currently open detail panel group.
bulkGroups[]       — Groups staged for bulk export modal.
bulkLabel          — Label for bulk export modal.
lastDeleted        — {group, index} for undo.
undoTimer          — setTimeout handle for 5s undo window.
cols               — Column count (1–4), persisted.
sort               — 'az'|'za'|'newest'|'most', persisted.
settings           — Settings object, persisted separately.
qcGroupId          — Group ID for open quick-copy popup.
activeSrv          — Active sidebar server filter key.
staggerTimers[]    — Handles for card entrance animation.
confirmResolve     — Promise resolver for custom confirm modal.
updateCandidates[] — Staged groups for sync-vault modal.
ccache{}           — Color cache: server name → PALETTE entry.
pinBuffer          — Digits typed so far on PIN screen.
pinFails           — Count of failed PIN attempts this session.
pinLocked          — Boolean: PIN input locked out?
pinLockUntil       — Timestamp when lockout expires.
decoyMode          — Boolean: decoy PIN entered; vault appears empty.
ghPendingSync      — Boolean: a sync is queued (offline or failed).
ghDebounceTimer    — setTimeout handle for 3s GitHub sync debounce.
banCheckRunning    — Boolean: ban check in progress.
banCheckAbort      — Boolean: abort signal for running check.
banWorkerIdx       — Round-robin index for worker URL selection.
banFailedCookies[] — Cookies flagged during ban check for export.
activeFilter       — 'all'|'pinned'|'banned'|'alts'|'empty'.

// v2.9 Bulk-Lookup "Move matched" state:
_blMatched[]       — [{username, group, cookie}] matched in bulk lookup.
_blMissing[]       — usernames not found.
_blMoveSelectedId  — target group id chosen in move modal.
_blMoveNewGroup    — Boolean: create a new dated group as target.
```

---

## 8. EXACT LOGIC (the parts most likely to be re-implemented wrong)

### parseLine(line) → Cookie|null
```javascript
function parseLine(line){
  line=line.trim(); if(!line) return null;
  const i=line.indexOf(COOKIE_PFX); if(i===-1) return null;
  const cookie=line.substring(i), pre=line.substring(0,i).replace(/:$/,'');
  if(!pre) return {username:null, password:null, cookie};
  const ci=pre.indexOf(':');
  if(ci===-1) return {username:pre, password:null, cookie};
  return {username:pre.substring(0,ci), password:pre.substring(ci+1), cookie};
}
function parseInput(txt){ return txt.split('\n').map(parseLine).filter(Boolean); }
```

### fmtLine(c, fmt) → string
Format keys: `'username'`, `'cookie'`, `'user:cookie'`, `'user:pass'`, `'user:pass:cookie'`.
```javascript
function fmtLine(c,fmt){
  if(fmt==='username') return c.username||'';
  if(fmt==='cookie')   return c.cookie;
  if(fmt==='user:cookie') return c.username ? `${c.username}:${c.cookie}` : c.cookie;
  if(fmt==='user:pass')   return (c.username&&c.password) ? `${c.username}:${c.password}` : (c.username||'');
  if(fmt==='user:pass:cookie'){
    if(c.username&&c.password) return `${c.username}:${c.password}:${c.cookie}`;
    if(c.username)             return `${c.username}:${c.cookie}`;
    return c.cookie;
  }
  return '';
}
```

### getCopyFmt() — smart copy format (per cookie)
```javascript
// u:p:c if both username+password, u:c if username only, else raw cookie
function getCopyFmt(){ return c.username&&c.password ? 'u:p:c' : c.username ? 'u:c' : 'cookie'; }
```

### expTxt(g) — per-group .txt export (main cookies only; alts omitted — ISSUE-04)
```javascript
function expTxt(g){
  const lines=g.cookies.map(c=>fmtLine(c,'user:pass:cookie'));
  dl(lines.join('\n'), sf(g.name)+'.txt');
}
```

### esc(s) — HTML escape (NOTE: does NOT escape single quotes)
```javascript
function esc(s){ if(!s)return''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
```

### calcHealthScore() → {score, grade}
```javascript
function calcHealthScore(){
  if(!vault.length) return {score:0, grade:'F'};
  let score=100;
  // Backup recency (up to −25)
  const last=settings.lastBackup;
  const backupAge=last ? Math.floor((Date.now()-last)/86400000) : 999;
  if(backupAge===999||backupAge>30) score-=25;
  else if(backupAge>7) score-=15;
  else if(backupAge>3) score-=8;
  else if(backupAge>1) score-=3;
  // Ban ratio (up to −20)
  const bannedCount=vault.filter(g=>g.banned).length;
  score-=Math.round((bannedCount/vault.length)*20);
  // Empty groups (up to −20)
  const emptyCount=vault.filter(g=>!g.cookies||g.cookies.length===0).length;
  score-=Math.round((emptyCount/vault.length)*20);
  // Streak bonus (up to +15)
  score+=Math.min(15, Math.floor((settings.streak||0)/2));
  // GitHub sync freshness (up to +10)
  if(ghEnabled()){
    const syncAge=settings.lastGithubSync ? Math.floor((Date.now()-settings.lastGithubSync)/86400000) : 999;
    if(syncAge<=1) score+=10; else if(syncAge<=3) score+=5;
  }
  score=Math.max(0, Math.min(100, score));
  const grade = score>=90?'A' : score>=75?'B' : score>=60?'C' : score>=45?'D' : 'F';
  return {score, grade};
}
```

### Group ID generation
```javascript
id = Date.now().toString(36) + Math.random().toString(36).slice(2,5);
```

### "Move matched" (v2.9 Bulk Lookup feature)
Flow: Bulk Lookup matches pasted usernames against all cookies in the vault → populates `_blMatched[] = [{username, group, cookie}]`. When matches exist, three buttons appear (Copy / Export / **Move matched**). "Move matched" opens a modal listing all **non-banned** groups plus a dashed **"+ New group (today's date dd/mm/yy)"** option.

On confirm:
- If new group: create `{id, name:"dd/mm/yy", serverName:null, banned:false, pinned:false, createdAt:Date.now(), alternatives:[], cookies:[], changelog:[]}`, push to vault, `logChange(target,'Created from bulk lookup move')`.
- For each matched cookie: skip if source group === target; else `splice` from source `cookies[]`, call `addCookieTimelineEntry(ck,'moved',...)`, push to target `cookies[]`.
- If moved>0: `logChange(target, 'Received N cookies via bulk lookup move')`.
- Then `saveVault(); render();` clear bulk lookup UI state, reset `_blMatched`/`_blMissing`, toast success.

---

## 9. FUNCTION REFERENCE (contracts)

### PIN Lock
- `initPin()` — sets vault name on PIN screen, wires keypad + keyboard (0–9, Backspace, Escape), calls `checkPinLock()`. Must run AFTER `render()`.
- `checkPinLock()` — reads `cv_pin_lock_until` + `cv_pin_fails`; if lockout active, sets `pinLocked=true` and calls `showPinLockCountdown()`.
- `showPinLockCountdown()` — 500ms polling loop updating `#pin-lock-msg`; clears lockout + removes key on expiry.
- `handlePinKey(v)` — `v` ∈ `'0'`–`'9'`|`'del'`|`'clear'`. Appends (max 6). At 6 digits → `submitPin()`.
- `updatePinDots()` — toggles `.filled` on `.pin-dot` by `pinBuffer.length`.
- `submitPin()` — compares to `REAL_PIN` and `cv_decoy_pin`. Real → clear fails, hide screen, `decoyMode=false`. Decoy → hide screen, `decoyMode=true`, `render()` (empty). Wrong → increment `pinFails`, save, lockout (≥3:30s, ≥5:120s), glitch+shake, show fail count. Buffer always cleared after submit.

### GitHub Gist Sync
- `ghEnabled()` → boolean (PAT + Gist ID + enabled flag all set).
- `scheduleGhSync()` — sync dot 'syncing', reset 3s debounce → `doGhSync()`. No-op if `!ghEnabled()`.
- `doGhSync()` [async] — offline → dot 'queue' + `ghPendingSync=true` + return. Else PATCH Gist with full vault JSON. Success → dot 'ok', save `lastGithubSync`, clear `ghPendingSync`. Failure → dot 'err', `ghPendingSync=true`, toast.
- `testGhConnection()` [async] — GET Gist with PAT; ok/error toast; no localStorage writes.

### Settings
- `openVaultSettings()` — populate modal from localStorage, open.
- `saveVaultSettings()` — validate decoy PIN (4–8 digits, must differ from REAL_PIN); write PAT/Gist ID/enabled/worker URLs/decoy PIN; update sync dot + worker status; close with success toast.

### Filter + Health
- `applyFilter()` — iterate `.gcard`; hide based on `activeFilter` (`data-pinned/banned/alts/empty`) AND search query (composited); toggle `dim`. Called via `setTimeout(applyFilter,20)` after render, on search input, on filter pill click.
- `calcHealthScore()` → `{score, grade}` (see §8).
- `updateHealthScore()` — updates `#health-score` + `#health-grade` (+ grade class).

### Ban Checker Terminal
- `getWorkerUrls()` → `string[]` from `cv_worker_urls` (empties filtered).
- `openBanTerminal()` / `closeBanTerminal()` — toggle `open` on `#ban-terminal-ov`; close sets `banCheckAbort=true`.
- `btLog(msg, type)` — `type` ∈ `'info'|'ok'|'ban'|'warn'|'facelock'|'err'|'muted'`. Timestamped, auto-scroll. NOT HTML-escaped (internal strings only). Log capped at `CKLOG_MAX=1000`.
- `btSetProgress(cur, total)` — updates `#bt-progress`.
- `callWorker(url, cookie, username)` [async] → `{status, duration?}`. POST, 10s timeout, throws on non-ok.
- `runBanCheck()` [async] — reads worker URLs + `bt-skip-banned` + `bt-all-groups`. For each group/cookie: `url=urls[banWorkerIdx % urls.length]; banWorkerIdx++`; `callWorker()` with 120ms inter-request delay; classify + log + count; push banned/expired/facelock to `banFailedCookies[]`; on error increment `banWorkerIdx` again + log. Respects `banCheckAbort` at top of inner loop. On completion, enable export if `banFailedCookies.length>0`. Snapshots vault at call time; resets `banFailedCookies` each run.

### Storage / Core
- `getColor(name)` — hash → PALETTE entry, memoized in `ccache{}`.
- `loadSettings()` — `{...defSettings(), ...stored}`; preserves `firstCreated`.
- `defSettings()` — defaults object.
- `saveSettings()` — JSON → `cv_settings` (no error handling; small).
- `saveVault()` — `if(decoyMode)return;` → localStorage write → `scheduleGhSync()`. QuotaExceededError → 'err' toast.
- `loadVault()` — parse vault key, silent on error.
- `updateStreak()` — daily-open counter (open-based).
- `customConfirm(msg, label)` → `Promise<boolean>` (must await; one dialog at a time).
- `openMod(id)` / `closeMod(id)` — class toggle only; backdrop auto-close wired globally.
- `openAddModal(parsed, prefillName)` — stage `pending[]`, open add-modal.
- `mergeIntoGroup(groupId)` — push `pending[]` non-dupes into target.
- `confirmAdd()` — create group (id, name, serverName, createdAt, pinned:false, banned:false, alternatives:[], cookies, changelog:[]). Enforces 18-group server limit.
- `openUpdateModal(incoming)` / `makeSection()` / `commitUpdate()` — sync-vault review flow.
- `sortVault(arr)` — pinned-first, then sort key. Non-mutating.
- `buildSidebar()` — rebuild server items in `#sb-nav`.
- `render()` — full vault DOM rebuild + `buildSidebar` + `updateHealthScore` + `applyFilter`.
- `mkGrid()` / `mkCard(group)` — card builder; sets `data-pinned/banned/alts/empty`.
- `flavorCount(n)` — flavor text for cookie count.
- `openPanel(id)` / `closePanel()` / `refreshPanel()` — detail panel lifecycle.
- `refreshChangelog(g)` — append `.ck-changelog` to `#p-scroll` bottom.
- `buildAltSection(g)` — collapsible alternatives section with `rebuildEntries()`.
- `mkCkItem(c, i, gid, opts)` — cookie item: blur reveal, `getCopyFmt()`, edit form. Edit save routes by `opts.isAlt`.
- `saveEdit()` — patch group name/server; full render if server changed.
- `openQC(groupId, anchor)` / `closeQC()` — quick-copy popup (main cookies only).
- `openBulk(label, groups)` / `showStats()` / `animStats()` / `aNum()` — export/stats UI.
- `delGroup(id)` — animated delete, single 5s undo slot.
- `buildChangelogModal()` — render `APP_CHANGELOG` into `#cl-scroll`.
- `logChange(group, msg)` — append ChangeEntry, cap 30. Trusted HTML only.
- Helpers: `fmtTime(ts)`, `copyText()`, `fallbackCopy()`, `esc(s)`, `sf(n)` (safe filename), `dl(content, filename)`, `toast(msg, type)`.

---

## 10. KNOWN ISSUES (design decisions, not bugs)

- **[ISSUE-04]** `expTxt()` exports only main `g.cookies[]`. Alternatives silently omitted.
- **[ISSUE-08]** Single undo slot. Two rapid deletes lose the first undo.
- **[ISSUE-09]** Ban flag does not filter exports. Intentional annotation-only.
- **[ISSUE-10]** All ungrouped groups share `PALETTE[0]`. Hash collision possible.
- **[ISSUE-12]** Quick Copy only accesses main `g.cookies[]`. Alts need detail panel.
- **[ISSUE-13]** Ban checker uses `banCheckAbort` (cooperative), not per-fetch AbortController. A hung 10s request can't be interrupted mid-request.
- **[ISSUE-14]** `decoyMode` is runtime-only. Closing/reopening the tab shows real vault after real PIN (decoy does not persist — by design).
- **[ISSUE-15]** PAT stored plaintext in `cv_gh_pat`. Deliberate trade-off. Use `gist`-scoped PATs, rotate periodically.
- **[ISSUE-16]** Health sync factor awards points only if `ghEnabled()` at calc time.

---

## 11. FAILED APPROACHES (DO NOT RETRY)

- **[FAILED-01]** `window.confirm()` — removed v3.1 (blocks thread, un-styleable).
- **[FAILED-02]** PIN in localStorage as hash — trivially bypassed by clearing storage. Real PIN is now hardcoded. Do not revert.
- **[FAILED-03]** Per-cookie tag buttons — removed v4.0; replaced by smart copy.
- **[FAILED-04]** Canvas-based animations — removed v3.1 (perf).
- **[FAILED-05]** Per-group color picker — avoided; deterministic hash is simpler.
- **[FAILED-06]** innerHTML for blur spans — need DOM nodes for per-element listeners.
- **[FAILED-07]** Static copyFmt closure — stale after inline edits (fixed v4.6).
- **[FAILED-08]** Per-request AbortController in ban checker — adds complexity with shared `banWorkerIdx`; simple timeout + cooperative flag is enough.
- **[FAILED-09]** Storing PAT in settings JSON — would leak PAT in every export. Kept in `cv_gh_pat`.

---

## 12. EXPECTED BEHAVIORS (input → output)

- Open file → PIN lock screen shown; `#app` rendered underneath (hidden).
- Enter `180801` → PIN fades, real vault loads, `decoyMode=false`.
- Enter configured decoy PIN → PIN fades, `render()` shows EMPTY vault, `decoyMode=true`, `saveVault()` no-op for the session; real data untouched.
- Wrong PIN ×3 → glitch+shake each fail; 30s lockout; `#pin-lock-msg` counts down; input disabled.
- Wrong PIN ×5+ → 120s lockout; fail count in error text.
- `saveVault()` online + sync enabled → dot 'syncing' immediately; after 3s → PATCH Gist; success dot 'ok'; failure dot 'err' + toast.
- `saveVault()` offline → dot 'queue' + `ghPendingSync=true`; on 'online' event → retry.
- Ban check, 2 workers, Worker 1 fails → `banWorkerIdx` +2 (use + failure); next cookie uses Worker 2; error logged.
- Click "export failed" after ban check → `banFailedCookies[]` (banned+expired+facelock) exported as `u:p:c` `.txt`.
- Click filter "Banned" → non-banned cards get `dim` (opacity 0.15, no pointer events); banned stay; search composited on top.
- Filter pill + search → card must match BOTH.
- Vault health badge → score 0–100 + grade A–F from backup age, ban ratio, empty groups, streak, GitHub sync freshness.
- Export vault JSON with sync enabled → JSON does NOT contain PAT.

---

## 13. UI SURFACES (present in the app)

PIN lock screen (6-digit keypad + keyboard) · sidebar (server nav / command dock) · card grid (3 sizes sm/md/lg via `body[data-csize]`, 1–4 columns via `--cols`) · slide-out detail panel (`#p-scroll` scroll region) · modals (`.m-ov`, backdrop auto-close) · toast notifications (ok/warn/err) · quick-copy popup (main cookies only) · filter bar (All / Pinned / Banned / Has Alts / Empty pills) · ban checker terminal (slide-up, live log) · GitHub sync dot (off / syncing / ok / err / queue) · vault health badge · Cookie Extractor + Bulk Lookup (with Move matched) input tools.

CSS: single `<style>` block, CSS custom properties in `:root`, dark theme only (no light mode), responsive breakpoint at ≤600px (hides sidebar + stat chips). Fonts: `Share Tech Mono` + `Rajdhani` (display only). Card colors from `getColor(serverName)` → PALETTE.

---

## 14. DEPENDENCIES

- **External (CDN, load-time only):** Google Fonts — `Share Tech Mono`, `Rajdhani`.
- **External (runtime, optional, user-initiated):** GitHub Gist API (`https://api.github.com/gists/`, PATCH/GET only, when sync configured); user-provided Cloudflare Worker URLs (only during ban check). No data sent without explicit user action.
- **Internal:** none. Self-contained single file.
- **Browser APIs:** localStorage · `navigator.clipboard.writeText()` (async, secure ctx) · `document.execCommand('copy')` (fallback) · FileReader · `requestAnimationFrame` · `fetch()` + `AbortSignal.timeout()` · `navigator.onLine` + `'online'` event · `data:` URI download · CSS `backdrop-filter` · `CSS.escape()`.

---

## 15. VERSION HISTORY (condensed)

- **v2.9 (current)** — ADD "Move matched" in Bulk Lookup: appears with Copy/Export when matches exist; modal lists non-banned groups + dashed "+ New group (dd/mm/yy)"; matched cookies spliced from source into target with timeline entries logged.
- **v4.7-era feature set** — PIN lock (6-digit keypad, decoy PIN, 30s/120s lockout, glitch/shake, refresh-surviving lockout); GitHub Gist auto-sync (separate PAT+Gist, 3s debounce, sync dot, offline queue, test button); ban checker terminal (CF Worker round-robin up to 3, active/banned/expired/facelock, skip-banned, 120ms delay, failed-worker rotation, export flagged as u:p:c .txt); filter bar (5 pills, composited with search, data-* attrs); vault health score (0–100, A–F); Vault Settings modal; sidebar commands.
- **v4.6** — bug fixes: alt cookie edit routing (BUG-01), alt ID collision, dead sb-changelog ref, quota surfacing, tilt/entrance conflict, stale copy format.
- **v4.5** — ban tag, alternatives system, alt badge.
- **v4.0** — removed PIN (re-added later w/ hardcoded), removed per-cookie copy/tag; added smart copy, inline edit, sync vault modal; sidebar → icon dock.
- **v3.1** — 28 bug fixes, custom confirm, PIN as hash (later abandoned), dead code removed.

---

*End of handoff. This document is self-contained; an AI can act on the vault from this alone.*

---

## 16. v2.9 PRESERVATION HARDENING

The supplied `saturnity-vault-*.json` already has the contractual export wrapper
and needs no manual JSON conversion. Its additional cookie fields (including
`id`, `tags`, `timeline`, `_lastGroup`, and `lastSynced`) are real persisted
data and must survive imports, edits, exports, and sync.

- Legacy duplicate cookie IDs are tolerated and reported in **Data check**;
  existing IDs are never regenerated automatically.
- New cloned cookie instances receive fresh IDs and retain an additive
  `legacySourceId` provenance field.
- Loading and integrity checking are read-only. A parse failure must never be
  saved back as an empty vault.
- Smart JSON updates merge fields and retain local/unmatched cookies rather
  than replacing a group cookie array.
- CSV import/export supports `username,password,cookie,banStatus,tags`.
- Tags and timelines apply equally to main and alternative cookie entries.
- Confirmed destructive operations create a contractual recovery JSON download
  before deleting groups/configurations or clearing a vault.
- Decoy mode blocks data-configuration creation, rename, deletion, and file
  import so the session cannot leave a persistent configuration trace.
- The Worker-based cookie checker is user-triggered, stores up to three URLs in
  `cv_worker_urls`, rotates workers after requests/errors, observes a 10-second
  timeout, records timeline/status updates, supports current/all-group scope,
  exports failed statuses, and saves after each completed run.
- Invalid JSON group records enter an explicit, downloadable quarantine review;
  valid groups are imported only after user confirmation.
- Unknown root-level export wrapper fields are retained separately per data
  configuration and re-emitted on export. Contract fields remain `version`,
  `exported`, and `vault`.
- Data Check includes no-write regression coverage for CSV parsing, quarantine,
  preservation merge behavior, and cookie formatting.
  Browser automation can load `index.html?sv-regression=1` and assert
  `body[data-sv-regression="passed"]`.
