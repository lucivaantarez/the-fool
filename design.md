# The Fool Design Specification

Status: living internal specification  
Last reviewed: 2026-09-04  
Applies to: the private The Fool application, the public/shared hub, Adopt Me Operations, Redfinger Operations, and future first-party workspaces

This document records the design that exists in the repository and the direction already approved during development. It does not replace the product, migration, security, or deployment requirements in `docs/`, `AGENTS.md`, or `knowledge-base/`. When those documents impose a preservation or security constraint, that constraint has priority.

## Approved compact preview workspaces (2026-09-09)

- `assets/compact-workspaces.js` owns preview-only DOM composition; existing tool models, IDs, handlers and confirmations remain authoritative. `assets/compact-workspaces.css` is the explicitly scoped final composition layer after compatibility CSS.
- One modest page title, grouped tool-index rows, and input/result toolbars replace hero cards and repeated modal headings. Comparator exposes filtered-result TXT export; Splitter selects copy format separately from the existing TXT/JSON/CSV export contract; PS Links keeps its allowlist optional and generator separate.
- Desktop titles are 24-28px, mobile titles 22-24px; working labels and controls are 12-14px, metadata at least 11px on redesigned surfaces. Keep Public Sans and the graphite brand. This supersedes older 10-12px working-copy guidance.
- Below 980px, the shared navigation becomes an inert-when-closed drawer with keyboard containment and Escape focus restoration. Mobile interaction targets are 44px. Data Center uses action rows. Scripts starts with a selection state and uses a disclosure for sharing/raw URLs and a separate optional syntax preview.
- Redfinger density is a requested maximum, clamped by available width; mobile uses readable device rows with secondary controls in device details. Explicit demos label sample data and never replace failed live responses.
- Backend/authentication, vault models, migration, unknown fields and recovery wrapper remain out of scope. Shared unavailable presentation offers Retry and blocks PIN submission without changing authentication.

## 1. Product Identity

### Project purpose

The Fool is a private operations shell built around Saturnity Vault v2.9. Saturnity Vault remains the account and cookie data system; The Fool is the broader product that presents the vault alongside focused browser utilities, script distribution, encrypted server synchronization, operational monitoring, and purpose-built workspaces.

The product currently serves four distinct contexts:

- The private command center for dashboard metrics, vault management, bulk lookup, cookie/account utilities, data controls, scripts, and integrations.
- A restricted shared hub at `fool.saturnity.site` for tools and explicitly shared scripts without private vault access.
- Adopt Me Operations, a high-density React workspace that currently uses sample data and no provider credentials.
- Redfinger Operations, a fleet command surface backed by normalized server-side device snapshots and deliberately gated commands.

### Target users

The primary user is an owner/operator managing a large and growing collection of accounts, devices, scripts, and operational results. Secondary users are trusted collaborators who require selected utilities and shared scripts but must not see the private vault or configuration.

The interface assumes frequent, repeat use. Scan speed, reliable state, compact controls, and predictable placement matter more than marketing-style visual spectacle.

### Brand philosophy

The Fool should feel like private infrastructure with personality: controlled, discreet, slightly irreverent, and deliberately unlike a generic corporate admin template. It is not playful in the sense of bright colors or novelty animation. Its character comes from restrained jester imagery, direct language, dark material, and precise operational layouts.

### Meaning of “The Fool”

The name combines the Fool tarot archetype—movement, experimentation, and stepping into the unknown—with the jester as a private operator’s mark. The symbol is knowingly unconventional, while the system behind it remains serious. The mark should communicate ownership and identity, not comedy or visual noise.

### Intended feeling

- Premium private infrastructure
- Dark, elegant, and controlled
- Minimal, but information-rich
- Dense without becoming cramped
- Fast to scan and comfortable for long sessions
- Smooth and tactile, never animated merely for decoration
- Slightly rebellious in wording while remaining operationally clear

## 2. Visual Design System

### Color palette

The active design is monochrome graphite with restrained semantic color. The current source establishes these representative tokens:

