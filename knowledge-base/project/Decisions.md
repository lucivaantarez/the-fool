# Decisions

## 2026-10-10 - Persistent backend watchdog instead of recurring terminal tasks

- Keep Caddy as the public web entry point and keep the Saturnity backend loopback-only on `127.0.0.1:8787`.
- Use one hidden persistent PowerShell watchdog for backend availability: Task Scheduler starts it at logon/startup, the script checks `/api/health` every 15 seconds inside the same process, and it restarts only the loopback backend listener when unhealthy.
- Avoid recurring every-minute task launches because repeated terminal/PowerShell spawning can make the preview appear to blink even when Caddy is healthy.
- Log watchdog state outside the repository and without environment values or credentials.

## 2026-09-09 - Compact preview composition

- Keep tool state and confirmation ownership in existing handlers; move nodes rather than cloning controls. Use a preview presentation adapter instead of rewriting the vault application.
- Keep output format selection honest: Splitter TXT remains UPC, JSON/CSV retain all fields; its Copy selector does not silently alter export semantics. Comparator TXT exports the currently filtered unique result names.
- Use native disclosures for secondary script distribution and PS allowlists. Preserve error messages rather than presenting fabricated empty/private records.
- Clamp Redfinger requested density to readable available width; the previous ten/twenty-column and square-device-card visual assertions are superseded by the approved responsive design, not behavior requirements.
- Preview publication follows synthetic behavioral tests and responsive screenshots, then exact deployed-file hash readback. Production remains separately gated.

## 2026-09-13 - Route transition cleanup

- Centralize route-transition cleanup in the preview route shell and dedicated tool router. Navigation closes open vault panels, modal overlays, and non-active tool details without changing vault data or input contracts.
- Use the established close mechanisms (`closePanel`, modal `open` class, and PS Link `hidden` state) so transient workflows remain reopenable after navigation.
- Keep the dashboard Fool-tools anchor as a normal secondary action with explicit non-underlined styling.

## 2026-09-13 - Account Splitter copy progression

- Keep splitter parsing and export contracts in `SaturnitySplitter`; implement phone-safe progress in the presentation adapter.
- Show valid/rejected counts and the largest group size before copying. After each group copy, label the next available group as the next action and reset that progression when input, format, or group count changes.
- Warn at 8,000 rendered characters per group as a practical clipboard-risk threshold; never split an account line to meet it.

## 2026-09-13 - Vault selection actions

- Keep Vault group selection owned by the existing `bulkSelected` model and bulk action bar. Contextual Cookie Operations buttons trigger those established handlers instead of maintaining a second selection or cookie dataset.
- Disable Copy cookies, Export selected, and Clear selection when no groups are selected; selection status remains non-sensitive and contains no cookie values.
- Extract selected reuses the dedicated Cookie Extractor input and route, passing only selected usernames and closing transient detail panels before navigation.
- Render cookie values as a fixed mask in ordinary Vault detail views. Reveal/Hide is an explicit per-record action; existing copy buttons remain separate deliberate disclosure actions.
- Derive “updated recently” only from existing `updatedAt` fields within a 30-day window and derive mixed coverage from current cookie presence; do not invent timestamps or persist new metadata.
- Keep the selection-action helper text explicit: explain how to enable actions when empty, then name the selected group count when active.


## 2026-08-28 — Local-first project knowledge

- Keep the Obsidian vault inside the repository at `knowledge-base/` so architecture and decisions can be versioned with the code.
- Keep generated Graphify node notes in the same vault, but maintain `Home.md`, `Architecture.md`, `Decisions.md`, `Development Log.md`, and `Graphify Guide.md` by hand/Codex.

## 2026-08-28 — Credential-free Graphify extraction

- Build the initial graph from local AST extraction only.
- Do not configure or store an external LLM/API key for Graphify.
- Store product documents directly in Obsidian; add semantic extraction later only if explicitly desired.

## 2026-08-28 — Exclude generated and sensitive working data

- Exclude dependencies, captured browser sessions, generated knowledge output, the Obsidian export, and minified vendor/bundle files through `.graphifyignore`.
- Index authored sources such as `frontend/adoptme-preview.jsx`, `backend/server.mjs`, PowerShell workflows, and test/audit tools.

## 2026-08-28 — Conservative repository restructuring

- Keep `index.html`, `adopt-me.html`, live assets, frontend source, backend source, and the root publisher at their established paths.
- Separate product documentation, tests, research automation, generated artifacts, sensitive local state, and archived prototypes by responsibility.
- Preserve file contents during moves and limit source edits to path compatibility.
- Keep the existing tracked vault export untouched; address its Git-history exposure only as a separate security operation with explicit approval.

## 2026-08-30 — Redfinger command-center boundary

- Keep Redfinger sessions on the VPS; the browser is a status and command surface only.
- Support at most five named server-side sessions and poll normalized device inventory every 30 seconds, with an early follow-up fetch after a command.
- Keep reboot and renewal deliberate and confirmation-gated. Renewal continues to follow the separate activation-code workflow and identifier re-verification rules.
- Obtain device previews only from passive provider thumbnails or a read-only screenshot endpoint. Never click or open a remote screen to capture it.

## 2026-09-03 — Authenticated farm diagnostics

- Accept trade-failure reports through the existing Caddy-to-Node API boundary instead of running another public service.
- Authenticate farm writers with a dedicated bearer token stored outside Git; retain reports in the existing SQLite database and expose reads only to authenticated Saturnity users.

## 2026-10-21 — Single-resident watchdogs own local uptime

- Supervise the loopback backend and Caddy with one resident watchdog process each, never with a recurring per-minute scheduled trigger. Repeated task spawning looked like the site was rerunning constantly and made preview blink.
- Judge Caddy health only by local evidence: its process must own the local `:80` and `:443` listeners. Never restart a local service because a public hostname failed, because DNS and CDN failures are outside this machine's control.
- Keep exactly one owner per lifecycle. The direct `SaturnityCaddy` start task stays registered but disabled so the watchdog cannot race a second Caddy instance.
- Keep the Caddy watchdog next to the Caddy configuration instead of in this repository, because the same Caddy instance also serves unrelated projects.
