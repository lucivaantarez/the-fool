# Architecture

## System shape

The Fool is a browser application with a private Node.js backend and separately published static entry points.

| Area | Primary source | Responsibility |
| --- | --- | --- |
| Main application | `index.html` | Private dashboard, vault, tools, scripts, and client-side workflows |
| Adopt Me workspace | `frontend/adoptme-preview.jsx` | React source for the Adopt Me interface |
| Adopt Me bundle | `assets/adoptme-react.js` | Generated browser bundle; excluded from Graphify in favor of its JSX source |
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
- `publish-saturnity.ps1` copies the two HTML entrypoints and production assets into isolated preview or production web roots.
- Generated dependencies, browser-session captures, and minified bundles are excluded from Graphify.
- Caddy serves those published roots and reverse-proxies `/api/*` to the loopback backend.

## Repository boundary

- Root entrypoints and live asset paths remain stable because the deployment script depends on them.
- Product and preservation specifications live under `docs/product/`; operational guidance lives under `docs/operations/`.
- Tests, research scripts, runtime output, and archived prototypes cannot be copied by the production publisher accidentally.
- The tracked historical vault export is a protected exception. Repository restructuring does not change or sanitize its Git history.

## Graph snapshot

After restructuring, the credential-free graph contains 260 nodes, 301 edges, and 24 communities. Its most connected implementation node remains the backend `server`, and Graphify reports no import cycles.