| Role | Current value or family | Usage |
| --- | --- | --- |
| Page background | `#09090a`, `#0c0c0d`, `#0c0c0e` | Main canvas and workspaces |
| Sidebar background | `#101012` to `#121214` | Persistent navigation |
| Primary panel | `#111112` to `#151517` | Cards, tables, drawers, dialogs |
| Elevated panel | `#18181b` to `#1b1b1e` | Hover, selected rows, nested controls |
| Subtle border | `#242426` to `#37373c` | Structural separation |
| Strong border | `#3a3a3d` to `#49494f` | Focused or elevated components |
| Primary text | `#eceae4` to `#f0eee9` | Titles and important values |
| Secondary text | `#9b9892` to `#c9c7c1` | Descriptions and labels |
| Dim text | `#706d68` to `#8b8984` | Metadata and low-priority detail |
| Success | muted emerald, commonly `#45cf91` or `#71d69a` | Healthy, connected, available |
| Warning | muted amber, commonly `#c8b485` or `#e0b768` | Expiring, watch, pending |
| Danger | muted red, commonly `#d98a8a` or `#e97979` | Destructive, offline, blocked |
| Secondary informational accent | restrained slate-violet | Adopt Me inventory/category distinction only |

Rules:

- Monochrome neutrals own the interface. Semantic colors communicate state; they are not decorative theme colors.
- White or off-white primary buttons are reserved for a page’s strongest action.
- Avoid blue/purple “AI dashboard” gradients. Existing subtle radial illumination may provide depth, but must not compete with data.
- Never depend on color alone. Status needs text, icon, shape, or accessible labeling.

### Typography

- Primary UI typeface: **Public Sans**, with `system-ui` fallback. It is implemented across preview/private surfaces and the React Adopt Me workspace.
- Technical content: **Share Tech Mono**, Cascadia Mono, or a system monospace fallback. Use for identifiers, timestamps, compact labels, raw data, source code, URLs, and machine states.
- Headings use Public Sans with strong weight, tight letter spacing, and compact line height.
- Body text must remain readable. Descriptions should normally be 12–14 px in redesigned desktop workspaces, with sufficient line height; critical instructions must not be reduced to metadata size.
- Uppercase tracked micro-labels are reserved for section categories, metric names, and technical context.
- Do not mix unrelated display typefaces or use stylized fonts inside data-heavy surfaces.

### Layout philosophy

The default is a persistent left navigation rail and a bounded, fluid content inset. Within pages:

- Prefer a page heading followed by a compact metric strip, toolbar, and primary work surface.
- Use CSS Grid for repeated items and stable column alignment.
- Let content determine height. Fixed or minimum height is permitted only when it preserves an explicit invariant, such as a landscape screen preview or a square inventory tile.
- Empty space must express hierarchy or improve scanning. Do not create oversized cards to make a page look “full.”
- Do not fill unused space with decorative prose. Improve wording when context is unclear; otherwise tighten the container.
- Keep high-frequency filters and search controls visible before large result sets.
- Each substantial tool receives a full page. Modal overlays are for short decisions, inspectors, confirmations, and settings—not entire workflows.

### Spacing rules

The implemented shared density layer defines a practical scale:

- 6 px: icon/text micro-gaps and tightly related controls
- 10 px: normal component gaps
- 14 px: panel padding and section separation
- 18–24 px: page headings or major workbench boundaries
- 32 px: standard compact control height

Use the smallest spacing that preserves grouping and touch usability. Repeated cards in the same grid must use equal gaps and aligned internal padding.

### Component style

- Panel radius: approximately 8–10 px.
- Button/input radius: approximately 5–7 px.
- One-pixel graphite borders establish hierarchy; shadows are restrained and mainly reserved for floating surfaces.
- Cards are used only when a boundary is meaningful. Otherwise use dividers, rows, or grouped sections.
- Hover changes background and border slightly. Active state must remain visible after selection.
- Focus-visible state must be explicit and keyboard accessible.
- Components should support loading, empty, error, active, disabled, and destructive states where applicable.

### Iconography

- Current React workspaces use Lucide icons because the dependency and icon language are already established.
- Use one coherent outline family per surface, normally 15–18 px with consistent stroke weight.
- Choose an icon that describes the actual action: search, refresh, download, copy, filter, reboot, renew, settings, or inventory.
- Do not use arbitrary emoji for application navigation or actions.
- Compact icon-only buttons require an accessible name and tooltip. Destructive icon actions must not rely on icon interpretation alone at confirmation time.

