# Graphify Guide

## Generated outputs

- `../graphify-out/graph.json` — queryable graph data
- `../graphify-out/GRAPH_REPORT.md` — architecture audit and suggested questions
- `../graphify-out/graph.html` — interactive browser visualization
- `graph.canvas` — Obsidian canvas
- Generated `*.md` node/community notes in this vault

## Query from Codex

Ask a normal repository question. Project instructions tell Codex to query Graphify first when `graphify-out/graph.json` exists.

Direct commands:

```powershell
graphify query "How does vault synchronization reach SQLite?"
graphify path "server" "s3SignedRequest()"
graphify explain "sessionUser()"
graphify god-nodes --top 10
```

## Refresh

After code changes, run:

```powershell
.\tools\update-project-knowledge.ps1
```

Git post-commit and post-checkout hooks also refresh the code graph. The project script additionally regenerates clustering and exports the current graph into this Obsidian vault.

