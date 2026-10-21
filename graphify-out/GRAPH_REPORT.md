# Graph Report - the-fool  (2026-10-21)

## Corpus Check
- 39 files · ~153,849 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 468 nodes · 553 edges · 42 communities (39 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c22023df`
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
- The Fool Design Specification
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
- Handler
- test-redfinger-preview.mjs
- redfinger-app.js
- redfinger-service.mjs
- test-preview-density.mjs
- 4. Component Library
- live-workspace-visual-audit.mjs
- 5. Page Specifications
- The Fool — Long-Term AI Project Context
- anti-slop-behavior.mjs
- favicon-live-audit.mjs
- generate-fool-favicon.mjs
- anti-slop-regression.mjs
- Current Features
- watch-backend.ps1

## God Nodes (most connected - your core abstractions)
1. `server` - 32 edges
2. `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` - 18 edges
3. `The Fool — Long-Term AI Project Context` - 15 edges
4. `4. Component Library` - 15 edges
5. `The Fool Design Specification` - 14 edges
6. `The Fool — Project Idea and Build Brief` - 12 edges
7. `Current Features` - 11 edges
8. `5. Page Specifications` - 10 edges
9. `Core product areas` - 10 edges
10. `createRedfingerHandler()` - 9 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (42 total, 3 thin omitted)

### Community 0 - "server.mjs"
Cohesion: 0.10
Nodes (46): allowedOrigins, cleanJob(), clientAddress(), cookies(), db, decrypt(), encrypt(), handleRedfinger (+38 more)

### Community 1 - "adoptme-preview.jsx"
Cohesion: 0.10
Nodes (11): accounts, ages, copyText(), dedupe(), groups, ItemInspector(), itemMeta(), itemNames (+3 more)

### Community 2 - "package.json"
Cohesion: 0.08
Nodes (24): esbuild, author, bugs, url, description, devDependencies, esbuild, @playwright/test (+16 more)

### Community 3 - "SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION"
Cohesion: 0.05
Nodes (43): 0. TL;DR — WHAT THIS IS, 10. KNOWN ISSUES (design decisions, not bugs), 11. FAILED APPROACHES (DO NOT RETRY), 12. EXPECTED BEHAVIORS (input → output), 13. UI SURFACES (present in the app), 14. DEPENDENCIES, 15. VERSION HISTORY (condensed), 16. v2.9 PRESERVATION HARDENING (+35 more)

### Community 4 - "dependencies"
Cohesion: 0.13
Nodes (15): @base-ui/react, lucide-react, motion, dependencies, @base-ui/react, lucide-react, motion, react (+7 more)

### Community 5 - "SATURNITY_CONTEXT.md"
Cohesion: 0.12
Nodes (15): Coding Rules, Cookie Checker, Critical Data Rule, Current Development Status, Editing, Next Development Tasks, Phase 6, Preservation Requirements (+7 more)

### Community 6 - "backend/package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, private, scripts, start, type

### Community 7 - "zekehub-capture.mjs"
Cohesion: 0.20
Nodes (8): captureDir, captureMode, dataPath, loginMode, screenshotPath, sessionDir, timestamp, visibleText

### Community 8 - "The Fool Design Specification"
Cohesion: 0.05
Nodes (36): 10. Future Design Roadmap, 11. Design Decisions Log, 12. AI Development Guidelines, 1. Product Identity, 2. Visual Design System, 3. UI Structure, 6. Interaction Design, 7. Data Presentation (+28 more)

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
Cohesion: 0.25
Nodes (7): Coding and terminal workflow, graphify, Hermes communication rules, Project knowledge workflow, Protected data and compatibility rules, Repository architecture, Steps

### Community 23 - "Saturnity backend"
Cohesion: 0.50
Nodes (3): First run, Saturnity backend, Security properties

### Community 24 - "Handler"
Cohesion: 0.18
Nodes (6): AccountSession, Handler, Local-only bridge between The Fool and the verified Redfinger inventory reader.…, BaseHTTPRequestHandler, BrowserSession, Path

### Community 25 - "test-redfinger-preview.mjs"
Cohesion: 0.29
Nodes (4): errors, mobileDensityLabel, remainingFont, tabletDensityLabel

### Community 26 - "redfinger-app.js"
Cohesion: 0.25
Nodes (10): addLocalEvent(), api(), captureMarkup(), loadInventory(), notify(), openLogs(), render(), renderLogs() (+2 more)

### Community 27 - "redfinger-service.mjs"
Cohesion: 0.30
Nodes (13): bridgeEndpoint(), bridgeRequest(), bridgeToken, bridgeUrl, cleanStatus(), cleanText(), configured(), createRedfingerHandler() (+5 more)

### Community 31 - "4. Component Library"
Cohesion: 0.13
Nodes (15): 4. Component Library, Buttons, Cards and surfaces, Charts, Dialogs and confirmations, Drawers and inspectors, Empty states, Filters (+7 more)

### Community 32 - "live-workspace-visual-audit.mjs"
Cohesion: 0.29
Nodes (6): outDir, pages, stamp, summary, summaryFile, viewports

### Community 33 - "5. Page Specifications"
Cohesion: 0.20
Nodes (10): 5. Page Specifications, Account Tools, Adopt Me Operations, Cookie Tools, Dashboard, Data Center and Private Settings, Redfinger Operations, Scripts (+2 more)

### Community 34 - "The Fool — Long-Term AI Project Context"
Cohesion: 0.07
Nodes (34): AI Agent Instructions, Backend, Component communication and data flow, Core Concept, Current Architecture, Current limitations, Current State, Definition of success (+26 more)

### Community 35 - "anti-slop-behavior.mjs"
Cohesion: 0.18
Nodes (4): errors, results, summary, writes

### Community 36 - "favicon-live-audit.mjs"
Cohesion: 0.40
Nodes (4): hosts, outDir, stamp, viewports

### Community 37 - "generate-fool-favicon.mjs"
Cohesion: 0.50
Nodes (3): pngPath, root, svgPath

### Community 38 - "anti-slop-regression.mjs"
Cohesion: 0.40
Nodes (3): routes, rows, summary

### Community 40 - "Current Features"
Cohesion: 0.29
Nodes (12): 1. Private Dashboard, 2. Saturnity Vault, 3. Bulk Lookup, 4. Account and Username Tools, 5. Cookie/API Tools, 6. Script Repository, 7. Shared Hub, 8. Adopt Me Operations (+4 more)

### Community 41 - "watch-backend.ps1"
Cohesion: 0.70
Nodes (4): Get-BackendProcesses(), Start-Backend(), Test-BackendHealth(), Write-WatchdogLog()

## Knowledge Gaps
- **242 isolated node(s):** `name`, `private`, `type`, `start`, `node` (+237 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `The Fool Design Specification` connect `The Fool Design Specification` to `5. Page Specifications`, `4. Component Library`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `4. Component Library` connect `4. Component Library` to `The Fool Design Specification`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _242 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09898242368177614 - nodes in this community are weakly interconnected._
- **Should `adoptme-preview.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `SATURNITY VAULT — COMPLETE HANDOFF SPECIFICATION` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._