### Branding elements

- Canonical mark: the transparent/isolated Fool jester mark already used by the dashboard, stored in `assets/`.
- Favicon and product marks should use the same approved jester artwork, not a generated replacement.
- The brand lockup uses the mark, **THE FOOL**, and a contextual subtitle such as **PRIVATE VAULT** or **SHARED WORKSPACE**.
- Large decorative use of the mark must be grayscale and subordinate to page content.
- The intentionally irreverent time-based greeting is allowed on dashboard welcome surfaces; operational instructions should remain precise.

## 3. UI Structure

### Global navigation model

The product uses multiple full-page workspaces with two navigation levels:

1. A product/workspace switcher for moving between major systems.
2. A contextual sidebar for pages inside the current system.

The preview currently implements a compact global workspace switcher grouped into Core, Operations, and Data. The private shell, shared hub, Adopt Me, and Redfinger each have an existing sidebar implementation.

**Planned:** consolidate sidebar behavior around the approved composable Radix-style model: provider, sticky header, scrollable grouped content, sticky footer, active menu items, icon collapse on desktop, off-canvas behavior on mobile, a sidebar rail/trigger, and `Ctrl+B`/`Cmd+B` support. This is not yet a single shared component across all surfaces. Migration must preserve the existing routes and non-React entrypoints rather than forcing a framework rewrite.

### Private command center

Visible primary navigation:

- Dashboard — operational summary and fast entry into major workflows.
- Vault — the canonical `vault[]` management interface.
- Bulk Lookup — vault-connected bulk inspection and group/tag workflows.
- Cookie Tools — cookie-oriented utilities and checker architecture.
- Account Tools — username comparison, extraction, splitting, and related account utilities.
- Data Center — secure sync, imports/exports, data operations, and protected server state.
- Scripts — private script repository, editing, delivery URLs, and sharing controls.
- Adopt Me — standalone operations workspace entry.
- Redfinger — fleet operations workspace entry.

Hidden/private entry:

- Clicking the Fool brand mark opens private settings and integrations. This remains intentionally absent from the public hub.

### Shared hub

The public/shared edition has a touch-first PIN entry followed by a restricted sidebar. It exposes:

- Dashboard
- Usernames (comparator and extractor)
- Account Splitter
- PS Links
- Explicitly shared/member scripts

It never exposes the vault, private scripts, API settings, private integrations, or server administration.

### Workspace user flow

The normal flow is: authenticate or unlock → choose a workspace → add/search/filter input → review results → copy/export/execute an explicitly confirmed action → receive visible feedback. Navigation should not discard unsaved work without warning.

## 4. Component Library

### Sidebar

Purpose: establish location, workspace identity, and primary navigation.

Appearance: fixed graphite rail, clear brand header, grouped navigation, selected row, and compact footer identity/action area.

Behavior: active route is persistent; desktop may collapse to icons; mobile becomes a bottom/off-canvas navigation appropriate to available destinations. Tooltips appear in icon mode. Content scrolls independently when navigation exceeds viewport height.

Usage rules: do not place page-specific actions in the global sidebar. Do not expose private groups in shared mode. Use badges only for actionable counts.

Status: multiple implementations exist; shared composable behavior is planned.

### Workspace switcher/navigation menu

Purpose: move between major product areas without restoring a generic “Tools” dumping ground.

Appearance: compact trigger near the navigation header with grouped destinations.

Behavior: opens on click/keyboard, marks the current destination, closes on outside click or Escape.

Status: implemented on preview entrypoints through `assets/global-nav.js` and `assets/global-nav.css`.

### Buttons

Purpose: perform actions with a visible priority hierarchy.

Appearance: 31–34 px compact controls; neutral bordered default, quiet/ghost secondary, off-white primary, muted red destructive.

Behavior: hover, active, focus-visible, disabled, loading, and success feedback must be distinguishable. Icon-only buttons require `aria-label` and title/tooltip.

Usage rules: one strongest action per action cluster. Avoid duplicate buttons that trigger the same workflow.

### Select

Purpose: choose one value from a bounded list.

Appearance: compact themed trigger and anchored popover with selected indicator.

Behavior: keyboard navigation, focus management, click-away dismissal, and accessible option roles.

