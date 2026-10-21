# Saturnity hosting workflow

The project folder is the source workspace. Caddy does **not** serve it directly.
This prevents local vault exports, notes, and tooling files from being published.

## Published folders

- `C:\Users\Administrator\Project\saturnity-web\production` is served at `https://saturnity.site`.
- `C:\Users\Administrator\Project\saturnity-web\preview` is reserved for `https://preview.saturnity.site`.

Each published folder contains the approved `index.html`, the standalone Adopt Me entrypoint, and production assets. Source documents, tools, captures, local sessions, vault exports, and backend data are never copied.

## Workflow

1. Make changes in the source repository.
2. Publish the test version:

   ```powershell
   .\publish-saturnity.ps1 -Target preview
   ```

3. Test `https://preview.saturnity.site` after its DNS record is configured.
4. When approved, publish production:

   ```powershell
   .\publish-saturnity.ps1 -Target production
   ```

No Caddy restart is needed when publishing static files. Reload Caddy only after changing `C:\caddy\Caddyfile`.

## Uptime supervision

Two persistent watchdogs own local process uptime. Neither uses a recurring per-minute trigger: repeated task spawning previously made the terminal manager look like it was rerunning the site every minute and made preview blink.

| Scheduled task | Script | Checks every | Action when unhealthy |
| --- | --- | --- | --- |
| `Saturnity Backend` | `backend/watch-backend.ps1` | 15 s | Restarts only the loopback listener on `127.0.0.1:8787` |
| `Saturnity Caddy Watchdog` | `C:\caddy\watch-caddy.ps1` | 15 s | Restarts Caddy through `C:\caddy\run-saturnity-caddy.cmd` |

Both tasks start at boot and at logon, stay resident, and log to a local file: `%LOCALAPPDATA%\Saturnity\backend-watchdog.log` and `C:\caddy\logs\caddy-watchdog.log`. Neither log records secrets or environment values.

The Caddy watchdog treats Caddy as healthy only when its process exists and still owns the local `:80` and `:443` listeners. It deliberately never probes a public hostname, so DNS or CDN failures outside this machine cannot trigger a local restart.

`SaturnityCaddy` is kept registered but disabled. The watchdog is the single owner of the Caddy lifecycle; re-enabling the old task would start a second competing instance.

## Security boundary

The browser application uses a private Node.js backend for server login, encrypted vault synchronization, scripts, and integration configuration. Caddy forwards `/api/*` to the backend on `127.0.0.1:8787`; static files are served from the isolated published roots.

The backend environment and SQLite database live outside this repository and outside both web roots. Do not place vault JSON exports, backups, credentials, browser-session data, `.env` files, or private notes in a published folder.
