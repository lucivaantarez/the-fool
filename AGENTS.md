<!-- context7 -->
Use the `ctx7` CLI to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Resolve library: `npx ctx7@latest library <name> "<what to look up>"` — use the official library name with proper punctuation (e.g., "Next.js" not "nextjs", "Customer.io" not "customerio", "Three.js" not "threejs")
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question)
3. Fetch docs: `npx ctx7@latest docs <libraryId> "<what to look up>"` — run a separate `docs` command per distinct concept if the question spans multiple topics, unless it's about how they interact
4. Answer using the fetched documentation

You MUST call `library` first to get a valid ID unless the user provides one directly in `/org/project` format. Be specific about what to look up in the library's documentation — specific and detailed queries return better results than vague single words, but keep each query to a single concept unless the question is about how concepts interact; combined multi-topic queries dilute ranking and return shallow results for each topic. Do not run more than 3 commands per question. Do not include sensitive information (API keys, passwords, credentials) in queries.

For version-specific docs, use `/org/project/version` from the `library` output (e.g., `/vercel/next.js/v14.3.0`).

If a command fails with a quota error, inform the user and suggest `npx ctx7@latest login` or setting `CONTEXT7_API_KEY` env var for higher limits. Do not silently fall back to training data.
Run Context7 CLI requests outside Codex's default sandbox. If a Context7 CLI command fails with DNS or network errors such as ENOTFOUND, host resolution failures, or fetch failed, rerun it outside the sandbox instead of retrying inside the sandbox.
<!-- context7 -->

## Repository architecture

- `index.html` is the stable main application entrypoint. It contains the private dashboard, Saturnity Vault, shared hub, and browser utilities.
- `adopt-me.html` is the stable standalone Adopt Me entrypoint.
- `frontend/adoptme-preview.jsx` is the authored Adopt Me React source; `assets/adoptme-react.js` is its generated browser bundle.
- `backend/server.mjs` is the private Node.js service for authentication, encrypted vault synchronization, scripts, integrations, and object-storage signing.
- `assets/` contains only files that may be published with the application.
- `docs/product/` contains product and preservation specifications. `docs/operations/` contains deployment documentation.
- `tools/tests/`, `tools/research/`, and `tools/knowledge/` contain verification, research automation, and knowledge maintenance respectively.
- `archive/` contains preserved non-production prototypes. `artifacts/` contains ignored generated output. `.local/` contains ignored sensitive machine-local state.
- `knowledge-base/` is the Obsidian vault. Human notes are in `knowledge-base/project/`; Graphify exports are in `knowledge-base/graphify/`.

## Protected data and compatibility rules

- Preserve `vault[]` as the single source of truth and preserve the `{ version, exported, vault }` export contract.
- Do not change vault migration behavior, JSON schemas, cookie/group field names, or unknown-field preservation without explicit approval and migration proof.
- Never read into logs, publish, commit, or rewrite `.env` files, SQLite databases, vault exports, browser sessions, credentials, or external `saturnity-data/` contents.
- Keep `index.html`, `adopt-me.html`, `assets/`, and `publish-saturnity.ps1` compatible with the current Caddy publishing workflow.
- `assets/adoptme-react.js` and `assets/xlsx.full.min.js` are generated/vendor files; edit their authored source or dependency workflow instead of hand-editing them.

## Coding and terminal workflow

- Use RTK-prefixed terminal commands as configured by `C:\Users\Administrator\.codex\RTK.md`.
- Prefer narrow changes, reuse existing patterns, and avoid application rewrites during maintenance work.
- Before moving or renaming a file, find its package-script, runtime, documentation, and deployment references. Update those references in the same change.
- Verify backend syntax, frontend buildability, static asset references, and deployment inputs after structural changes.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Project knowledge workflow

- Treat `knowledge-base/` as the project's durable Obsidian knowledge base.
- When a change alters components, boundaries, storage, authentication, deployment, or data flow, update `knowledge-base/project/Architecture.md` in the same task.
- Record durable technical choices and rationale in `knowledge-base/project/Decisions.md`; record meaningful completed work in `knowledge-base/project/Development Log.md`.
- After code or path changes, run `tools/knowledge/update-project-knowledge.ps1` to refresh Graphify clustering and the Obsidian export.
- Do not hand-edit files under `knowledge-base/graphify/`. Human-maintained notes are `Home.md` and the files under `knowledge-base/project/`.
