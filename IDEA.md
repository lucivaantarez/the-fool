# The Fool — Long-Term AI Project Context

## Project Overview

The Fool is a private, self-hosted command center for managing Saturnity Vault data, browser utilities, shared scripts, account operations, Adopt Me monitoring, and Redfinger cloud devices from one secure interface.

It exists because the owner’s operational data and tools had become fragmented across browser-local storage, files, provider dashboards, repositories, and remote-device accounts. That fragmentation made cross-device access unreliable, repeated routine work, and made it difficult to see current state in one place.

The main problem it solves is operational consolidation without surrendering data ownership: one secure website presents private data, shared tools, scripts, monitoring, and deliberate control actions while keeping credentials, databases, and provider sessions on the owner’s server.

## Core Concept

## Product vision

Build a fast, dense, professional operations platform for one owner and a small group of trusted collaborators. It should feel like premium private infrastructure rather than a generic SaaS dashboard.

The Fool combines:

- A private encrypted account and cookie vault
- Vault-connected bulk lookup and organization
- Standalone username and account-processing tools
- A private and shared script repository with raw delivery URLs
- Server-backed synchronization across devices
- Adopt Me Watcher views for read-only Main inventory/status monitoring and paginated Accounts inspection
- Parked Redfinger device monitoring, expiry tracking, passive screenshots, logs, reboot, and renewal controls retained for direct compatibility until resumed
- A restricted public/shared workspace that never exposes private vault data

The visual identity uses a dark graphite interface, Public Sans typography, restrained status colors, compact information-rich layouts, and the existing Fool/jester mark.

The original idea began as Saturnity Vault v2.9, a local account and cookie vault. It evolved into The Fool: an application shell that preserves the vault core while adding server synchronization, dedicated tools, script hosting, shared access, and specialized operational workspaces.

The intended owner workflow is:

1. Authenticate once with the private server and retain the secure session across normal refreshes.
2. Land on a command-center dashboard and identify urgent state or the next workspace.
3. Enter a focused full-page workflow rather than opening a large tool popup.
4. Search, filter, inspect, select, and review data before acting.
5. Perform deliberate copy, export, synchronization, device, or script actions.
6. Receive clear feedback, an audit/log entry where relevant, and Undo for safely reversible changes.
7. Share only selected tools and scripts through the isolated Fool shared hub.

The design philosophy is documented fully in `design.md`: premium private infrastructure, dark graphite surfaces, Public Sans typography, restrained semantic color, compact information-rich components, purposeful motion, and the Fool/jester identity. Empty space should communicate hierarchy; it must not come from oversized generic cards. Meaningless copy must never be added simply to fill a container.

## Current Architecture

### Existing repository map

This is not a greenfield build. The repository already contains a working application and established compatibility boundaries.

Important files:

- `AGENTS.md` — repository rules and AI workflow
- `design.md` — finalized UI/UX and product design specification
- `index.html` — main private application, Saturnity Vault, shared hub, and browser utilities
- `adopt-me.html` — standalone Adopt Me entrypoint
- `frontend/adoptme-preview.jsx` — authored React source for Adopt Me
- `redfinger.html` — standalone Redfinger operations entrypoint
- `backend/server.mjs` — authentication, encrypted vault sync, scripts, integrations, and API routes
- `backend/redfinger-service.mjs` — Redfinger browser/backend boundary
- `backend/redfinger-bridge.py` — local bridge to the verified Redfinger manager
- `assets/` — publishable application assets
- `publish-saturnity.ps1` — preview and production publisher
- `docs/product/` — Saturnity Vault product and preservation requirements
- `docs/operations/` — hosting and deployment documentation
- `knowledge-base/` — Obsidian project knowledge base
- `graphify-out/` — repository knowledge graph
- `tools/tests/` — Playwright and compatibility tests

Before changing anything, read `AGENTS.md`, `design.md`, `knowledge-base/project/Architecture.md`, `knowledge-base/project/Decisions.md`, and the relevant source files.