Status: React Aria Select is implemented in Adopt Me for chart range, configuration, template, exporter, and modal scope controls. Native non-React selects remain elsewhere and should be migrated only through a compatible shared primitive, not by adding React to every legacy page.

### Filters

Purpose: reduce visible records without hiding filter state.

Appearance: compact trigger showing label and selected value; multi-select uses a small anchored checklist popover.

Behavior: selected filters remain visible, reset is available, and results update immediately or through a clear Apply action. Search and filters compose rather than overwrite one another.

### Cards and surfaces

Purpose: group one coherent object or responsibility.

Appearance: graphite panel, subtle border, tight header, and content-led height.

Behavior: clickable cards show hover/focus state; selected state persists. A card must not shake or move under the pointer.

Usage rules: do not use a large card for one or two words. Remove unnecessary minimum height. Preserve explicit ratios for inventory tiles and Redfinger previews.

### Tables and lists

Purpose: compare many structured records efficiently.

Appearance: aligned columns, subdued header labels, thin row dividers, and stronger primary values.

Behavior: search highlighting, filtering, selection, sorting where meaningful, and visited/opened state for links. Large lists require bounded rendering or pagination.

### Status indicators

Purpose: make current operational state scannable.

Appearance: small dot, badge, or compact label using semantic color.

Behavior: expose an accessible text label. Timestamps state freshness separately from status.

### Dialogs and confirmations

Purpose: short decisions, irreversible-action gates, focused item inspection, or compact settings.

Appearance: blurred/scrimmed overlay and a content-sized dialog. Long workflows must not be dialogs.

Behavior: focus is trapped, Escape/backdrop behavior is deliberate, and closing restores scroll and interaction. Destructive confirmation names the target and consequence.

### Drawers and inspectors

Purpose: retain page context while showing a record’s detail, notifications, or secondary controls.

Appearance: narrow right-side surface with compact header, scrollable body, and pinned footer actions.

Behavior: dismissible with close, Escape, and appropriate backdrop interaction. Mobile uses the available viewport safely.

Status: Adopt Me notification drawer uses Base UI; other legacy panels use existing DOM/CSS behavior.

### Toasts and notifications

Purpose: transient confirmation for copy, save, move, rename, tag, sync, or command staging.

Appearance: compact, high-contrast message near a stable viewport edge.

Behavior: does not block work; provides Undo when the underlying operation is safely reversible. Persistent failures belong inline or in logs rather than disappearing only as a toast.

### Charts

Purpose: reveal trend and change, not decorate an empty dashboard.

Appearance: restrained grid, emerald primary series, muted graphite-violet secondary series, compact legend, and themed tooltip.

Behavior: date range changes the visible data; hover reveals exact values.

Status: the Adopt Me overview uses Recharts with 7/30/90-day ranges and dummy data.

### Logs and timelines

Purpose: provide an auditable sequence of fetches, commands, syncs, and errors.

Appearance: timestamp-first rows, event category, target/context, and concise result.

Behavior: newest activity is easy to locate; filters do not erase history; empty state explains what will generate events.

### Empty states

Purpose: explain absence and give the next valid action.

Appearance: compact inline state matching the final content area, not an oversized blank card.

Behavior: distinguish no data, no results, disconnected provider, permission denial, and loading failure.

## 5. Page Specifications

### Dashboard

Purpose: command-center overview and navigation. Show meaningful totals, health, recent activity, provider balance where configured, and direct paths to current work.

Actions: open a workspace, refresh relevant data, review activity, or enter the shared hub.

States: authenticated/unauthenticated, loading metrics, partial provider failure, empty vault, sync attention.

Future: refine trends and activity only when backed by real data; avoid invented graphs.

### Vault and Bulk Lookup

Purpose: manage `vault[]`, groups, cookies, tags, ban state, and bulk inspection while keeping the vault as the single source of truth.

Actions: add, rename, move, copy, filter, import/export, apply dated rate-limit tags, and undo eligible mutations.

States: empty vault, filtered empty, selected groups, sync conflict, import preview, destructive confirmation.

Protected rule: do not change migration logic, schema, unknown-field preservation, or export contract as part of UI work.

### Cookie Tools

Purpose: present cookie-related workflows and the provider-agnostic API-ready checker architecture.

