# Architecture

## System shape

The Fool is a browser application with a private Node.js backend and separately published static entry points.

The preview route shell owns URL-driven workspace activation. Its transition cleanup closes transient vault/tool overlays before activating the next workspace, while the dedicated tool router controls which Account Ops detail section is visible. Cookie workflows are grouped under Account Ops for daily navigation, while old Cookie Tools detail routes remain compatibility entry points. This is presentation state only; vault records continue to live in `vault[]`.

Account Splitter group summaries and copy progression are owned by `assets/compact-workspaces.js`. They consume `SaturnitySplitter.getRecords()` and `textFor()` without changing the parser, output delimiters, UP/UC/UPC/UPCE formats, or vault storage.

Vault Cookie Operations reads the existing `bulkSelected` group-selection state and delegates Copy cookies, Export selected, and Clear selection to the legacy bulk action bar. Extract selected hands usernames from those groups to the existing Cookie Extractor input and route; cookie values render masked in Vault until the deliberate Reveal action and no storage layer is added. Its embedded triage console accepts usernames, raw cookies, UPC, and UPCE lines, searches `vault[]` by username or exact cookie value, copies selected matches as UPCE, and can move selected matches into a dated local group after confirmation. Its recent-update count uses an existing per-cookie `updatedAt` field when present within 30 days, while mixed coverage counts groups containing both present and missing cookies. Selection actions explain their disabled state until a group is selected. The preview presentation layer adds only monochrome outline icons, operational wording, and reduced-motion-aware row transitions; it does not introduce a brand-logo dependency or new vault data model.

| Area | Primary source | Responsibility |
| --- | --- | --- |
| Main application | `index.html` | Private dashboard, vault, tools, scripts, and client-side workflows |
| Adopt Me Watcher | `frontend/adoptme-preview.jsx` | React source for the read-only Adopt Me Main and Accounts watcher |
| Adopt Me bundle | `assets/adoptme-react.js` | Generated browser bundle; excluded from Graphify in favor of its JSX source |
| Redfinger workspace | `redfinger.html`, `assets/redfinger-app.js` | Parked direct workspace for server-mediated device inventory and gated commands; hidden from active navigation until resumed |
| Backend | `backend/server.mjs` | Authentication, sessions, encrypted vault persistence, scripts, API configuration, and object-storage signing |
| Publishing | `publish-saturnity.ps1` | Copies approved static assets into isolated preview or production web roots |
| Verification | `tools/tests/` | Playwright UI checks and XLS/XLSX compatibility checks |
| Research | `tools/research/zekehub/` | Authenticated, redacted UI capture and audit tooling |
| Local artifacts | `artifacts/` and `.local/` | Ignored generated output and sensitive browser-session state |
| Knowledge graph | `graphify-out/` | Generated code relationships, report, and interactive HTML graph |
| Knowledge base | `knowledge-base/project/` | Human Obsidian notes; generated graph notes are isolated under `knowledge-base/graphify/` |

## Data and security boundaries

