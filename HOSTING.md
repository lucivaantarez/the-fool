# Saturnity hosting workflow

The project folder is the source workspace. Caddy does **not** serve it directly.
This prevents local vault exports, notes, and tooling files from being published.

## Published folders

- `C:\Users\Administrator\Project\saturnity-web\production` is served at `https://saturnity.site`.
- `C:\Users\Administrator\Project\saturnity-web\preview` is reserved for `https://preview.saturnity.site`.

Each published folder contains only the approved `index.html`.

## Workflow

1. Make changes in this folder's `index.html`.
2. Publish the test version:

   ```powershell
   .\publish-saturnity.ps1 -Target preview
   ```

3. Test `https://preview.saturnity.site` after its DNS record is configured.
4. When approved, publish production:

   ```powershell
   .\publish-saturnity.ps1 -Target production
   ```

No Caddy restart is needed when publishing HTML. Reload Caddy only after changing `C:\caddy\Caddyfile`.

## Security boundary

The app is still a static, browser-local application. It has no server login or server database yet. Do not place vault JSON exports, backups, credentials, or private notes in either published folder.
