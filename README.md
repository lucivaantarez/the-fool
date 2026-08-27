# The Fool

The Fool is the application shell around Saturnity Vault v2.9. It combines the private vault, shared browser tools, script delivery, server-backed synchronization, and a standalone Adopt Me workspace.

## Repository map

- `index.html` — main application entrypoint
- `adopt-me.html` — standalone Adopt Me entrypoint
- `frontend/` — authored frontend source for bundled workspaces
- `assets/` — production files copied by the publisher
- `backend/` — private Node.js and SQLite service
- `docs/` — product specifications and operational guidance
- `tools/` — tests, research automation, and knowledge maintenance
- `knowledge-base/` — Obsidian project knowledge
- `graphify-out/` — generated queryable repository graph
- `archive/` — preserved non-production prototypes
- `artifacts/` and `.local/` — ignored generated and machine-local data

## Common commands

```powershell
npm run build:adoptme
.\backend\run-backend.ps1
.\publish-saturnity.ps1 -Target preview
.\publish-saturnity.ps1 -Target production
.\tools\knowledge\update-project-knowledge.ps1
```

## Data safety

The backend database, environment file, secrets, browser sessions, and vault exports are not application source. Keep them outside published roots and do not commit them. Preserve the vault export contract and migration behavior documented in `docs/product/handout.md`.

See `docs/operations/HOSTING.md` for deployment and `knowledge-base/Home.md` for architecture and decision records.