- Browser vault state is synchronized through the private backend rather than published as a static asset.
- The backend listens on loopback and is expected to be reverse-proxied by Caddy.
- Vault payloads are encrypted before SQLite storage; server secrets and the database remain outside the repository and web roots.
- `publish-saturnity.ps1` copies the main, Adopt Me, and Redfinger HTML entrypoints plus production assets into isolated preview or production web roots.
- The explicit Redfinger demo contains no provider authentication. Normal operation already uses the loopback backend (see `/api/redfinger/*` below); the browser receives normalized inventory and keeps provider sessions/credentials server-side.
- Passive device captures may use only a provider-returned thumbnail or dedicated read-only screenshot endpoint. The integration must never open or interact with a remote device to obtain a preview.
- Generated dependencies, browser-session captures, and minified bundles are excluded from Graphify.
- Caddy serves those published roots and reverse-proxies `/api/*` to the loopback backend.
- `backend/watch-backend.ps1` is the local persistent watchdog for the loopback backend. Windows Task Scheduler starts one hidden watchdog at logon/startup; the watchdog stays running, checks `http://127.0.0.1:8787/api/health` every 15 seconds, restarts only the loopback backend listener when unhealthy, and avoids recurring task/terminal spawn that can make the preview blink. Caddy and production publishing remain untouched.
- Redfinger Ops uses `/api/redfinger/*`; the Node backend stores normalized inventory snapshots and activity events in SQLite, while a separate loopback-only Python bridge reuses the verified `redfinger-manager` inventory reader. Provider credentials stay in that manager's environment and never enter the browser or Saturnity database.
- Farm trade diagnostics POST Discord-compatible JSON to `/api/tradelog` with a dedicated bearer token. The loopback backend stores bounded payloads in SQLite; authenticated Saturnity sessions can retrieve the latest 100 through `/api/tradelogs`.
- `redfinger.html?demo=1` is the isolated UI fixture. Normal `/redfinger.html` requires The Fool server authentication and never falls back to mock devices.
- Preview private tool routes are page-level browser workspaces under `/account-tools/*` with `/cookie-tools/*` retained as compatibility routes. Account Ops groups Browser utilities (Account Splitter, Username Extractor, Comparator, PS Links) and Vault review (Validator, Cookie Extractor, Bulk Lookup, Cookie/Vault Triage) without changing backend, auth, vault schema, migration, or export behavior.
- Adopt Me Watcher is a presentation-only React surface for the future ZekeHub-compatible data shape. Main now mirrors the intended farm dashboard: performance chart, account/farm/inventory status strip, age/type/rarity/group filters, and dense pet inventory. Item owner popups support per-owner copy, copy all owners, copy active owners, tick-mode selection, pinned owner staging, and case-insensitive username dedupe before clipboard output. Accounts uses a ZekeHub-style dense paginated table with search, group/status filters, sort controls, and 50/100/200 page sizes for ~2k accounts. Current values remain local/demo/API-pending; no provider API, backend, schema, auth, vault, or database contract is changed.

## Compact preview presentation

- `assets/compact-workspaces.js/css` recompose private page surfaces without replacing their data or confirmation handlers. The adapter runs only on the preview hostname; shared unavailable presentation is separate from the private adapter.
- The preview compact adapter owns the internal icon language for legacy private surfaces. It injects small inline SVGs into tool launch rows, dashboard operation links, and Vault Cookie Operations controls so icon choice stays presentation-only and route/data handlers remain unchanged.
- `assets/global-nav.js` owns responsive navigation drawers and the shared `Ctrl+B` / `Cmd+B` navigation toggle across main, React Adopt Me, and Redfinger shells, not authentication or route models. Active navigation hides the parked Redfinger workspace and presents Cookie workflows through Account Ops rather than as a separate top-level section.
- The same navigation adapter owns the private command palette: it indexes only a static allowlist of route labels/descriptions, opens via `Ctrl+K`/`Cmd+K` or its Search button, and never indexes vault records or sensitive values.
- The preview route shell includes an Inbox workspace mounted by `assets/compact-workspaces.js`; its review links are static existing routes and its empty state deliberately does not claim backend task persistence.
- Data Center reuses recovery/import/check actions and mirrors existing session/sync text. Scripts preserves the actual loading/error list and hides the editor until selection or creation; sharing/raw URL controls are contextual disclosures.
- Synthetic browser suites under `tools/tests/ui/anti-slop-*` intercept all private APIs, use disposable contexts, and write screenshots/downloads only under ignored `artifacts/anti-slop/`. They prove UI behavior, not real private server state.

## Repository boundary

- Root entrypoints and live asset paths remain stable because the deployment script depends on them.
- Product and preservation specifications live under `docs/product/`; operational guidance lives under `docs/operations/`.
- Tests, research scripts, runtime output, and archived prototypes cannot be copied by the production publisher accidentally.
- The tracked historical vault export is a protected exception. Repository restructuring does not change or sanitize its Git history.

## Graph snapshot

After restructuring, the credential-free graph contains 260 nodes, 301 edges, and 24 communities. Its most connected implementation node remains the backend `server`, and Graphify reports no import cycles.
