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
| Verification | `tools/*.mjs` | Playwright captures, UI audits, and XLS/XLSX support checks |
| Knowledge graph | `graphify-out/` | Generated code relationships, report, and interactive HTML graph |
| Knowledge base | `knowledge-base/` | Obsidian notes, architecture decisions, development log, and exported graph notes |

## Data and security boundaries

- Browser vault state is synchronized through the private backend rather than published as a static asset.
- The backend listens on loopback and is expected to be reverse-proxied by Caddy.
- Vault payloads are encrypted before SQLite storage; server secrets and the database remain outside the repository and web roots.
- Production and preview folders receive only explicitly approved static files.
- Generated dependencies, browser-session captures, and minified bundles are excluded from Graphify.

## Current documentation risk

`HOSTING.md` still describes an earlier static-only stage in one section, while `backend/README.md` documents the implemented private backend. Treat the backend README and current code as authoritative until the hosting document is reconciled.

## Graph snapshot

The initial credential-free graph contains 167 project-owned nodes, 215 edges, and 17 communities. Its central node is the backend `server`; the strongest cross-community bridge found is the object-storage signing path through `s3SignedRequest()`.

