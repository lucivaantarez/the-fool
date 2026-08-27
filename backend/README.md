# Saturnity backend

This service is intentionally private behind Caddy. It listens only on `127.0.0.1:8787`; Caddy proxies `https://saturnity.site/api/*` to it.

## First run

1. Run `./initialize-backend.ps1` once. It creates `C:\Users\Administrator\Project\saturnity-data\backend.env` with the encryption key and one-time setup token.
2. Run `./run-backend.ps1` in a PowerShell window and leave it running.
3. Open Saturnity → **Data Center** → **Secure Server Sync**.
4. Open `backend.env` locally, copy the setup token, create the one owner account, then sign in.
5. Upload the local vault when you are ready. Other devices sign in with the same account and explicitly download or upload snapshots.

## Security properties

- The SQLite database stores the vault only as AES-256-GCM encrypted data.
- The encryption key and setup token never enter `index.html` or Caddy’s public web folders.
- Passwords use salted `scrypt` hashes.
- Sessions are random, hashed in SQLite, expiring, `HttpOnly`, `Secure`, and `SameSite=Strict`.
- Each vault write has a revision check; sync is manual and confirmations are required before replacement.

Do not put `saturnity-data`, `backend.env`, a database file, or a vault export inside a Caddy site root or a Git repository.