Current status: UI/service architecture exists without hardcoded credentials or real cookie submission.

Future: provider connection remains server/configuration work and requires explicit authorization and security review.

### Account Tools

Purpose: compare usernames, extract usernames from mixed/file input, and split supported UP/UC/UPC/UPCE account lines.

Actions: multi-file input, paste, filter results, select individual rows, copy selected/all, and export supported formats.

States: no input, unsupported/empty file, duplicate results, no matches, parse summary, export-ready.

### Data Center and Private Settings

Purpose: secure server sync, controlled imports/exports, API/integration configuration, and owner-only operational settings.

Actions: sign in/out, upload/download a vault snapshot, inspect sync health, and save approved integration configuration.

States: first-time setup, signed out, authenticated, conflict, backend unavailable, credential configured/not configured.

### Scripts

Purpose: manage multiple Lua/script files with source editing, syntax-oriented presentation, names, raw delivery URLs, curl, and generated `loadstring(game:HttpGet(...))()` copy output.

Actions: create, edit, rename, delete with confirmation, share/unshare, copy URL/curl/loadstring.

States: empty repository, loading, save failure, object-storage failure, shared/private, token unavailable.

### Shared Hub

Purpose: friend-safe browser utilities and shared scripts with no path into the private application.

Actions: PIN unlock, run standalone tools, manage permitted member scripts, copy delivery links, and lock/log out.

States: locked, invalid PIN, unlocked, no shared scripts, owner-protected script, member-editable script.

### Adopt Me Operations

Purpose: visualize account groups, active sessions, inventories, provider-compatible configuration concepts, templates, exports, notifications, and item data.

Current sections: Overview, Accounts, Sessions, Inventory, Config, Templates, Exporter, Notifications, Item Database, and Settings.

Current status: detailed React UI with dummy data. It does not contain live provider credentials or a live ZekeHub integration.

Future: connect only through an approved server-side adapter, validate the provider schema, replace dummy data deliberately, and preserve account/inventory scalability for thousands of records.

### Redfinger Operations

Purpose: scan up to hundreds of devices across multiple sessions, see availability and expiry, inspect passive landscape captures, and stage reboot/renew actions.

Actions: search/filter, choose 2–20 cards per row, inspect logs, open device detail, refresh a passive capture, reboot, and renew with confirmation.

Current status: authenticated API boundary and normalized snapshot/event storage exist. Demo mode uses dummy devices; normal mode must never fall back silently to mock data.

Safety: previews may use only passive thumbnails or read-only screenshot endpoints. Never click or open a remote device merely to capture its screen.

## 6. Interaction Design

- Loading: use shape-matched skeletons or concise inline loading text. Prevent layout jumps.
- Errors: explain what failed, retain user input, and offer a safe retry. Authentication and sync errors remain visible.
- Confirmations: required for delete, destructive bulk action, reboot, renewal, server overwrite, and other costly/irreversible actions.
- Undo: preferred after reversible delete, move, rename, tag, and bulk actions.
- Copy feedback: every copy action produces a toast and may briefly update the button label/state.
- Empty states: state why the surface is empty and provide one relevant next action.
- Search: highlight matching text where useful and retain filters while searching.
- Real-time updates: display last-sync time and next automatic refresh countdown. Manual refresh remains available.
- Polling: must be bounded, pause appropriately when hidden/offline, and never imply freshness after failure.
- Motion: 150–250 ms for common state changes; longer motion only for drawers. Respect reduced-motion preferences. Never animate a selectable card in a way that makes it move away from the pointer.

## 7. Data Presentation

Visual priority should follow this order:

1. Current state and urgent exception
2. Primary identity (group, username, device, job, script)
3. Important value or expiry
4. Freshness/timestamp
5. Secondary metadata
6. Available actions

Tables are preferred for cross-record comparison. Cards are preferred for visual inventory, device previews, or records with a small independent action set. Metric strips summarize a page but do not replace detail. Charts appear only when a temporal relationship matters. Logs preserve timestamps, event type, target, and outcome.

For thousands of accounts or items, use search, filters, pagination/virtualization, stable row heights, and summary counts. Do not render every detailed record simultaneously merely because the data is available.

## 8. Security and Permission UX

### Authentication

