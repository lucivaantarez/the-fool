# Decisions

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