### System architecture

#### Frontend

- The main application is a compatibility-sensitive single-file HTML/CSS/JavaScript application in `index.html`.
- Adopt Me is authored in React and bundled with esbuild into `assets/adoptme-react.js`.
- Redfinger currently uses a standalone HTML shell and a JavaScript application asset.
- Shared UI assets include global navigation and preview-wide component refinements.
- Public Sans is the primary UI font. Technical values use a monospace face.
- Base UI is used for the Adopt Me drawer.
- React Aria Components is used for accessible Select controls in Adopt Me.
- Recharts is used for the interactive Adopt Me chart.
- Lucide is the established React icon family.

#### Backend

- Node.js HTTP service bound to loopback and reverse-proxied by Caddy.
- SQLite stores users, sessions, encrypted vault snapshots, scripts, integration configuration, Redfinger snapshots/events, shared-tool sessions, and related metadata.
- Vault snapshots are encrypted with AES-256-GCM before database storage.
- Passwords use salted scrypt hashes.
- Sessions use random hashed tokens delivered as `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- Sensitive environment files, keys, databases, browser sessions, and user data remain outside the repository and public web roots.

#### Deployment

- `preview.saturnity.site` is the test environment.
- `saturnity.site` is the private production application.
- `fool.saturnity.site` is the restricted shared workspace.
- Caddy serves published static files and proxies `/api/*` to the local Node backend.
- Preview changes must be tested before production publishing.

### Component communication and data flow

1. Caddy serves the published HTML and asset files for the requested hostname.
2. Browser entrypoints call same-origin `/api/*` endpoints; Caddy proxies those requests to the loopback Node service.
3. The Node service validates the private or shared session before accessing protected state.
4. Private vault changes originate from the browser’s canonical `vault[]` model. Server snapshots use revision checks and are encrypted before SQLite persistence.
5. Script metadata and sharing state live in SQLite. Raw script payload delivery may use configured object storage and scoped delivery tokens.
6. Redfinger provider sessions remain on the VPS. The local bridge reads normalized device inventory; the Node layer stores bounded snapshots/events and exposes only approved browser endpoints.
7. Adopt Me Watcher currently renders local/demo watcher data for Main and Accounts. A live data flow is not implemented and must eventually use an approved server-side adapter.
8. The public hub receives only shared-tool session state and explicitly shared/member script data. It has no vault data path.

## Current Features

### 1. Private Dashboard

The owner’s command center. It should summarize vault data, operational health, provider balance where configured, recent activity, sync state, and shortcuts to active workspaces.

### 2. Saturnity Vault

The canonical account/cookie database. It supports groups, search, tags, bulk actions, imports, exports, ban state, copy actions, and detailed group views.

`vault[]` must remain the single source of truth.

### 3. Bulk Lookup

Vault-connected inspection and organization. Results can feed safe vault actions, including moving records and applying date-based rate-limit tags that merge records from the same day.

### 4. Account and Username Tools

- Username Comparator: two independent inputs, multi-file merge, duplicate/existing/non-existing comparison, per-result selection, and copying.
- Username Extractor: extracts usernames from pasted text and TXT, CSV, XLS, XLSX, JSON, or other readable text files.
- Account Splitter: accepts UP, UC, UPC, and UPCE (`username:password:cookie:email`) formats with TXT/JSON/CSV export.
- PS Link Workspace: pairs usernames and links, generates results, remembers opened links visually, and supports copying/exporting.

Shared versions of these tools remain browser-local and cannot read or change the private vault.

### 5. Cookie/API Tools

The Cookie Checker and generic API integration areas are client/service architectures only unless a provider integration is explicitly approved. They must not contain hardcoded keys, store credentials in browser source, or process real credentials without authorization.

### 6. Script Repository

Supports multiple scripts with source editing, syntax-oriented presentation, create, rename, update, delete confirmation, private/shared state, and copyable delivery formats:

- Raw URL
- curl command
- `loadstring(game:HttpGet("RAW_URL"))()`

The backend may use object storage for high-volume raw delivery. Private application credentials must never be exposed in raw script URLs.

### 7. Shared Hub

A separate touch-PIN workspace for trusted collaborators. It has its own dashboard and navigation but exposes only approved browser tools and shared/member scripts.

It must never expose:

- Private vault data
- Private settings
- API credentials
- Private scripts
- Server administration
- Hidden owner navigation

### 8. Adopt Me Operations

A standalone high-density workspace with:

- Overview and trends
- Accounts
- Active sessions
- Inventory and item inspectors
- Configuration sections
- Templates
- Export studio
- Notifications
- Item database
- Settings

Current status: detailed UI with dummy data. Live provider authentication, storage mapping, and API integration are planned and require a server-side adapter. Do not imply that dummy values are live.

The interface must scale toward 1,000–2,000+ accounts and large inventories. Use search, filtering, pagination, and eventually virtualization rather than rendering unlimited detailed records.

### 9. Redfinger Operations

A VPS-backed command surface for approximately 200+ devices across up to five Redfinger sessions.

Required capabilities:

- Device status and remaining days
- Expiry date
- Session, region, and Android version
- Search and filters
- User-selectable density from 2 to 20 devices per row
- Passive landscape screenshot preview
- Device detail view
- Timestamped fetch and command logs
- Reboot and renewal actions with confirmation
- Automatic refresh countdown

Safety rule: screenshots may come only from passive thumbnails or a read-only screenshot endpoint. Never open or click inside a remote device merely to capture its screen.

### Supporting systems

- Server authentication and persistent secure sessions
- AES-256-GCM encrypted vault snapshot storage
- Revision-aware vault synchronization and conflict protection
- Private and public/member script storage and tokenized delivery
- Object-storage configuration and signing support
- Provider-balance configuration/display path
- Authenticated farm trade-diagnostic ingestion and bounded log retrieval
- Preview/production publishing through isolated Caddy roots
- Playwright coverage for Adopt Me, Redfinger, shared UI density, mobile overflow, and XLS/XLSX compatibility
- RTK terminal-output optimization
- Graphify repository indexing and hooks
- Obsidian project knowledge base
- Preview-wide component density layer and global workspace switcher

## Development History

### Important decisions

- Saturnity Vault migration behavior was preserved while The Fool was built around it.
- `vault[]` remains the single source of truth; extensions consume or update it through defined workflows rather than maintaining parallel account stores.
- Browser-only persistence was insufficient for multi-device use, so a private Node/SQLite backend and encrypted snapshots were introduced.
- The local PIN ceased to be the private security boundary after server authentication was added. The shared hub keeps a separate restricted touch PIN.
- Major tools moved toward dedicated pages because placing every feature in one page or popup produced cramped, difficult-to-maintain layouts.
- Settings and integration credentials were removed from normal primary navigation and placed behind an owner-only private entry.
- The public hub became a separate permission surface rather than a reduced-looking copy of the private vault.
- Adopt Me was separated into an authored React workspace so complex operational components could be maintained outside the monolithic main document.
- Redfinger was designed as a server-owned integration. The website is a command/status surface, not the holder of provider credentials or browser sessions.
- Preview and production publishing remain separate so design and behavior can be tested before release.
- Repository structure was reorganized conservatively. Stable entrypoints stayed at the root; documentation, research, tests, archives, generated artifacts, and knowledge output were separated.

### Problems already solved

- Vault data no longer needs to depend only on one browser’s storage.
- Refresh-time sign-in probes begin early and reuse the session check to reduce perceived authentication delay.
- Group-selection hover animation no longer intentionally controls selection geometry; selectable surfaces must remain stable under the pointer.
- Public/shared scripts can be created and deleted subject to permission rules, while owner-published scripts remain protected.
- XLS as well as XLSX input is supported by the username extraction compatibility path.
- Redfinger cards preserve the same internal structure from 2 through 20 columns, including square card geometry and landscape captures.
- Redfinger production mode is separated from deterministic `?demo=1` data and must not silently substitute mock devices.
- Adopt Me gained dense sessions, square inventory, item inspection, configuration/template workbenches, export controls, a Base UI drawer, React Aria Select, and an interactive Recharts trend.
- Shared tools were converted from oversized modal workflows into sidebar-accessible full-page workspaces.

### Rejected or superseded approaches

- **Browser-local vault as the only database:** rejected because other devices saw empty data and refresh/browser boundaries were unreliable.
- **Local PIN as private authentication:** superseded by server login and secure sessions. A PIN remains only for restricted shared-tool access.
- **Hardcoded API keys or browser-stored provider credentials:** rejected because published client code and storage are not appropriate secret boundaries.
- **Direct provider/session scraping from a user’s normal Edge profile:** rejected. Research uses a separate Playwright persistent context and manual login.
- **Opening or interacting with a Redfinger device to capture its screen:** rejected because it could click or disturb the remote device. Only passive/read-only captures are acceptable.
- **One giant page containing every feature:** rejected because it produced cramped layouts, duplicated toolbars, and unclear navigation.
- **Large workflow popups:** rejected for primary tools; full pages are preferred. Dialogs remain for short decisions and inspectors.
- **GitHub as the active vault synchronization system:** removed from the current direction after server-backed storage was introduced.
- **Supabase:** discussed and explicitly not adopted. The current private Node/SQLite architecture remains authoritative.
- **Automatic real cookie-check submission:** rejected for the current client architecture. Existing checker/API UI remains provider-agnostic or mock-only unless explicitly approved.
- **High-frequency client polling without a bounded purpose:** rejected. Polling must show freshness, respect existing intervals, and remain server/provider aware.
- **Silent live-to-demo fallback:** rejected because mock data can be mistaken for real operational state.

## Current State

### What works now

- The main private application, protected vault workflows, server authentication, encrypted synchronization, scripts, shared hub, browser tools, Adopt Me preview, and Redfinger UI/backend boundary exist in the repository.
- Preview publishing is available at `preview.saturnity.site`; production and public hosts have separate responsibilities.
- Adopt Me and Redfinger have deterministic Playwright regression tests, including mobile-overflow checks.
- The repository has RTK, Graphify, Obsidian documentation, `AGENTS.md`, and `design.md` support for AI-assisted development.

### Incomplete or planned

- Adopt Me is not connected to live provider data. Its displayed accounts, inventories, charts, configuration, templates, and export rows are dummy UI data.
- The approved composable Radix-style Sidebar behavior is not yet one shared component across private, public, Adopt Me, and Redfinger surfaces.
- The main application remains a large compatibility-sensitive `index.html` with accumulated inline style/behavior layers.
- Remaining legacy non-React select controls have not all migrated to the accessible shared Select behavior.
- Authenticated visual-regression coverage for every private route is incomplete.
- Large-data virtualization for thousands of accounts/items is planned but not implemented.
- Redfinger live reboot, renewal, and passive-capture provider implementations remain restricted until proven safe. The precise current provider capability should be verified before enabling any command.
- The exact live Adopt Me authentication contract, database schema, item-icon source, provider limits, and synchronization model are unknown/unapproved.
- Graphify warns that its installed skill version and package version differ; this is maintenance information, not an application failure.

### Current limitations

- Several surfaces use different implementation technologies, so visual consistency currently depends partly on shared CSS rather than one universal component package.
- The main page’s single-file architecture increases regression risk and makes component extraction slow.
- Some live behavior depends on machine-local services, environment configuration, Caddy, external object storage, or provider availability that repository-only tests cannot prove.
- The working tree currently contains substantial user and in-progress changes. A new agent must not reset, overwrite, or discard them.

## Design direction

Follow `design.md` as the authoritative design specification.

Summary:

- Dark graphite, premium private-infrastructure aesthetic
- Existing Fool/jester artwork as the canonical brand mark and favicon
- Public Sans for UI; monospace for technical values
- Minimal but information-rich
- Compact 31–34 px controls
- Content-led component heights
- Approximately 8–10 px panel radius and 5–7 px control radius
- Restrained emerald, amber, and red for semantic status
- Full pages for substantial workflows
- Drawers for contextual detail and notifications
- Dialogs only for short choices, inspectors, settings, and confirmations
- No decorative oversized boxes
- No meaningless text added merely to fill empty space
- No generic AI-purple/glassmorphism dashboard styling
- Smooth purposeful motion that respects reduced-motion preferences

### Navigation direction

Use a global workspace switcher plus a contextual sidebar.

The approved future Sidebar model is composable and should support:

- Provider-controlled open/collapsed state
- Sticky header for brand and workspace switcher
- Scrollable grouped navigation content
- Sticky footer for identity and sign-out
- Persistent active route state
- Icon collapse on desktop
- Off-canvas or compact mobile navigation
- Tooltips in icon-only mode
- Sidebar rail/trigger
- `Ctrl+B` or `Cmd+B` toggle where appropriate

This shared behavior is planned but not yet implemented as one component across all legacy and React surfaces. Do not force a full framework rewrite to achieve it.

## UX rules

- Every server-backed surface needs loading, empty, error, stale, and success states.
- Empty states explain why no data appears and offer one relevant next action.
- Copy actions show immediate toast feedback.
- Reversible move, rename, delete, tag, and bulk actions should offer Undo.
- Destructive or costly actions require a clear confirmation showing the exact target and consequence.
- Search and filters compose rather than reset one another.
- Search highlighting should make matches visible.
- Automatic synchronization displays the next-refresh countdown and last successful refresh.
- Links that have been opened remain visually distinguishable.
- Components must not move or shake under the pointer.
- Fixed height is allowed only for a meaningful ratio or scrolling boundary.
- Do not truncate important information when the layout can be made denser or wider.

## Non-negotiable data rules

Do not:

- Change Saturnity Vault migration logic
- Change the vault JSON schema
- Change cookie/group field names
- Remove unknown-field preservation
- Break the `{ version, exported, vault }` export contract
- Replace `vault[]` as the source of truth
- Modify production databases or user data during design work
- Commit or publish `.env`, SQLite files, credentials, session folders, or vault exports
- Hand-edit generated `assets/adoptme-react.js`; edit `frontend/adoptme-preview.jsx` and rebuild it
- Silently fall back to dummy data in a live authenticated workspace
- Publish preview work to production without explicit approval

## AI Agent Instructions

1. Read project instructions and query Graphify before broad architectural work.
2. Inspect the actual implementation before proposing a replacement.
3. Prefer narrow compatible changes over rewrites.
4. Reuse existing components and dependencies before adding new libraries.
5. Implement and publish to preview first.
6. Run relevant Playwright tests, mobile-overflow checks, build checks, and `git diff --check`.
7. Update Graphify and the Obsidian knowledge base after meaningful architecture or component changes.
8. Ask for explicit approval before production deployment, credential use, external service setup, destructive changes, or schema migration.

Common commands are documented in `README.md` and `AGENTS.md`. All shell commands on this machine are expected to use the configured RTK prefix.

### Hermes working rules

- Start every task by reading `AGENTS.md`, `IDEA.md`, `design.md`, and the relevant files under `knowledge-base/project/` and `docs/`.
- Query the existing Graphify graph before broad codebase investigation. Update it after code changes.
- Inspect `git status` before editing. Treat all existing modifications and untracked files as user-owned work.
- Use authored sources. Never hand-edit generated `assets/adoptme-react.js` or vendor `assets/xlsx.full.min.js`.
- Prefer narrow, reversible changes. Do not rewrite the application merely to make the architecture more fashionable.
- Reuse existing components and dependencies. The current React surface already has Base UI, React Aria Components, Recharts, Motion, Lucide, and React.
- Follow `design.md` rather than default SaaS patterns. Preserve Public Sans, graphite surfaces, compact density, restrained semantic color, and the canonical Fool mark.
- Do not fill empty layouts with meaningless text. Reduce padding, minimum height, or redundant wrappers first.
- Preserve keyboard, touch, focus, scroll, mobile, and reduced-motion behavior.
- Test preview behavior before proposing production publication.
- Ask before credentials, external account setup, schema migration, destructive actions, or production deployment.
- Record durable architecture/design decisions in the knowledge base and keep documentation synchronized.

## Future Vision

### Immediate priorities

1. Continue the preview-wide component refinement and density audit.
2. Consolidate sidebar behavior without breaking legacy navigation or mobile layouts.
3. Reduce accumulated inline presentation layers in `index.html` carefully, with regression checks.
4. Finish Adopt Me component quality, information density, template/config fidelity, and scalable data architecture before connecting live data.
5. Continue Redfinger integration using server-owned sessions and normalized data, preserving confirmation and passive-capture safety.
6. Expand automated visual regression coverage for authenticated private pages and shared hub pages.

### Long-term direction

- A coherent family of focused workspaces connected through one global navigation and permission model
- A stable shared component contract usable by both React and legacy pages during gradual migration
- Scalable account, inventory, device, script, and log browsing for thousands of records
- Server-owned provider adapters with explicit scopes, bounded polling, observable failures, and no client-side secrets
- Stronger audit history, freshness indicators, conflict handling, and safe Undo across routine operations
- Better extraction of the monolithic main frontend into maintainable authored modules, performed incrementally with behavior-preservation tests
- Reliable visual regression baselines for desktop, tablet, and mobile
- Continued self-hosting on the owner’s infrastructure with Caddy, encrypted local data, and optional object storage for high-volume script delivery

## Important Context

- “Saturnity Vault v2.9” refers to the protected vault core. “The Fool” refers to the whole product shell.
- `saturnity.site` is private, `fool.saturnity.site` is restricted/shared, and `preview.saturnity.site` is the testing surface.
- The Fool mark already used by the dashboard is the canonical logo/favicon source. Do not replace it with a newly generated jester.
- The owner prefers compact, symmetrical, high-density layouts. Oversized boxes, truncated text, generic popups, and unexplained empty space have been recurring design problems.
- The owner prefers full-page tools with sidebar entries. Popups are acceptable for confirmation, compact details, notifications, and short settings only.
- Human-facing shared-auth wording uses “fool me” and “log me out.”
- The hidden Fool-logo action is an intentional owner entry to private settings; it must not exist in the public edition.
- Bulk Lookup is conceptually part of the Vault workflow and may perform deliberate vault-connected actions.
- Shared username/account/link utilities are intentionally browser-local and isolated from the vault.
- The account splitter’s UPCE format means `username:password:cookie:email`.
- Redfinger device names are expected to be compact three-digit identifiers. Cards show session/region/Android shorthand and use passive landscape previews.
- Redfinger scale is approximately 200+ devices across three accounts/emails, with up to five server-side sessions desired.
- Adopt Me may eventually handle 1,000–2,000+ usernames/accounts and large inventories; do not choose a data presentation approach that requires every record to remain mounted.
- Provider documentation or captured dashboards are references, not authorization to copy credentials, scrape normal browser sessions, or enable live commands.
- The ZeroPoint checker contract and other provider documents may exist in the repository, but current client integration constraints still prohibit hardcoded keys and real credential processing unless the user explicitly changes scope.
- Unknown or changing external behavior must be verified from current documentation or a safe test. Never invent a provider endpoint, data field, limit, or permission.

## Definition of success

The Fool is successful when the owner can open one secure site and quickly understand the state of vault data, accounts, scripts, Adopt Me operations, and Redfinger devices; perform deliberate actions with clear feedback; safely share selected tools with collaborators; and continue expanding the system without losing data, exposing credentials, or degrading the compact design language.