- The private site uses server authentication rather than the obsolete local-only PIN as its security boundary.
- Sessions are represented by secure cookies and should survive normal refreshes until expiry/sign-out.
- The shared site uses a separate touch PIN and a separate restricted session. “fool me” is the intended entry action; “log me out” is the intended human-facing exit wording where appropriate.

### Protected areas

- Private vault, settings, credentials, provider configuration, private scripts, and server data are never rendered in the shared hub.
- Hidden navigation is not a security boundary; the backend must independently authorize every protected endpoint.
- Settings accessed through the brand mark remain owner-only and unavailable in the shared edition.

### Sensitive information

- API keys and credentials must not be hardcoded, logged, or stored in browser-visible source.
- The backend binds to loopback and sits behind Caddy.
- Vault snapshots are encrypted before SQLite storage.
- Passwords use salted scrypt hashes; private sessions are random, hashed, `HttpOnly`, `Secure`, and `SameSite=Strict`.
- Script delivery tokens may appear in intentionally copied raw URLs, but private application credentials must never be embedded in those URLs.

### Permission visibility

Unavailable actions should either be absent when revealing them creates confusion/security risk, or visibly disabled with an explanation when awareness is useful. Owner-published scripts remain protected from public-member edits.

## 9. Responsive Behavior

### Desktop

- Persistent left sidebar with fluid main content.
- Dense multi-column grids and aligned toolbars.
- Sidebar icon-collapse is the desired common behavior.
- Redfinger supports a user-selected 2–20 device columns while preserving card proportions.

### Tablet

- Reduce grid columns before shrinking text below readable sizes.
- Toolbars may wrap into two compact rows.
- Detail drawers may occupy a larger fraction of the viewport.
- Preserve page-level hierarchy and keep primary actions visible.

### Mobile

- No horizontal page overflow.
- Navigation becomes bottom/off-canvas rather than consuming a permanent wide rail.
- Inputs, paste areas, and result panels stack vertically.
- Two-column compact metrics/inventory are allowed when labels remain legible; otherwise use one column.
- Dialogs and drawers must fit within `100dvh`, scroll internally, and leave an obvious close action.
- Redfinger defaults to two cards per row and retains landscape previews and identical internal card structure.

### Resizing rules

- Geometry must remain stable as density changes. Controls may scale within bounds, but identity/action order and ratios do not change.
- Prefer responsive grids with `minmax()` and explicit breakpoints over content-dependent wrapping that creates asymmetry.
- Test 360 px mobile, common tablet widths, 1440 px desktop, and wide desktop layouts.

## 10. Future Design Roadmap

The following are planned directions, not authorization to change behavior:

1. Consolidate all sidebars into a shared behavioral contract based on the approved composable Radix-style Sidebar pattern, with adapters for React and legacy pages.
2. Move remaining native single-select controls to an accessible shared select primitive where the host technology permits it.
3. Reduce accumulated inline CSS in `index.html` by extracting stable authored component layers without changing routes or application logic.
4. Formalize shared design tokens for color, spacing, control height, radius, typography, and motion.
5. Add automated visual regression checks for private authenticated pages, shared hub pages, Adopt Me, and Redfinger.
6. Add scalable virtualized list/table patterns before live datasets exceed comfortable DOM limits.
7. Replace Adopt Me dummy data only after a provider adapter, authentication model, database mapping, and icon asset pipeline are approved.
8. Add consistent skeleton, error, and offline states for every server-backed surface.
9. Add command palette or global search only if it reduces navigation time; do not duplicate the sidebar.
10. Continue density audits by measuring content-to-container fit rather than adding filler content.

## 11. Design Decisions Log

