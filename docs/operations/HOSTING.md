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

## Security boundary

The browser application uses a private Node.js backend for server login, encrypted vault synchronization, scripts, and integration configuration. Caddy forwards `/api/*` to the backend on `127.0.0.1:8787`; static files are served from the isolated published roots.

The backend environment and SQLite database live outside this repository and outside both web roots. Do not place vault JSON exports, backups, credentials, browser-session data, `.env` files, or private notes in a published folder.
