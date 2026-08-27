# Graph Report - the-fool  (2026-08-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 260 nodes · 301 edges · 24 communities (22 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd85eab5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.mjs
- adoptme-preview.jsx
- package.json
- SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION
- dependencies
- SATURNITY_CONTEXT.md
- backend/package.json
- zekehub-capture.mjs
- 8. EXACT LOGIC (the parts most likely to be re-implemented wrong)
- zekehub-audit.mjs
- zekehub-adoptme-ui-audit.mjs
- zekehub-adoptme-detail-audit.mjs
- xls-support-test.mjs
- Saturnity hosting workflow
- The Fool
- Documentation Lookup
- adoptme-preview-test.mjs
- test-adoptme-preview.mjs
- AGENTS.md
- Saturnity backend

## God Nodes (most connected - your core abstractions)
1. `server` - 31 edges
2. `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` - 18 edges
3. `8. EXACT LOGIC (the parts most likely to be re-implemented wrong)` - 9 edges
4. `nevaConfig()` - 7 edges
5. `s3SignedRequest()` - 7 edges
6. `Documentation Lookup` - 7 edges
7. `9. FUNCTION REFERENCE (contracts)` - 7 edges
8. `now()` - 6 edges
9. `2. DATA MODELS (EXACT)` - 6 edges
10. `nevaSignedDownload()` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (24 total, 2 thin omitted)

### Community 0 - "server.mjs"
Cohesion: 0.10
Nodes (45): allowedOrigins, cleanJob(), clientAddress(), cookies(), db, decrypt(), encrypt(), hashToken() (+37 more)

### Community 1 - "adoptme-preview.jsx"
Cohesion: 0.07
Nodes (6): accounts, chart, inventory, nav, templateSections, toolCopy

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (24): esbuild, author, bugs, url, description, devDependencies, esbuild, @playwright/test (+16 more)

### Community 3 - "SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION"
Cohesion: 0.06
Nodes (34): 0. TL;DR — WHAT THIS IS, 10. KNOWN ISSUES (design decisions, not bugs), 11. FAILED APPROACHES (DO NOT RETRY), 12. EXPECTED BEHAVIORS (input → output), 13. UI SURFACES (present in the app), 14. DEPENDENCIES, 15. VERSION HISTORY (condensed), 16. v2.9 PRESERVATION HARDENING (+26 more)

### Community 4 - "dependencies"
Cohesion: 0.22
Nodes (9): lucide-react, dependencies, lucide-react, react, react-dom, recharts, react, react-dom (+1 more)

### Community 5 - "SATURNITY_CONTEXT.md"
Cohesion: 0.12
Nodes (15): Coding Rules, Cookie Checker, Critical Data Rule, Current Development Status, Editing, Next Development Tasks, Phase 6, Preservation Requirements (+7 more)

### Community 6 - "backend/package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, private, scripts, start, type

### Community 7 - "zekehub-capture.mjs"
Cohesion: 0.20
Nodes (8): captureDir, captureMode, dataPath, loginMode, screenshotPath, sessionDir, timestamp, visibleText

### Community 8 - "8. EXACT LOGIC (the parts most likely to be re-implemented wrong)"
Cohesion: 0.22
Nodes (9): 8. EXACT LOGIC (the parts most likely to be re-implemented wrong), calcHealthScore() → {score, grade}, esc(s) — HTML escape (NOTE: does NOT escape single quotes), expTxt(g) — per-group .txt export (main cookies only; alts omitted — ISSUE-04), fmtLine(c, fmt) → string, getCopyFmt() — smart copy format (per cookie), Group ID generation, "Move matched" (v2.9 Bulk Lookup feature) (+1 more)

### Community 9 - "zekehub-audit.mjs"
Cohesion: 0.22
Nodes (6): audit, outputDir, queue, seen, sessionDir, startPaths

### Community 10 - "zekehub-adoptme-ui-audit.mjs"
Cohesion: 0.29
Nodes (7): outputDir, records, redact(), safeMenus, sections, sessionDir, snapshot()

### Community 11 - "zekehub-adoptme-detail-audit.mjs"
Cohesion: 0.38
Nodes (5): clean(), inventoryCard, openAndSave(), output, save()

### Community 12 - "xls-support-test.mjs"
Cohesion: 0.33
Nodes (5): fixtures, require, results, workbook, XLSX

### Community 13 - "Saturnity hosting workflow"
Cohesion: 0.40
Nodes (4): Published folders, Saturnity hosting workflow, Security boundary, Workflow

### Community 17 - "The Fool"
Cohesion: 0.40
Nodes (4): Common commands, Data safety, Repository map, The Fool

### Community 18 - "Documentation Lookup"
Cohesion: 0.17
Nodes (11): Authentication, Common Mistakes, Documentation Lookup, Error Handling, Result fields, Selection process, Step 1: Resolve a Library, Step 2: Query Documentation (+3 more)

### Community 22 - "AGENTS.md"
Cohesion: 0.29
Nodes (6): Coding and terminal workflow, graphify, Project knowledge workflow, Protected data and compatibility rules, Repository architecture, Steps

### Community 23 - "Saturnity backend"
Cohesion: 0.50
Nodes (3): First run, Saturnity backend, Security properties

## Knowledge Gaps
- **140 isolated node(s):** `accounts`, `inventory`, `allowedOrigins`, `db`, `limits` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` connect `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` to `8. EXACT LOGIC (the parts most likely to be re-implemented wrong)`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `8. EXACT LOGIC (the parts most likely to be re-implemented wrong)` connect `8. EXACT LOGIC (the parts most likely to be re-implemented wrong)` to `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `accounts`, `inventory`, `allowedOrigins` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Should `adoptme-preview.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._