| Decision | Reason | Status |
| --- | --- | --- |
| Rename the product shell to The Fool while preserving Saturnity Vault v2.9 as the vault core | Separates product identity from protected vault data behavior | Implemented |
| Use a dark graphite, premium private-infrastructure visual language | Matches long-session operational use and the established Fool identity | Implemented |
| Use Public Sans for the primary interface | Clear, professional, compact, and consistent across surfaces | Implemented |
| Use the approved Fool jester artwork for brand and favicon | Maintains one recognizable identity and avoids generated substitutes | Implemented; production cache should be checked after asset changes |
| Keep `vault[]` as the single source of truth | Prevents divergent account/cookie state and protects migration compatibility | Implemented/protected |
| Give substantial tools their own pages rather than large workflow popups | Improves visibility, mobile use, and information architecture | Implemented for shared tool pages and standalone workspaces; legacy exceptions remain |
| Keep settings and credentials out of primary navigation and out of the shared hub | Reduces clutter and enforces the private/public boundary | Implemented |
| Use modular provider-agnostic API UI architecture without hardcoded keys | Keeps credentials and provider coupling out of client source | Implemented architecture; provider connections vary |
| Use Base UI for the Adopt Me notification drawer | Provides accessible drawer behavior in the React surface | Implemented |
| Use React Aria for reusable single-select controls | Provides accessible selection behavior and themed popovers | Implemented in Adopt Me |
| Use Recharts for meaningful Adopt Me trends | Supports interactive data presentation without hand-built chart behavior | Implemented with dummy data |
| Preserve square Adopt Me inventory tiles and landscape Redfinger captures | These ratios improve scan density and represent the content accurately | Implemented and tested |
| Permit Redfinger density from 2 to 20 cards per row without structural drift | Supports fleets of hundreds of devices across screen sizes | Implemented and tested |
| Use passive/read-only device captures only | Prevents accidental remote-device interaction | Implemented as a safety boundary |
| Keep public tools browser-local and isolated from the vault | Trusted collaborators need tools without private data access | Implemented |
| Use a workspace switcher plus contextual navigation | Makes major systems discoverable without one overcrowded Tools page | Implemented on preview |
| Standardize sidebars around a composable provider/header/content/footer/rail model | Creates consistent collapse, mobile, grouping, and accessibility behavior | Planned |
| Remove decorative empty height instead of filling it with meaningless copy | Preserves density and makes every container purposeful | Implemented as an ongoing refinement rule |
| Preview changes before production publishing | Protects the live site and supports visual/behavioral review | Implemented workflow |

## 12. AI Development Guidelines

Future AI agents must:

1. Read `AGENTS.md`, this file, `knowledge-base/project/`, and applicable product/operations documentation before changing UI architecture.
2. Treat existing product context as authoritative. Do not substitute a generic SaaS dashboard, default shadcn appearance, glassmorphism, or AI-purple visual language.
3. Determine whether a feature is implemented, preview-only, mock data, or planned before describing or changing it.
4. Preserve `vault[]`, export/migration behavior, unknown fields, database contents, credentials, and security boundaries.
5. Reuse the established component system. Do not add a second library when Base UI, React Aria, existing React primitives, or a small compatible DOM adapter already solves the problem.
6. Maintain the graphite palette, Public Sans typography, restrained semantic color, 8–10 px panel radii, and compact 32 px controls unless this document is deliberately revised.
7. Prefer content-led height. Investigate oversized boxes, unnecessary minimum heights, duplicate wrappers, and excessive padding before adding text or decoration.
8. Use full pages for workflows and dialogs/drawers for short, contextual tasks.
9. Preserve mobile scrolling, prevent horizontal overflow, and test layout at 360 px and desktop widths.
10. Keep icons coherent, meaningful, accessible, and from the established family for the surface.
11. Add loading, empty, error, confirmation, and feedback states appropriate to the feature’s risk.
12. Never make a destructive control faster by removing its confirmation or target summary.
13. Modify authored source, not generated bundles. Build `frontend/adoptme-preview.jsx` into `assets/adoptme-react.js` through the package script.
14. Keep `index.html`, standalone entrypoints, assets, and `publish-saturnity.ps1` compatible with the Caddy preview/production flow.
15. Verify relevant Playwright checks, mobile overflow, build output, and `git diff --check` after UI work.
16. Update Graphify and the Obsidian project notes when component architecture or durable design decisions change.
17. Do not publish preview work to production unless the user explicitly approves production deployment.

Before creating a new component, answer:

- Does an existing component already own this behavior?
- Is this a page workflow, contextual drawer, short dialog, row, card, or simple control?
- What are its loading, empty, error, disabled, active, and destructive states?
- Does its container fit its real content?
- Can it work with keyboard, touch, mobile width, and reduced motion?
- Does it preserve private/shared and vault/provider boundaries?

If any answer is unclear, inspect the relevant implementation and this document before adding code.
