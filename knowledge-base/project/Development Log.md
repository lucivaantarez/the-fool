# Development Log

## 2026-10-21 - Hostname consolidation and shared-hub entry cleanup

- Parked `fool.saturnity.site`. Backed up the Caddy configuration, commented its site block with the reason, validated, and reloaded with the AI basic-auth/internal-token environment loaded so no secret-dependent block lost its value. Zero downtime: the reload kept one Caddy process.
- Verified after reload: `saturnity.site` 200, its API 200, `preview.saturnity.site` 200, preview API 200, `/mlbb-lore/` 308, `ai.saturnity.site` 401 (basic auth still enforced, proving the secret loaded), and `fool.saturnity.site` now fails at the edge as intended.
- Removed every reference to the parked hostname from the private application. The dashboard shared-tools action and the login-gate shared link now target the in-app `?shared-preview=1` route and are injected only on the preview host; the private settings card and PIN modal no longer advertise the hostname. The link is same-origin now, so the `_blank` target was dropped.
- Updated the anti-slop behavior assertions for the new same-origin target, removed the parked hostname from the live favicon audit, and pointed the shared-root visual audit at the preview shared route.
- Verification: 50 behavior checks passed, 54 visual captures with no page errors or horizontal overflow, Adopt Me, XLS/XLSX, and Redfinger suites green. Published to preview only; production remains untouched and still carries the older August build by owner decision.
- Recorded that `ts.saturnity.site` belongs to the separate TrackStat project. Its DNS already points at this host, but no Caddy block exists and its own documents state preparation only, so it stays unserved until it is ready.
- Known leftover: `SATURNITY_ALLOWED_ORIGINS` still lists the parked origin as a default. It is inert because nothing can send that origin now, and changing backend configuration needs explicit approval.

## 2026-10-21 - Uptime recovery and repository checkpoint

- Restored local uptime after a five-day outage. Root cause was host lifecycle, not application code: the machine had not rebooted since 2026-09-18 so boot-triggered tasks never fired again, the `Saturnity Backend` watchdog task had been disabled on 10-11, and Caddy stopped on 10-16 with nothing to restart it.
- Restarted the loopback backend and Caddy, re-enabled the backend watchdog, and verified `127.0.0.1:8787/api/health`, preview, production, and shared hosts all return 200 with valid certificates.
- Added `C:\caddy\watch-caddy.ps1` and the `Saturnity Caddy Watchdog` task so Caddy has the same single-resident-process supervision as the backend, and disabled the old direct `SaturnityCaddy` start task to keep one lifecycle owner. Proved recovery by killing Caddy: local `:443` returned within about ten seconds and the public hosts returned 200 again, with no duplicate instance.
- Documented both watchdogs in `docs/operations/HOSTING.md`.
- Checkpointed the long-running working tree into eight scoped commits covering the Redfinger service boundary and trade-log ingestion, the backend watchdog, the standalone Redfinger workspace, the Operations OS preview presentation layer through v247, the read-only Adopt Me watcher, the anti-slop verification gate, project/design documentation, and the refreshed code graph. No secrets, databases, vault exports, or session data were added.
- Verification gate passed on the committed tree: 50 behavior checks, 54 visual captures with no page errors or horizontal overflow, Adopt Me navigation, XLS/XLSX compatibility, and the Redfinger fleet suite. Published preview files remain byte-identical to the repository entrypoints.

## 2026-09-14 - Operations OS navigation and Adopt Me Watcher cleanup

- v204: Enlarged Redfinger mobile passive-detail affordances into readable dark rounded pills while preserving the read-only sample fleet, passive capture wording, and disabled provider-command boundary.

- v205: Strengthened Adopt Me Watcher tablet/mobile inventory `View owners` affordances into readable operation pills while preserving sample/demo boundaries and owner-popup behavior.

- v206: Enlarged Inbox desktop/tablet workflow launch `Open` controls into readable operation pills while preserving honest empty-review state and route targets.

- v207: Converted Dashboard desktop Workspaces route arrows into readable dark operation pills while preserving route targets and vault-derived empty-state wording.

- v208: Normalized Vault desktop `List`, `A→Z`, and `MD` card-size header toggles into dark rounded pills while preserving view/sort/card-size behavior and the `vault[]` contract.

- v209: Strengthened Adopt Me Watcher desktop inventory `View owners` affordances into readable owner-inspection pills while preserving sample/demo boundaries and owner-popup behavior.

- v210: Tightened Bulk Lookup desktop intake spacing so the username list, lookup controls, and empty results stay in one compact workflow block while preserving browser-local matching and confirmation-gated move behavior.

- v211: Tightened Cookie Extractor desktop intake spacing so the masked lookup input, extract controls, and empty results stay in one compact workflow block while preserving vault-read masking and confirmation-gated actions.

- v212: Converted Account Ops mobile launch rows into compact boxed workflow cards while keeping all seven preserved routes visible and tappable in the first mobile viewport.

- v213: Converted Cookie Operations mobile review routes into compact boxed workflow cards while preserving masked-review wording, review actions, and the confirmation-gated state cards.

- v214: Tightened the Vault mobile header into one compact command row plus a full-width search row while preserving Bulk Lookup, view/sort, add, and menu actions.

- v215: Tightened Username Extractor mobile file-import and empty-result framing with readable status pills while preserving browser-local parsing, copy/export unlock behavior, and no vault writes.

- v216: Converted the PS Links mobile allowlist filter into a compact browser-local boundary row while preserving paired extraction, copy/download, and Link Generator handoff behavior.

- v217: Split Account Splitter mobile browser-local and copy/export unlock wording into compact boundary chips while preserving browser-local parsing and export behavior.

- v218: Converted Batch Validator mobile read-only/result state labels into compact boundary chips while preserving vault-read-only validation and copy behavior.

- v219: Converted Username Comparator mobile file-count and result-state labels into compact boundary chips while preserving browser-local compare, copy, export, and clear behavior.

- v220: Converted Data Center mobile recovery/import/sync state labels into compact boundary chips while preserving recovery download, import review, integrity check, and no-provider-data boundaries.

- v221: Capped the Redfinger tablet passive device scan at two readable columns, enlarged tablet card metadata/action touch targets, and made the density label report the tablet cap honestly while preserving server-owned/read-only command boundaries.

- v222: Boxed Dashboard tablet Recent Activity empty state into a compact, labeled vault-activity card while preserving honest no-activity wording, vault metrics, and workspace routing.

- v223: Tightened Scripts unavailable repository/editor/recovery status cards into compact state-chip cards while keeping private editor, source, distribution, and raw URL controls hidden when the private API is unavailable.

- v224: Improved Redfinger desktop passive device-card days/date caption contrast while preserving the dense scan grid, all density modes, and read-only/confirmation-gated command boundary.

- v225: Lifted the tablet/desktop owner login gate out of dead-center vertical whitespace while preserving owner authentication, shared-tools routing, and mobile card fit.

- v226: Lifted the shared/public unavailable gate on tablet and desktop while preserving mobile fit, Retry behavior, PIN-unavailable state, and the no-private-vault/control boundary.

- v227: Tightened Dashboard desktop Recent Activity empty state into a compact labeled vault-activity card while preserving honest no-activity wording, workspace routing, and vault-derived metrics.

- v228: Tightened Inbox desktop review entry cards into left-scannable operator workflow entries while preserving honest empty-review wording, review routing, and no invented task data.

- v229: Tightened Data Center desktop recovery workflow spacing so the recovery brief, action cards, and state strip read as one compact preservation workflow while preserving recovery download, import review, integrity check, and no-provider-data boundaries.

- v230: Tightened Scripts tablet unavailable repository/editor/recovery states into one connected locked-status row while preserving the private API offline boundary, Data Center recovery route, and hidden editor/source/raw URL controls.

- v231: Tightened Vault mobile cookie-triage spacing so the paste/search input, empty result, and write-on-confirm helper stay visible in the first mobile viewport while preserving masked values, confirmation-gated actions, and the `vault[]` contract.

- v232: Tightened Dashboard mobile spacing so Start Here, Recent Activity, and the first Operating State boundary card read as one first-viewport home scan while preserving honest vault-derived metrics, shared-tools routing, and no fake provider status.

- v233: Restored the Scripts mobile passive recovery/status strip as compact locked-state rows while preserving private API offline wording and keeping editor, source, distribution, and raw URL controls hidden when scripts are unavailable.

- v234: Balanced Account Ops tablet vault-review launch cards into one compact three-card row while preserving all seven tool routes, browser-local/vault-review boundaries, and mobile/desktop launch layouts.

- v235: Tightened Account Splitter tablet empty intake so the source textarea, centered file action, and browser-local copy/export state read as one compact workflow while preserving parser, copy, and export behavior.

- v236: Tightened Username Comparator tablet source panes and centered compare action so the browser-local result state appears earlier while preserving compare, clear, copy, and export behavior.

- v237: Tightened PS Link Extractor tablet paired intake so source panes, allowlist filter, centered extraction action, and browser-local result state read as one compact workflow while preserving filtering, copy/download, and Link Generator handoff behavior.

- v238: Tightened Username Extractor tablet file intake and empty result cards so browser-local parsing, supported-file guidance, and copy/TXT unlock boundaries read as one compact workflow while preserving XLS/XLSX parsing, copy, and export behavior.

- v239: Tightened Batch Validator tablet intake and result cards so vault-read-only validation, centered validation action, and not-validated state read as one compact workflow while preserving missing-column copy behavior and no-write guarantees.

- v240: Tightened Dashboard desktop home spacing so Recent Activity, workspace routing, and the first Operating State boundary cards fit into the first viewport while preserving honest vault-derived zero metrics and route actions.

- v241: Tightened Cookie Operations tablet vault-review workflow so brief steps, review routes, and confirmation/copy boundary cards read as one compact grouped page while preserving extractor, bulk lookup, and confirmation-gated move behavior.

- v242: Tightened Vault tablet triage controls so Search vault, Clear, and lines-ready state read as one compact command row while preserving masked search, UPCE copy, staged move confirmation, and no-write empty-state behavior.

- v243: Tightened Data Center tablet recovery workflow so the brief, recovery actions, and browser-local state strip read as one compact review page while preserving recovery download, import review, integrity check, and no-provider-data boundaries.

- v244: Tightened Adopt Me Watcher mobile account scanner rows and toolbar so the 50-row sample page reads as a denser operator list while preserving the read-only/demo boundary, owner inspection actions, pagination, and authored React data flow.

- v245: Tightened Redfinger tablet and mobile passive device cards so more server-owned captures fit in the scan list while preserving read-only wording, passive capture detail, density controls, and confirmation-gated reboot/renewal behavior.

- v246: Tightened Account Ops mobile launch groups so all browser utilities and vault review tools fit the first 390px scan with readable `Open` pills, clear route-boundary labels, and no clipped helper copy while preserving dedicated tool routes and vault-review behavior.

- v247: Tightened Cookie Operations mobile source/output/move state into one connected review strip so the vault-review page reads as a compact workflow instead of stacked tail cards while preserving extractor, bulk lookup, masked-copy, export, and confirmation boundaries.

- Ops: Reworked backend supervision into one hidden persistent `backend/watch-backend.ps1` task instead of recurring every-minute terminal launches. Verified killing the `127.0.0.1:8787` listener makes `/api/health` go down briefly, then the persistent watchdog restores `{"ok":true,"needsSetup":false}` in the next health loop without restarting Caddy or touching production.

- v203: Increased Data Center tablet/mobile recovery CTA label readability while preserving recovery download, import review, integrity check, sync boundaries, and no-provider-data wording.

- v202: Normalized the Vault desktop header `+ Add` control into the same dark rounded operation-pill language as the rest of the private Operations OS while preserving the existing add modal and vault contract.

- v201: Enlarged Account Ops desktop `Open` and Cookie Operations desktop `Review` launch actions into readable dark operation pills while preserving routes and vault-review boundaries.

- v200: Normalized Cookie Extractor and Bulk Lookup desktop `Clear` controls into dark rounded operation pills while preserving masked vault review and no-write behavior.

- v199: Normalized PS Links desktop `Add username file` and `Add PS link file` imports into dark rounded operation pills while preserving browser-local pairing, copy, export, and generator handoff behavior.

- v198: Normalized Comparator desktop `Add files`, `Clear Left`, and `Clear Right` source actions into dark rounded operation pills while preserving browser-local comparison behavior.

- v197: Normalized Dashboard desktop Start Here `Open` controls into readable dark operation pills while preserving workspace routing and honest empty activity state.

- v196: Normalized Cookie Extractor and Bulk Lookup mobile `Clear` controls into dark rounded operation pills while preserving masked lookup/extract results and vault write boundaries.

- v195: Enlarged Adopt Me Watcher tablet inventory `View owners` affordances into readable compact operation pills while preserving sample/demo watcher boundaries and owner-inspector behavior.

- v194: Normalized the Scripts tablet recovery route into a compact dark operation pill while keeping the private scripts API unavailable and editor/source controls locked.

- v193: Centered the Batch Validator tablet validation action as a compact dark operation pill while preserving read-only vault validation and copy/export behavior.

- v192: Enlarged Cookie Operations tablet `Review` actions into readable dark operation pills while preserving masked vault-review routing and confirmation boundaries.

- v191: Enlarged Account Ops tablet launch `Open` actions into readable dark operation pills while preserving grouped tool routing and vault-review boundaries.

- v190: Tightened Inbox review entry `Open →` actions into dark rounded operation pills on desktop and tablet while preserving honest empty-state routing.

- v189: Tightened Redfinger passive toolbar actions into dark rounded operation pills while preserving read-only snapshot, activity log, and confirmation-gated renewal behavior.

- v188: Tightened Vault no-selection coverage, bulk lookup, and advanced cookie actions into dark rounded operation pills while preserving masked triage and no-raw-cookie behavior.

- v187: Extended the Dashboard tablet Recent activity View Vault route into the same compact dark operation pill treatment while preserving honest empty activity and vault routing behavior.

- v186: Tightened PS Links mobile/tablet username and link file actions into dark rounded operation pills while preserving local pairing, allowlist filtering, copy, download, and Link Generator handoff behavior.

- v185: Tightened Splitter mobile/tablet Add files source action into a dark rounded operation pill while preserving automatic parsing, copy, export, and browser-local behavior.

- v184: Tightened Comparator mobile/tablet source Add files and Clear actions into dark rounded operation pills while preserving browser-local compare, file merge, copy, export, and clear behavior.

- v183: Tightened the Dashboard mobile Recent activity View Vault route into a compact dark operation pill while preserving the honest empty activity state and vault routing behavior.

- v182: Tightened Data Center mobile/tablet recovery action labels into dark rounded Operations OS pills while preserving recovery download, import review, integrity check, and private sign-in boundaries.

- v181: Tightened the Vault mobile/tablet triage Clear action into the same compact dark pill treatment as Search vault while preserving masked search, clear, copy/export, and confirmation-gated move behavior.

- v180: Tightened the shared/public unavailable Retry action into a centered dark Operations OS pill while preserving the offline state, hidden PIN keypad, and private-data isolation boundary.

- v179: Tightened Adopt Me Watcher mobile inventory into single-column readable owner cards while preserving sample/demo boundaries, owner popup affordances, and account watcher behavior.

- v178: Tightened the Scripts unavailable summary card into the same solid dark Operations OS boundary treatment as the locked editor and recovery cards while preserving private API unavailable behavior and hidden editor/source controls.

- v177: Tightened Cookie Extractor and Bulk Lookup mobile secondary limit controls into compact dark boundary strips while preserving masked extraction, lookup, copy/export, and confirmation-gated move behavior.

- v176: Tightened PS Link Extractor mobile segment tabs so the active extractor/generator state uses a dark Operations OS tab instead of a light beige control while preserving browser-local extraction, copy, download, and generator handoff behavior.

- v175: Tightened mobile Account Ops and Cookie Operations route-card action labels so `Open` and `Review` render as readable dark sentence-case pills while preserving all existing workflow routes.

- v174: Tightened Scripts unavailable status badge so desktop, tablet, and mobile use the compact dark Operations OS boundary-pill treatment while preserving locked private API behavior and hidden editor/source controls.

- v173: Tightened Vault triage `Search vault` action so tablet and mobile use the compact dark Operations OS pill treatment while preserving masked search, copy/export, and confirmation-gated move behavior.

- v172: Tightened Inbox review entry actions so `Open` route CTAs use the compact dark Operations OS pill treatment across desktop, tablet, and mobile while preserving honest empty-state wording and review routing.

- v171: Tightened Data Center desktop recovery actions so `Download recovery`, `Open review`, and `Check integrity` use compact dark action pills while preserving recovery export, import review, integrity checks, and mobile full-width touch targets.

- v170: Tightened Dashboard top actions so `Open Vault` and `Shared tools` use the compact dark Operations OS pill treatment while preserving honest metrics, routing, and shared-preview boundaries.

- v169: Tightened the private login gate so `Enter The Fool` and the shared-tools secondary action use the compact dark Operations OS control treatment while preserving authentication and shared-preview routing boundaries.

- v168: Tightened Username Extractor `Add files` import action so desktop, tablet, and mobile use the compact dark Operations OS pill while preserving browser-local parsing, copy, and TXT export behavior.

- Tightened Cookie Extractor and Bulk Lookup primary lookup actions so `Extract` and `Lookup` use compact dark Operations OS CTAs on desktop while preserving search, clear, copy, and move confirmation behavior.

- Tightened Account Splitter desktop file import so `Add files` uses a centered compact dark pill aligned to the intake flow while preserving automatic conversion, copy, and export behavior.

- Tightened Batch Validator `Validate usernames` controls on desktop and mobile so the read-only validation action uses the compact dark Operations OS CTA while preserving vault-read-only validation and missing-name copy behavior.

- Tightened PS Link Extractor `Extract links` controls on desktop and mobile so the primary action matches the compact dark Operations OS CTA while preserving pairing, allowlist filtering, TXT export, generator handoff, and copy behavior.

- Tightened Username Comparator desktop `Compare` control so the primary action uses the compact dark Operations OS CTA treatment while preserving browser-local compare, copy, export, and clear behavior.

- Tightened Vault desktop triage status so `0 lines ready` uses the same compact boundary pill treatment as mobile/tablet while preserving browser-local search, copy/export, and move-confirmation behavior.

- Tightened Redfinger toolbar wording and mobile toolbar density so controls say `Refresh snapshot` and `Review renewal` instead of command-like sync language while preserving passive demo/read-only behavior, above-the-fold scan rows, and confirmation-gated device actions.

- Tightened Dashboard tablet workspace rows so the secondary Workspaces list uses compact `Open →` route pills matching Start Here while preserving real vault metrics, honest empty activity, and route targets.

- Tightened Scripts desktop unavailable state so the private repository tile exposes a compact `Private API offline` boundary while preserving hidden editor/source/share controls and Data Center recovery routing.

- Tightened Cookie Operations desktop route cards so the paired vault-review tools expose compact dark `Review` pills instead of tiny arrow affordances while preserving masked review and confirmation boundaries.

- Tightened Account Ops desktop route cards so every grouped workflow exposes a compact dark `Open` pill instead of a tiny arrow affordance while preserving all account utility and vault-review routes.

- Tightened Data Center desktop recovery cards so Download/Open/Check actions use full-width compact action strips while preserving recovery export, import review cancellation, integrity routing, and tablet/mobile layouts.

- Tightened Username Extractor tablet empty-output status so `No files parsed` renders as a compact boundary pill while preserving browser-local parsing, copy, TXT export, and mobile/desktop layouts.

- Tightened Account Splitter tablet empty-conversion guidance so the browser-local copy/export boundary pill is visible before valid lines while preserving automatic parsing and desktop/mobile layouts.

- Reworked the PS Link Extractor tablet primary action into a compact dark Operations OS CTA while preserving paired extraction, allowlist filtering, copy, TXT download, and Link Generator handoff.

- Reworked the Cookie Extractor tablet primary action into a compact dark Operations OS CTA while preserving masked coverage lookup, per-group limits, clear behavior, and dense empty/result states.

- Reworked the Bulk Lookup tablet primary action into a compact dark Operations OS CTA while preserving username matching, filter reveal, and move-confirmation boundaries.

- Reworked the Username Comparator tablet primary action into a compact dark Operations OS CTA while preserving local compare, file merge, copy, export, and clear flows.

- Reworked the Batch Validator tablet primary action from a bright native-style bar into a compact dark Operations OS CTA while preserving read-only validation behavior.

- Tightened Inbox tablet review entry points so the empty review workflow cards use compact dark `Open` pills while preserving honest no-task wording and privacy state cards.

- Tightened Vault tablet triage controls so Search/Clear stay readable and the `0 lines ready` status pill moves to its own compact row instead of crowding the action pair.

- Tightened Cookie Operations tablet route cards so the paired vault-review tools expose compact `Review` action pills instead of tiny arrow-only affordances while keeping review-state cards and confirmation boundaries intact.

- Tightened Account Ops tablet route cards so grouped workflow tiles use compact `Open` action pills instead of tiny arrow-only affordances while preserving the 4+3 workflow grouping and all routes.

- Tightened Dashboard tablet Start Here cards so active workspace routes use compact dark `Open` pills with stronger scan hierarchy while preserving links and empty-state honesty.

- Tightened Cookie Operations mobile launch rows so vault-review routes expose compact `Review` action pills instead of arrow-only affordances while preserving masked review-state guidance and route behavior.

- Tightened Account Ops mobile launch rows so each preserved route exposes a compact `Open` action pill instead of arrow-only affordance while keeping browser-local and vault-review grouping intact.

- Tightened Data Center tablet recovery cards so Download/Open/Check actions read as compact bottom action strips while preserving export, import-review, and integrity flows.

- Tightened Scripts tablet unavailable-state control so `Scripts Unavailable` reads as a compact disabled private-API boundary badge while preserving locked editor recovery, hidden script controls, and desktop/mobile layouts.

- Tightened Vault mobile no-selection guidance so the WRITE ON CONFIRM boundary stacks above the helper copy, preserving masked triage search, copy/export/move unlock behavior, selected-group confirmations, and desktop/tablet layouts.

- Tightened Redfinger mobile device rows so each passive scan card exposes an `Open passive detail` affordance while keeping provider commands hidden in the mobile list, renewal/reboot confirmation-gated, and desktop/tablet density unchanged.

- Tightened Adopt Me Watcher mobile inventory owner actions so each sample card keeps the dense two-column layout while `View owners` reads as a full-width touch affordance, preserving demo/read-only/API-pending wording, owner-popup access, and desktop/tablet layouts.

- Tightened shared/public mobile unavailable state so the retry gate shows a compact SHARED ACCESS OFFLINE boundary while preserving PIN gating, public-only boundary rows, private-shell isolation, and desktop/tablet layouts.

- Tightened Scripts mobile unavailable state so the repository warning reads as a compact PRIVATE API OFFLINE boundary while preserving the locked editor recovery path, disabled script controls, no-demo-records wording, and desktop/tablet layouts.

- Tightened Dashboard mobile Operating state cards into full-width compact boundary rows so shared/public/provider honesty copy remains readable at 390px while preserving Start Here routing, vault-derived metrics, and desktop/tablet layouts.

- Tightened the mobile owner gate shared-tools action so Browser-only reads as a compact boundary pill while preserving authentication, shared-preview routing, public/private separation, and desktop/tablet layouts.

- Tightened Vault mobile no-selection guidance so the Cookie Operations helper reads as a compact WRITE ON CONFIRM boundary while preserving triage search, UPCE copy, staged move confirmation, selected-group actions, and desktop/tablet layouts.

- Tightened Data Center mobile recovery action cards so Download recovery, Open review, and Check integrity use full-width bottom CTAs while preserving recovery export, import review cancellation, local integrity routing, and desktop/tablet layouts.

- Tightened Cookie Operations mobile Vault review header so the route group reads as a compact REVIEW ROUTES boundary while preserving Cookie Extractor/Bulk Lookup routing, masked review cards, copy/export/move boundaries, and desktop/tablet layouts.

- Tightened Account Ops mobile section headers so Browser utilities and Vault review read as compact route-preserved workflow boundaries while preserving every launch route, row density, and desktop/tablet card layouts.

- Tightened Username Extractor tablet import guidance so the browser-local file-parse boundary reads as a compact row inside the file-import card while preserving local parsing, duplicate removal, copy unlock, TXT export, and desktop/mobile layouts.

- Tightened PS Link Extractor tablet allowlist framing so the browser-local filter reads as a compact boundary row between file imports and Extract links while preserving paired extraction, copy, TXT download, and Link Generator handoff behavior.

- Tightened Bulk Lookup tablet primary action so Lookup spans the full username-intake width while preserving browser-local matching, limit/Clear secondary controls, result filtering, copy/export, confirmation-gated move behavior, and desktop/mobile layouts.

- Tightened Username Comparator tablet primary action so Compare spans the full source grid width while preserving browser-local comparison, file imports, copy/export behavior, and desktop/mobile layouts.
- Tightened Cookie Extractor mobile intake framing so the Account lookup section has a clearer top boundary and textarea separation while preserving masked coverage lookup, per-group/Clear controls, empty results guidance, and desktop/tablet layouts.
- Tightened Batch Validator tablet CTA alignment so Validate usernames spans the full username-intake width while preserving vault-read-only validation, missing-column copy behavior, and desktop/mobile layouts.
- Tightened Account Splitter tablet file-action alignment so Add files spans the full intake width under the account-lines textarea while preserving automatic parsing, empty conversion guidance, copy/export unlock behavior, and desktop/mobile layouts.
- Tightened Adopt Me Watcher inventory cards so tablet owner affordances read as compact top badges and mobile sample cards shorten without losing item names, counts, metadata, or owner-popup access, preserving read-only/API-pending boundaries and demo data.
- Tightened Vault tablet triage status placement so `0 lines ready` renders as a compact boundary pill aligned with Search/Clear while preserving vault search, masked results, copy/export/move confirmation behavior, and desktop/mobile layouts.
- Tightened Redfinger tablet device-grid readability so the passive scan wall caps at three wider columns with a clear density boundary note while preserving server-owned/read-only presentation, demo/provider wording, desktop density, and mobile scan rows.
- Tightened Dashboard mobile recent-activity empty state so it uses a compact vault-activity boundary pill and reduces first-viewport dead space while preserving real vault-derived metrics, Start Here routing, shared-tools boundary, and tablet/desktop layouts.
- Tightened Scripts mobile locked-state presentation so the unavailable editor card shows a compact passive recovery boundary and clearer Data Center handoff while preserving unavailable/read-only repository behavior, hidden script controls, and tablet/desktop layouts.
- Tightened Cookie Operations mobile review-state cards so Source, Output, and Moves use compact top-boundary labels instead of heavy left rails while preserving vault-review copy, workflow links, copy/export/move boundaries, and tablet/desktop layouts.
- Tightened Username Extractor empty-output guidance so the browser-local parser card shows a compact copy/TXT unlock boundary pill while preserving file parsing, duplicate removal, copy, export, and tablet/desktop layouts.
- Tightened Account Splitter mobile empty-conversion guidance so the automatic conversion card includes a compact browser-local/copy-export boundary pill while preserving automatic parsing, copy/export formats, grouped output, and tablet/desktop layouts.
- Tightened Username Comparator mobile primary CTA styling so Compare uses the polished Operations OS action treatment with explicit focus styling while preserving browser-local comparison, file imports, copy/export behavior, and tablet/desktop layouts.
- Tightened Vault mobile triage controls so Search vault and Clear form a balanced two-button row with the ready-line count as a separate compact status pill, preserving masked search, copy/export/move boundaries, desktop/tablet layouts, and the vault[] contract.
- Tightened PS Link Extractor mobile mode tabs so PS extractor and Link generator read as a compact segmented workflow switch while preserving paired extraction, copy, TXT download, and generator handoff behavior.
- Tightened Batch Validator mobile CTA styling so Validate usernames uses the Operations OS primary action treatment without the heavy native outline while preserving read-only validation and missing-column copy behavior.
- Tightened Cookie Extractor mobile secondary controls so the per-group limit and Clear action read as a balanced two-control toolbar under the primary Extract step while preserving masked coverage lookup and copy behavior.
- Tightened Bulk Lookup mobile secondary controls so the limit field and Clear action read as a balanced two-control toolbar under the primary Lookup step while preserving lookup, result filter, copy/export, and confirmation-gated move behavior.
- Tightened Data Center mobile recovery state so the Browser-local export, No import staged, and Private sign-in required boundary strip is visible under the recovery actions on phones, filling the first viewport with honest operational state while preserving recovery/download/import behavior.
- Tightened Dashboard mobile routing so Start Here remains the only workspace router on phones while the redundant Workspaces list stays available on tablet/desktop, reducing mobile scroll without changing routes or vault-derived metrics.
- Tightened the shared workspace unavailable gate so preview-only shared/PIN states show a compact public-tools/PIN-gated/owner-isolated boundary strip and deterministic Retry action while keeping private vault controls, scripts, settings, and server administration out of the shared text flow.
- Tightened Cookie Operations workflow and review rails so the vault-review steps and Source/Output/Moves boundaries read as connected strips while preserving Cookie Extractor, Bulk Lookup, masked output, and confirmation-gated move behavior.
- Tightened Account Ops workflow brief so Prepare locally, Validate vault, and Review staged records read as one connected workflow rail above the grouped utility cards while preserving routes, copy/export boundaries, and tablet/mobile readability.
- Tightened Scripts desktop recovery strip so Repository, Editor, and Recovery read as one connected unavailable-workflow boundary while keeping create/editor/raw URL controls hidden and the Data Center recovery action intact.
- Tightened Inbox desktop review-boundary strip so Source, Review, and Privacy read as one connected status strip under the empty review queue while preserving honest workflow-output wording, tablet/mobile layouts, and action routing.
- Tightened Data Center desktop recovery state so Browser-local export, No import staged, and Private sign-in required read as one connected status strip under the primary recovery actions while preserving preview-only/no-provider-data boundaries and tablet/mobile layouts.
- Tightened Vault desktop empty-vault spacing so the `No cookies stored yet` state sits directly under Cookie Operations as a compact bordered panel instead of floating in a lower dead zone, while preserving masked triage, no-selection action boundaries, and tablet/mobile layouts.
- Balanced the Dashboard desktop empty-activity region so the honest no-activity state reads as a compact panel beside wider workspace routing instead of leaving a large blank field, while preserving vault-derived zero metrics and active workspace links.
- Tightened Adopt Me Watcher mobile inventory cards so the two-column sample grid keeps pet icons, item names, owner metadata, and View owners affordances readable without changing read-only/API-pending boundaries or demo data.
- Tightened Redfinger dense-device card typography so ten-column desktop cards keep device identity, session metadata, and remaining-time labels readable while preserving passive captures and confirmation-gated actions.
- Balanced the Scripts locked-state desktop layout so the private-script unavailable notice, locked editor guidance, and recovery status strip read as one deliberate unavailable workflow while keeping create/editor/raw URL controls hidden.
- Tightened Vault Cookie Operations desktop no-selection state so inert selected-record controls stay hidden until a group is selected while Check coverage, Bulk lookup, and Advanced Cookie Tools remain visible as the useful next actions.
- Tightened Cookie Extractor desktop action placement so the primary Extract step is compact and centered under the account lookup intake while per-group and Clear controls stay grouped below, preserving tablet/mobile touch rows, masked lookup, and copy/export result behavior.
- Tightened Bulk Lookup desktop action placement so the primary Lookup step is compact and centered under the intake while limit, Clear, and result-filter controls stay grouped below, preserving mobile/tablet touch rows, result filtering, copy/export, and confirmation-gated move behavior.
- Tightened Username Extractor desktop file-import action so Add files is a compact left-aligned source control instead of spanning the whole import card, while preserving tablet/mobile full-width touch targets, browser-local parsing, copy unlock, and TXT export behavior.
- Tightened Batch Validator desktop action placement so the read-only `Validate usernames` CTA is compact and centered under the intake instead of spanning the whole card, while preserving mobile full-width touch targets, tablet right-aligned control flow, missing-name copy, and vault read-only behavior.
- Tightened PS Link Extractor desktop action placement so Add username/link file controls stay compact at each source panel and the primary Extract links CTA sits centered under the paired inputs, while preserving tablet/mobile full-width touch targets, allowlist filtering, copy/TXT export, and Link Generator handoff.
- Tightened Account Splitter desktop empty intake so the account-lines source spans the workflow width, the inert stats column no longer reserves a row, and Add files stays compact and left-aligned while preserving tablet/mobile touch targets, automatic parsing, copy, and export behavior.
- Tightened Username Comparator desktop workflow actions so Add files/Clear controls no longer sprawl across each source panel and the primary Compare CTA sits centered under the two-column input pair, while preserving tablet/mobile touch controls, copy/export, and browser-local comparison behavior.
- Converted Cookie Operations desktop launch rows into two paired vault-review cards so Cookie Extractor and Bulk Lookup read as one professional workflow group while preserving mobile rows, tablet cards, routes, copy/export, and confirmation boundaries.
- Converted Account Ops desktop launch rows into grouped workflow cards so all four browser-local utilities and three vault-review tools fit as a professional two-section operations page while preserving existing routes, copy/export behavior, and tablet/mobile layouts.
- Replaced the Dashboard's static cleanup changelog with a compact operating-boundary strip that honestly states local vault metrics, shared/public isolation, read-only Adopt Me watcher status, and hidden provider-balance behavior while preserving active workspace routing and zero-state metrics.
- Added a compact Inbox review-boundary strip on tablet and desktop so the empty review queue fills its lower dead area with honest workflow-output, operator-action, and private-data boundaries while preserving mobile action density and no invented task records.
- Added a compact Cookie Operations review boundary strip on tablet and desktop so the sparse lower area now states vault-record source, masked output, and confirmation-gated move boundaries without adding mobile clutter or changing copy/export/move behavior.
- Added a Scripts locked-state recovery strip on tablet and desktop so unavailable private-script sessions show repository, editor, and Data Center boundaries in the empty lower area, while preserving hidden editor/source controls, no demo records, and the mobile recovery card.
- Added a visible Redfinger passive-operation boundary under the fleet filters so tablet and desktop operators see server-owned credentials, passive screenshot mode, and confirmation-gated reboot/renewal before the dense device grid, while preserving mobile scan wording and read-only provider behavior.
- Added an honest Data Center status strip under the recovery actions so tablet and desktop operators see recovery, import, and sync boundaries without invented provider data, while preserving the existing recovery download, import review, and local integrity actions.
- Tightened Vault tablet empty-state spacing so the synthetic empty-vault card sits directly under Cookie Operations instead of leaving a large dead zone, while preserving masked triage controls, selected-action boundaries, mobile layout, and desktop layout.
- Tightened Dashboard mobile Start Here action clarity so each route card now uses a compact right-aligned `Open` pill instead of a weak extra text line, while preserving all active workspace hrefs, vault-derived zero-state metrics, and tablet/desktop layouts.
- Tightened Dashboard tablet and desktop Start Here affordances so `Open` renders as a compact CTA pill across all breakpoints while preserving the same active workspace links and dashboard ordering.
- Tightened Account Splitter's mobile empty-state gap so the inert zero-stat/action column no longer reserves space before the automatic-conversion helper, while preserving file import, automatic parsing, copy/export unlock behavior, and tablet/desktop layouts.
- Tightened Cookie Extractor and Bulk Lookup mobile empty-state spacing so an empty internal status line no longer reserves space between the paste status strip and primary action, while preserving masked lookup, copy/export result flow, and confirmation-gated move behavior.
- Tightened Adopt Me Watcher mobile first-viewport density so the sample Inventory watchlist begins inside the first phone viewport while preserving the read-only/API-pending boundary, four-row account roster preview, and two-column item cards.
- Replaced preview owner-gate, dashboard, route-sidebar, and compact-menu Fool mark usage with the canonical transparent SVG mark and hardened the live favicon audit against legacy JPG mark regressions.
- Tightened Redfinger mobile passive scan rows so the demo capture thumbnail and device metadata use a shorter readable row while preserving passive/read-only wording, hidden row commands, and confirmation-gated device actions.
- Tightened Vault Cookie Operations tablet triage so the masked search input, empty-result frame, and selected-action toolbar use a denser professional layout while preserving masked values, copy/export/move boundaries, and mobile/desktop layouts.
- Tightened the Scripts unavailable state so the disabled repository chip sits with the page heading and the locked recovery cards use a denser mobile/tablet layout while preserving hidden editor/source controls and the Data Center recovery path.
- Converted Account Ops and Cookie Operations tablet launch rows into compact two-column workflow cards so tool metadata and actions scan as dedicated workflow pages while preserving mobile density, desktop rows, and existing route handlers.
- Staged Username Comparator's empty result toolbar across desktop/tablet/mobile so disabled copy/export controls stay hidden until comparison output exists, while preserving file import, compare, copy, and TXT export behavior.
- Tightened Account Splitter's tablet empty state so the automatic-conversion guidance sits directly under the file import row instead of leaving a dead stats gap, while preserving automatic parsing, copy formats, grouped copy, and TXT/JSON/CSV export behavior.
- Tightened Bulk Lookup's tablet lookup workflow so the username textarea, readiness strip, lookup toolbar, and empty comparison frame sit in a compact scan path while preserving browser-local matching, result filters, move confirmation, and no vault writes before acknowledgement.
- Tightened Cookie Extractor's tablet extract workflow so the masked username textarea, readiness strip, Extract/limit/Clear toolbar, and empty result frame sit in a compact scan path while preserving masked lookup, copy/export result flow, and mobile/desktop layouts.
- Tightened PS Link Extractor's tablet pairing workflow so the paired username/server-link textareas, file controls, allowlist disclosure, primary extraction action, and empty result frame sit in a shorter browser-local scan path while preserving copy, TXT download, and Link Generator handoff.
- Tightened Username Extractor's tablet import/output empty state so the browser-local file-import card and locked extracted-usernames card use a shorter two-panel layout while preserving supported-file parsing, copy unlock, and TXT export behavior.
- Tightened Batch Validator's tablet validation workflow so the read-only intake keeps a compact right-aligned primary action and closer result frame while preserving mobile full-width touch targets, missing-name copy, and vault read-only behavior.
- Tightened Username Comparator's tablet empty-result workflow so source textareas, file/clear rows, Compare action spacing, and the staged result frame use a denser scan path while preserving mobile/desktop layouts, copy/export behavior, and hidden empty-result toolbar staging.
- Tightened Account Splitter's tablet empty-state workflow so the account textarea, compact Add files action, and automatic-conversion guidance sit in a shorter scan path while preserving automatic parsing, grouped copy, TXT/JSON/CSV export, and mobile touch controls.
- Tightened Vault Cookie Operations tablet no-selection state so inert selected-record buttons are hidden while the useful Check coverage, Bulk lookup, and Advanced Cookie Tools links remain visible, preserving selected-group copy/export/extract actions when a group is selected.
- Tightened Scripts tablet unavailable state into a two-column locked workflow so the private-script API notice and Data Center recovery action read as one professional recovery surface while preserving disabled editor/source controls and mobile stacked behavior.
- Balanced Account Ops tablet Vault review into a three-card row so Batch Validator, Cookie Extractor, and Bulk Lookup no longer leave a dead grid slot, while preserving Browser utilities, mobile rows, desktop list density, and existing route handlers.
- Tightened Adopt Me Watcher tablet inventory density so the sample item grid uses three readable columns on 820px tablets while preserving the read-only/API-pending boundary, phone two-column cards, owner affordance, and desktop grid.
- Tightened the preview Scripts workspace empty/error presentation: unavailable private-script API states now render as an honest scoped panel instead of exposing raw fixture/API text, and the editor remains hidden until a real selection or explicit new-script action. Published to preview only after focused local checks passed.
- Tightened Username Extractor file-import alignment so the local Add files control spans its import card on mobile/tablet, matching the polished Account Ops import workflows while preserving browser-only parsing, copy, and TXT export behavior.
- Tightened the Scripts unavailable header so the disabled status chip stays with the Scripts title across desktop/tablet/mobile instead of floating as a detached far-edge control, while preserving the locked editor state and disabled repository actions.
- Tightened Data Center recovery/import/check CTAs so desktop/tablet action labels read as deliberate card footer controls instead of tiny tags, while preserving recovery download, import review, and local integrity guidance behavior.
- Promoted the Dashboard Start Here router above secondary activity/changelog surfaces so the operations home prioritizes next actions on desktop/tablet/mobile, while preserving vault-derived metrics, honest empty states, and existing routes.
- Reworded and de-emphasized the Redfinger top-level renewal toolbar action as neutral `Renewal review` so demo/read-only mode does not imply provider queue commands, while preserving device-level confirmation-gated Renew behavior.
- Tightened Bulk Lookup mobile action flow so the limit, Clear, and result-filter controls align as one compact secondary row under the full-width Lookup step, preserving lookup/copy/export/move behavior and no-overflow coverage.
- Tightened Cookie Extractor mobile action flow so the per-group limit and Clear controls form a compact secondary row under the full-width Extract step, preserving masked lookup/copy behavior and no-overflow coverage.
- Added a compact Account Ops workflow brief that separates browser-local prep from vault review while keeping all seven mobile launch rows readable in the first viewport and preserving existing tool routes/handlers.
- Fixed the Vault Operations selected-count stat so it renders as a clean numeric value plus one `selected` label instead of duplicated `selected selected`, while preserving selection actions and optional-email copy coverage.
- Clarified Redfinger density wording on phones so the forced one-column readable list is labeled `Mobile list` instead of suggesting multiple device columns are shown, while preserving tablet/desktop density controls and read-only provider boundaries.
- Centered the server login gate on tablet/desktop so owner access no longer sits high with a large empty lower half, while keeping the shared-tools secondary action and signed-out boundary intact.
- Added an explicit `View owners` affordance and accessible owner-popup labels to Adopt Me inventory tiles so the dense sample grid makes its read-only owner inspector discoverable on mobile/tablet without implying live provider writes.
- Added a safe `Open Data Center` recovery route inside the locked Scripts unavailable state so operators have a clear next step while create/editor/distribution controls remain disabled or hidden.
- Clarified Account Splitter's empty state with an explicit automatic-conversion helper so mobile operators know copy/export unlocks from valid pasted lines without a separate convert button.
- Tightened shared/public workspace isolation so parked private shell nodes are hidden and inert outside the active shared root, keeping private vault controls out of the shared text flow while preserving browser-only tools.
- Grouped Username Comparator source actions so each input has one compact Add files / Clear row on mobile, tablet, and desktop while preserving browser-local compare, copy, and TXT export behavior.
- Staged the PS Link Extractor empty result frame so copy/download/send controls and the extracted-links textarea stay hidden until extraction produces browser-local output, while preserving paired filtering, TXT download, and Link Generator handoff behavior.
- Staged Batch Validator as a vault-read-only intake and result workflow so the paste/validate step is grouped with its boundary copy while validation, missing-name copy, and no-write behavior remain unchanged.
- Staged Username Extractor's empty output frame so the preview textarea and copy/export controls stay hidden until browser-local parsing finds usernames, while preserving local file import, copy, and TXT export behavior.
- Staged Bulk Lookup's empty action row so the result filter stays hidden until a comparison exists, while preserving lookup results, matched-copy/export, and confirmation-gated move behavior.
- Tightened Account Ops mobile workflow steps so the brief uses short readable staged labels while all seven tool rows still fit the first mobile viewport and route behavior remains unchanged.
- Tightened Data Center mobile density so the recovery workflow and all three export/import/check action cards fit the first mobile viewport while preserving recovery download, import review, and integrity guidance behavior.
- Tightened Cookie Extractor mobile density so the account lookup input, per-group limit, Clear action, and staged empty result frame fit the first mobile viewport while preserving extraction and copy behavior.
- Tightened Vault mobile triage density so the masked lookup input and no-search result guidance are visible in the first mobile viewport while preserving UPCE copy and confirmation-gated move behavior.
- Staged Account Splitter's empty count surfaces so zero-format stats and the legacy record count stay hidden until valid records are parsed, while preserving automatic parsing, grouped copy, and export behavior.
- Compact Dashboard's empty-vault mobile metric block into honest zero-state chips so Start Here appears sooner without inventing provider, activity, or vault data.
- Added a compact read-only Account roster preview to Adopt Me Watcher's Main page so account state is visible beside farm performance and inventory while preserving sample/API-pending boundaries and routing to the full Accounts table.
- Added a compact Redfinger mobile passive-scan brief above the long device feed so visible/total counts, passive capture boundaries, and confirmation-gated actions are clear without changing provider behavior.
- Tightened Username Comparator mobile input density so the staged Comparison results frame appears higher in the first viewport while Add files, Clear, Compare, copy, and export controls remain readable.
- Tightened Account Splitter mobile input density so the automatic-conversion helper appears earlier in the first viewport while file import, parsing, grouped copy, export formats, and UPCE handling remain unchanged.
- Polished Dashboard activity microcopy so the vault review action uses title-case `View Vault` while preserving the existing vault route and honest empty-activity state.
- Expanded PS Link Extractor's tablet `Extract links` primary action to span the paired-input workflow width while preserving file import, paired filtering, copy, TXT download, and Link Generator handoff behavior.
- Hid the legacy shared-tools login link inside the owner gate so the mobile auth screen presents one clear `Open shared tools` secondary CTA while preserving owner login IDs and shared-preview routing.
- Hid Vault triage's empty-state action row until search results exist so the mobile Cookie Operations viewport stays focused on masked lookup guidance while UPCE copy and confirmation-gated move actions return after matched rows.
- Clarified Batch Validator's primary action as `Validate usernames` and tightened its mobile primary-control geometry while preserving read-only vault validation and missing-name copy behavior.
- Clarified Data Center's local integrity action so the third recovery card now reads `Check local data` / `Check integrity` while preserving recovery export, import review, and vault-data boundaries.
- Tightened Dashboard mobile Start Here density so the honest `No vault activity yet` Recent Activity guidance appears in the first 390px viewport while preserving all four active workspace routes and tablet/desktop layouts.
- Shortened Account Ops launch-row descriptions so all seven mobile workflow rows scan without visual truncation while preserving route targets, browser-local/vault-review boundaries, and tablet/desktop grouping.
- Balanced Bulk Lookup's mobile secondary action row so the limit and Clear controls share the row cleanly while keeping Lookup primary, matched/missing filtering, and confirmation-gated move behavior intact.
- Tightened Username Extractor's mobile file/import and locked-output framing so the browser-local empty state fits the first viewport while copy/TXT actions stay hidden until usernames are parsed.
- Compressed Redfinger's mobile fleet summary into a two-row passive scan strip so device rows appear earlier in the first viewport while preserving demo/read-only wording, passive captures, and confirmation-gated device actions.
- Shortened Dashboard Start Here operation copy so mobile routing guidance is readable without ellipses while Recent Activity remains visible in the first viewport and all active workspace links stay intact.
- Tightened Adopt Me Watcher's mobile main screen so the read-only/API-pending header, farm chart, and metrics stop delaying the account roster while preserving sample data labels, owner popup behavior, and the generated bundle workflow.
- Tightened Bulk Lookup's mobile empty state so the comparison result card appears higher with a shorter username input while preserving Lookup, limit/Clear controls, result filtering, and confirmation-gated move behavior.
- Tightened Username Comparator's mobile result-frame density so the comparison guidance appears higher after the two source inputs while preserving Add files, Clear, Compare, copy/export actions, and tablet/desktop layouts.
- Tightened Vault Cookie Operations mobile triage density so the masked paste/search input, no-search result frame, and bottom guidance fit more cleanly in the first viewport while preserving masked matching, copy/export/extract, and confirmation-gated move behavior.
- Tightened Data Center mobile recovery actions into compact row cards so export, import review, and local integrity CTAs scan faster in the first viewport while preserving recovery/import/check behavior and tablet/desktop layouts.
- Tightened PS Link Extractor mobile input/result density so paired username/server-link textareas and the browser-local extraction frame fit more cleanly while preserving file import, filtering, TXT download, and Link Generator handoff behavior.
- Tightened Account Ops mobile workflow readability so the three-step workflow brief uses legible row steps while all seven dedicated tool launch rows remain reachable in the first viewport.
- Tightened Cookie Operations mobile workflow density so the vault-review flow card uses compact readable steps and the two masked-review launch rows sit higher without changing extractor or bulk-lookup behavior.
- Tightened Cookie Extractor's mobile empty state so the masked lookup result card appears higher with a shorter input area while preserving full-width Extract, balanced limit/Clear controls, and copy/export result flow.
- Tightened Batch Validator's mobile empty result density so the read-only validation guidance appears higher with a shorter username intake while preserving vault read-only classification and missing-name copy behavior.
- Tightened Account Splitter's mobile empty state so the account input is shorter and the automatic-conversion guidance appears earlier while preserving file import, copy/export unlock behavior, and tablet/desktop layouts.
- Tightened PS Link Extractor's mobile input/file-action density so the complete browser-local empty result guidance fits in the first viewport while preserving paired extraction, TXT download, and Link Generator handoff behavior.
- Balanced Cookie Extractor's mobile secondary action row so the per-group limit and Clear controls share the row cleanly while preserving full-width Extract, masked lookup behavior, and copy/export result flow.
- Hid Comparator mobile's empty result action toolbar until a comparison has output, keeping the no-output state focused on browser-local guidance while copy/export controls return after results are generated.
- Hid Vault mobile's disabled selected-group action row until at least one Vault group is selected, keeping the no-selection Cookie Operations viewport focused on masked triage/search guidance while preserving selected copy/export/extract behavior.
- Expanded the Scripts mobile `Open Data Center` recovery link into a full-width locked-state CTA while preserving unavailable private-script APIs, hidden editor controls, and confirmation-gated script actions.
- Polished the Scripts unavailable state so the private-script API warning reads as a left-aligned status panel on desktop/tablet/mobile while the editor stays locked and no demo records, raw URLs, or create controls appear.
- Ran a fresh preview anti-slop audit across desktop, tablet, and mobile screenshots. Fixed the highest-impact obvious bug: Dashboard mobile now stacks Recent Activity and Workspaces instead of overlapping the headings. Added behavior coverage for the mobile dashboard stack.
- Tightened the sparse Data Center page into a compact recovery workflow: added an honest export/import/sync brief, converted action rows into responsive cards, and kept the existing recovery download/import review behavior and server-sync boundaries intact.
- Polished the PS Link Extractor file controls: native browser file inputs are now visually replaced by compact Account Ops triggers while preserving the same local file chooser, paired filtering, copy, TXT download, and Link Generator handoff behavior.
- Tightened Account Splitter's empty result state: grouped phone-copy output now stays collapsed until valid records are parsed, while the existing copy/export grouping behavior expands and remains covered by regression tests.
- Tightened Account Ops mobile index density: tool rows now use compact inline metadata on phones while preserving route targets, local/vault boundary labels, and desktop layout.
- Tightened Adopt Me Watcher mobile density: the read-only inventory grid now shows denser three-column cards on phones while preserving sample/API-pending wording, filters, owner popups, and no-overflow coverage.
- Tightened Redfinger tablet density: the demo/read-only fleet grid now fits four readable device cards per row on tablet, trims sticky summary surfaces, and preserves passive-capture wording, confirmation gates, and provider-command boundaries.
- Hardened the shared/public Fool workspace shell so shared mode removes private vault DOM surfaces after relocating the allowed browser-only tools, preventing hidden vault/settings/menu text from appearing in public page text while preserving the shared PIN gate and standalone workflows.
- Polished Cookie Operations preview copy and mobile controls: removed internal compatibility-route wording from the Cookie index, tightened Extractor/Bulk Lookup action rows on phones, and added regression coverage for the operator title and no-overflow mobile action layout.
- Polished Username Extractor into a clearer Account Ops workflow page: file import and extracted-result framing now wrap the existing local parser/copy/export controls, with empty-state disabling and mobile/tablet no-overflow regression coverage.
- Tightened Account Splitter mobile output controls: Copy/Export formatting controls now use a readable row-based mobile toolbar while preserving the existing parser, grouped phone-copy flow, and download formats.
- Polished Username Comparator results: the result area now has an explicit browser-local empty/result frame, mobile-safe copy/export controls, and tighter phone input density so the result context appears in the first mobile viewport.
- Polished PS Link Extractor output flow: the result area now uses an explicit browser-local extraction frame, mobile-safe copy/download/generator controls, and tighter phone input density while preserving paired filtering and Link Generator handoff.
- Polished Batch Validator into a clearer Account Ops review page: validation output now appears in an explicit read-only vault result frame with honest empty-state/status copy, mobile-safe copy columns, and regression coverage for missing-list copy without using real vault data.
- Tightened Vault mobile selection actions: selected-group bulk actions and Cookie Operations shortcuts now use mobile-safe grid rows so Export/Copy/Move/Rename/Ban/Delete/Cancel controls stay readable and unclipped while preserving existing selection handlers.
- Refined Data Center action cards with explicit action labels so recovery download, import review, and data-check cards read as actionable controls while preserving the existing export/import/review handlers and recovery wrapper.
- Tightened Account Ops mobile launch rows so all seven browser/vault tools, including Bulk Lookup, fit in the 390px mobile viewport without clipping while preserving route targets and boundary labels.
- Removed the unavailable provider-balance placeholder from the preview Dashboard when no saved/live balance is available, keeping the home metrics limited to honest vault-derived state while preserving the existing provider settings path.
- Tightened the Scripts unavailable state so the create action is disabled and relabeled while the private script API is unavailable, and the editor shows an honest locked message instead of a working-looking empty editor path.
- Tuned the Cookie Operations mobile index so its two vault-review workflow descriptions wrap cleanly instead of inheriting the denser Account Ops truncation rule, preserving readable route rows without horizontal overflow.
- Tightened Account Splitter's empty mobile state so disabled copy/export controls stay hidden until valid records exist, keeping the first viewport focused on input and honest grouped-output guidance.
- Tightened PS Link Extractor's mobile empty-state density so the Extraction result frame is visible earlier in the first viewport while preserving paired filtering, copy/download, and Link Generator handoff behavior.
- Refined the Inbox safe-empty workflow routing so Account Splitter, Cookie Extractor, and Data Center entry points use explicit tappable Open controls on mobile/tablet/desktop without inventing review task data.
- Hid Username Extractor's disabled empty-state copy/export buttons until parsed usernames exist, keeping the browser-local import/result page focused on guidance before output is available.
- Tightened Batch Validator's mobile action hierarchy so Validate is a compact primary control instead of a full-width slab while preserving read-only vault classification and copy behavior.
- Tightened Username Comparator's mobile input density so the Comparison results frame and browser-local guidance are visible earlier without changing compare, filter, copy, or export behavior.
- Tightened Redfinger's mobile scan tiles so two-column passive capture cards are shorter and more readable while preserving demo/read-only boundaries and confirmation-gated provider actions.
- Promoted the login gate's shared-tools path into a clear secondary action that routes to shared-preview while keeping owner vault login and shared/private boundaries unchanged.
- Polished Dashboard action hierarchy with title-case primary CTAs and separated Start Here numbers from operation titles while preserving routing and vault-derived empty state metrics.
- Shortened Account Ops mobile launch-row descriptions so every dedicated workflow stays readable without mid-sentence truncation while preserving compact grouped routing.
- Refined Scripts' unavailable-state action copy to title-case `Scripts Unavailable` while keeping the editor locked and private script API behavior unchanged.
- Tightened Adopt Me Watcher mobile density for the demo/sample inventory and accounts surfaces: inventory cards now fit more rows on 390px without hiding API-pending wording, and the regression checks mobile inventory/card density plus account-table overflow before preview publish.
- Tightened Redfinger mobile scan-card density while preserving the read-only/demo boundary: passive captures stay readable, duplicate expiry dates collapse on narrow screens, and the regression now checks mobile card ratio, capture height, and hidden duplicate dates.
- Added a compact Cookie Operations vault-review flow panel so the dedicated cookie page explains masked coverage, local username matching, and confirmation-gated copy/export/move work without adding private data or changing tool behavior.
- Polished dedicated tool return actions to title-case `← All Tools` across Account Ops and Cookie Operations while preserving route handling and tool ownership.
- Polished Username Comparator mobile action copy to title-case `Clear Left` / `Clear Right` while preserving paste, file merge, compare, copy, and export behavior.
- Added the UPCE summary row to Account Splitter's dedicated preview page so optional-email records are visible alongside UPC, UC, and UP without changing parsing, copy, or export behavior.
- Tightened Account Ops tablet launch-row density so tool metadata stays grouped with each tool instead of drifting across sparse rows; mobile and route behavior remain unchanged.
- Tightened Account Ops desktop launch rows so boundary metadata and category pills stay grouped with each tool instead of drifting to the far edge; route behavior and local/vault-review labels remain unchanged.
- Tightened the Data Center tablet action grid so recovery, import, and check actions stay in one compact row while mobile remains one-column and existing review/download behavior is unchanged.
- Left-aligned the Dashboard recent-activity empty state so the honest zero-state reads like operator guidance instead of a detached centered placeholder.
- Left-aligned the PS Link Extractor mobile result header so extraction status reads as compact operator metadata instead of a centered placeholder.
- Hid the Vault mobile bulk action bar when no groups are selected so disabled zero-selection actions no longer crowd the triage viewport while selected-group actions remain available.
- Expanded the Batch Validator mobile primary action to align with the input width while preserving the read-only vault validation and missing-name copy behavior.
- Reworded the shared/public unavailable footer to generic owner-only boundary copy so the gate no longer names private vault settings or editor surfaces.
- Expanded the Cookie Extractor and Bulk Lookup mobile primary actions to span the input width, with per-group/limit controls moved below as secondary metadata while preserving masked vault-review behavior.
- Stacked the Scripts unavailable tablet/mobile state into one clear locked workflow so the private API boundary reads as a single unavailable state while editor and distribution controls stay hidden.
- Promoted Data Center into the Dashboard Start Here action grid and hid the legacy isolated footer button so tablet renders a balanced 2×2 active-workspace router with preserved Data Center routing.
- Tightened the Inbox mobile review-entry actions into compact rows with right-side Open CTAs while preserving the honest empty state and no invented task counts.
- Raised the login owner gate on tablet and desktop so the auth console sits in the operator's first scan area while preserving the same form IDs, auth flow, and shared-tools boundary.
- Expanded the Comparator mobile `Compare` primary action to the input width so the empty comparison flow reads as a clear operator step while preserving paste, file import, copy, and export behavior.
- Expanded the PS Link Extractor mobile `Extract links` primary action to the paired-input width while preserving file import, copy, TXT download, and Link Generator handoff behavior.
- Expanded the Account Splitter mobile `Add files` import action to the account-input width while preserving parsing, grouped copy, export formats, and UPCE handling.
- Expanded Data Center mobile recovery/import/review action labels to full-width CTAs inside each card while preserving recovery export, import review, and guidance behavior.
- Reworked Redfinger's narrow mobile scan grid into single-column passive device rows so screenshots, status, and remaining-time text remain readable at phone width while preserving demo/read-only boundaries and confirmation-gated provider actions.
- Rebalanced Adopt Me Watcher mobile inventory from three tiny columns to two readable sample item columns while preserving demo/API-pending wording, owner popup behavior, and no-provider-command boundaries.
- Wrapped the Vault mobile header controls so search owns a full-width readable row while keeping Bulk Lookup, list/sort, add, and menu controls available and preserving `vault[]` behavior.
- Tightened Cookie Operations tablet/desktop launch rows so vault-review metadata stays grouped with each row instead of drifting into a separate right-side column; routes and vault contracts are unchanged.
- Relabeled the authenticated Dashboard's secondary public-site action from “Enter The Fool” to “Shared tools” so the private Operations OS header no longer implies re-entering the app while preserving the separate shared-tools link target.
- Restyled the disabled Scripts unavailable control as a passive status chip so the locked editor state no longer appears actionable while keeping private script APIs, commands, and demo-data boundaries unavailable.
- Tightened Cookie Extractor and Bulk Lookup mobile action stacks so Extract/Lookup stay full-width while limit controls render as compact inline chips instead of detached full-width boxes; copy, export, filter, move, and confirmation behavior is unchanged.
- Expanded the Batch Validator tablet Validate action to the input width so the username batch flow reads as one clear input-to-run workflow while preserving read-only vault validation and copy behavior.
- Toned down the shared/public unavailable Retry control from a bright private-primary button to a neutral dark recovery action while preserving the owner-only boundary copy and keeping private vault controls hidden.
- Tightened Account Ops desktop launch-row scan width so route arrows sit closer to tool metadata instead of stretching across the full workspace; tablet/mobile row behavior and all tool routes are unchanged.
- Expanded the Account Splitter tablet file-import action to match the account input width, aligning the import step with the existing mobile treatment while preserving parser, copy, and export behavior.
- Expanded PS Link Extractor file-import actions on tablet and mobile so upload controls align with their textareas, keeping extraction, copy, download, and Link Generator handoff behavior unchanged.
- Expanded Username Comparator tablet file-import actions to match their textarea widths while preserving mobile density, compare, category filtering, copy, export, and clear behavior.
- Restyled Vault Operations shortcut links so Check coverage, Bulk lookup, and Advanced Cookie Tools render as neutral boxed toolbar actions instead of unboxed link text while preserving their routes and disabled selection actions.
- Restored preview API availability by starting the existing backend runner after static preview was reachable but `/api/health` returned `502`; no backend code, schema, secret, database, or vault data changed.
- Redesigned the private login gate as a compact owner-access console with The Fool branding, clearer Saturnity Vault wording, server-boundary chips, and less generic authentication copy while preserving the same form IDs, `/api/health`, `/api/me`, setup, login, and vault-load behavior.
- Hid parked Redfinger and merged Cookie workflows into Account Ops in active navigation/dashboard surfaces while preserving direct Redfinger and Cookie Tools compatibility files/routes.
- Removed the remaining preview-only Redfinger sidebar injector so the parked section no longer appears in the active private route shell; direct `/redfinger.html` compatibility remains intact.
- Removed Bulk Lookup from active top-level shared and private-shell navigation so lookup workflows are reached through Vault/Account Ops while direct compatibility routes remain tested.
- Replaced the dashboard quick-route Bulk Lookup card with Vault Triage so the home surface points to active daily workspaces instead of compatibility routes.
- Retargeted the dashboard footer from hidden Integrations to Data Center so every visible dashboard action opens an active daily workspace.
- Routed dashboard action clicks through the private route shell so footer and quick-route actions update URL, active sidebar state, and visible workspace together.
- Rebuilt Adopt Me as a read-only Watcher with only Main and Accounts: Main places inventory directly below the summary dashboard, and Accounts uses search/filter/page-size pagination for large account sets.
- Refined Adopt Me Watcher toward the ZekeHub reference data shape: Main now includes a Farm Performance chart, age-aware inventory filters, production-dense item cards, and owner popups with per-owner copy, copy-all/copy-active, tick mode, pinned owner staging, and deduped username copy. Accounts now uses the denser account-management table with sort/filter/page-size controls and 2,187-row pagination fixtures.
- Kept changes preview-layer only: no backend, auth, database schema, vault migration/export contract, credentials, production publish, or real provider/API data behavior changed.

## 2026-09-14 - Preview wording, icons, and motion polish

- Added a compact monochrome outline icon language to dashboard operation links, Account/Cookie tool launch rows, and Vault Cookie Operations controls.
- Reworded the dashboard changelog, start actions, tool descriptions, Vault Cookie Operations help, triage empty state, missing-match copy, and move confirmation around concrete data boundaries: masked display, existing vault reads, copy/export exposure, and write-on-confirm moves.
- Added restrained triage row reveal/selection motion and focus polish with reduced-motion support; no schema, backend, auth, credential, database, production publish, or user vault data behavior changed.

## 2026-09-13 - Vault Cookie triage console

- Added a compact Vault-embedded Cookie triage console with a paste/search box for usernames, raw cookies, UPC, and UPCE lines.
- Search results stay masked in Vault, show matched/missing rows, support row selection, copy selected matches as UPCE, and move selected matches into today’s dated group after confirmation.
- Kept the existing group-selection Cookie Operations actions and advanced Cookie Tools routes intact; no vault schema, migration, export contract, backend, credential, database, or production behavior changed.

## 2026-09-13 - Shared navigation keyboard toggle

- Added a preview-safe `Ctrl+B` / `Cmd+B` navigation toggle to the shared global navigation adapter. Desktop shells collapse to the compact rail where supported; mobile shells open and close the existing drawer. Text inputs keep their normal shortcuts.
- Bumped global-navigation asset versions for the private shell, Adopt Me, and Redfinger entrypoints so preview receives the new keyboard behavior.
- Verified the new behavior with the anti-slop behavior suite before preview publication.

## 2026-09-13 - Vault extractor handoff

- Added `Extract selected` to Vault Cookie Operations. It passes selected-group usernames into the existing Cookie Extractor workflow without exposing or duplicating cookie values; local behavior and full verification gates passed before preview publication.
- Hardened ordinary Vault cookie rendering so values are masked by default with an explicit Reveal/Hide control; the focused regression now proves both states.
- Added non-sensitive Vault coverage metrics for recently updated cookies and mixed-coverage groups, derived from existing record fields without changing the Vault contract.
- Added explicit selection-action guidance so disabled Vault controls explain the required next step instead of relying on opacity alone.

## 2026-09-12 - Operations OS preview polish and changelog

- Added the first dedicated Inbox workspace to the private route shell. It provides an honest empty state and links to existing Account Splitter, Cookie Extractor, and Data Center review flows without inventing task records or counts.
- Published to preview only. Published behavior regression passed all 15 checks; the expanded UI matrix now captures 54 states, including Inbox at desktop, tablet, and mobile sizes, with no page errors or horizontal overflow; preview health returned HTTP 200.
- Added a shared command palette to the private navigation. `Ctrl+K`/`Cmd+K` and the Search launcher open safe, static workflow metadata; filtered results preserve native links and route to existing Account, Cookie, Vault, Data Center, Scripts, Adopt Me, and Redfinger workspaces.
- Published to preview only. Published behavior regression passed all 14 checks; the full UI matrix captured 51 states with no page errors or horizontal overflow; preview health returned HTTP 200.
- Added a Home `Start here` operation router linking to existing account splitting, cookie coverage, and Data Center review workflows. It uses real routes and does not invent task state.
- Reworked Account Tools and Cookie Tools launch rows into a clearer scan path: title, purpose, metadata boundary, and action now read as one unit on desktop and mobile.
- Added a visible Home changelog panel with honest `Implemented`, `In progress`, and `Next` states. It contains product changes only and is separate from private vault activity.
- Clarified tool descriptions for comparison, splitting, extraction, validation, and lookup; UPCE remains explicitly named without changing parser or storage behavior.
- Published to preview only. Published UI regression captured 51 states with no page errors or horizontal overflow; behavior regression passed all 13 checks; preview health returned HTTP 200.
- Completed the additive optional `email` field path for private Cookie records: UPCE parsing, editor persistence, masked display, CSV import/export, explicit UPCE export/copy, and sync merge updates. Legacy records remain valid without an email field; no destructive migration was run.

## 2026-09-09 - Approved anti-slop preview redesign

- Completed compact dashboard and tool-index composition, focused Comparator/Splitter/PS Links results, Data Center action rows and contextual script editing/distribution.
- Verified real clipboard/download output using synthetic inputs, import and bulk-move cancellation, script delete/revoke/unshare cancellation, route history and keyboard drawers. Tests revealed and fixed mobile drawer navigation overlap and an unrelated vault bulk bar visible on non-vault pages.
- Adopt Me uses full-width mobile content; Redfinger device density is clamped to available width and explicit demo labels/session totals are coherent.
- Evidence lives in `artifacts/anti-slop/implemented/` and, after publication, `published/`; `completion.md` records the final commands and readback evidence. No real credentials, vault records, databases, live provider actions, production publish or commits are part of this work.
- Follow-up preview polish fixed the dashboard quick-route width constraint and strengthened Account/Cookie index rows with grouped tool type and data-boundary metadata. Preview asset versions were bumped; production remains untouched.
- A final dashboard pass removed a reserved icon column from quick-route buttons after visual readback exposed one-word wrapping; published screenshots now show full-width readable workspace links.
- Restored the existing preview backend runner after `/api/health` and `/api/me` returned `502` while static HTML remained available; local and preview health returned `200` afterward. Refined the preview login gate with The Fool's private operator-console language, explicit server-account labels, clearer vault/shared-tool boundaries, and no authentication-flow changes.
- Reworked the login copy again after preview readback showed the first pass was still too generic. The gate now names the Saturnity Vault, owner/operator access, actual private workspace contents, and the separate Fool Tools boundary; signed-out and setup status messages use the same vocabulary.


## 2026-09-08 — Phase 2 preview UI polish

- Scoped signed-out and shared/public preview flows so inactive private vault, drawer, settings, and bulk-action surfaces no longer contribute visible or mobile text-flow content.
- Softened private auth server-unavailable copy while keeping the same backend/auth requests and vault loading behavior.
- Normalized compact button hover, active, disabled, and focus states across the private shell, shared Fool hub, Adopt Me, and Redfinger preview surfaces.
- Tightened mobile navigation chrome and reduced empty dashboard/card height without changing backend behavior, auth logic, schemas, migrations, secrets, databases, or user vault data.

## 2026-09-08 — Phase 3 dedicated preview tool pages

- Split preview Account Tools and Cookie Tools into dedicated page routes instead of stacked embedded panels.
- Added account subpages for Username Comparator, Account Splitter, Username Extractor, and Batch Validator while reusing the existing browser-side tool logic.
- Added cookie subpages for Cookie Extractor and Bulk Lookup, with their existing inputs, result panels, and confirmation boundaries mounted into full-page workspaces.
- Published the redesign to preview only and verified the routes with desktop/mobile screenshots, no horizontal overflow, and no backend, auth, schema, migration, secret, database, or user-vault changes.
- Fixed the preview sidebar route handler so Cookie Tools no longer fails after the global workspace switcher adds extra `data-sv-route` entries, reused the active `/api/me` session probe to reduce duplicate auth checks, and surfaced PS Link Extractor as its own Account Tools page.

## 2026-09-04 — Adopt Me completion and faster authentication

- Finalized the dense Adopt Me workbench surfaces for sessions, inventory,
  configuration, templates, exports, item inspection, and notifications.
- Unified active entrypoint favicons with the same Fool image used by the
  dashboard instead of the generated SVG substitute.
- Started authenticated session probes in each document head so session
  validation runs while the application bundle loads; the primary gate also
  checks backend health and the existing session concurrently.
- Replaced the single-series overview sparkline with a compact interactive
  stacked-area chart, including 7/30/90-day ranges, themed tooltip, legend,
  and The Fool's muted green and graphite-violet data palette.
- Replaced the notification sheet's hand-managed overlay with Base UI Drawer,
  preserving The Fool styling while adding focus management, dismissal,
  portal isolation, and touch swipe behavior. Fixed desktop navigation remains
  a sidebar because it is persistent page structure, not an overlay drawer.

## 2026-08-30 — Redfinger production boundary and logo repair

- Replaced the opaque checkerboard favicon with a small code-native transparent SVG mark and updated all active entrypoints.
- Split Redfinger UI behavior into `assets/redfinger-app.js`, retaining `?demo=1` only for deterministic previews and routing normal navigation to authenticated live mode.
- Added authenticated Redfinger inventory, status, event, sync, command, and passive-capture server endpoints with cached SQLite snapshots and exact `padCode + padId + userPadId` verification.
- Added a localhost-only bridge around the existing verified Redfinger manager inventory reader. Live inventory is read-only; reboot, renewal, and passive capture remain disabled until the provider implementations are proven safe.
- Verified a live 155-device inventory from one configured VPS session without exposing credentials to the frontend.
- Passed Redfinger desktop/mobile/density tests, Adopt Me navigation/mobile tests, and XLS/XLSX extractor compatibility tests before publishing preview and production.

## 2026-08-28

- Installed RTK 0.46.0 and enabled global Codex terminal guidance.
- Installed Graphify 0.9.50 and its Codex skill/project guidance.
- Created the initial code graph and verified graph queries with source locations.
- Installed Graphify post-commit and post-checkout refresh hooks.
- Installed Obsidian 1.13.7 and exported the graph into this vault.
- Added the project knowledge workflow and refresh command.
- Created a Git checkpoint before repository restructuring.
- Separated documentation, tests, ZekeHub research tools, runtime artifacts, browser-session state, and archived Adopt Me prototypes.
- Kept production entrypoints, live asset paths, backend logic, frontend logic, vault schemas, and external database data unchanged.
- Updated repository safeguards and the RTK/Graphify/Obsidian workflow for the final folder structure.
- Refreshed Graphify to 260 nodes, 301 edges, and 24 communities and exported 284 generated Obsidian notes.
- Verified Node and PowerShell syntax, dependency resolution, a temporary Adopt Me production build, XLS/XLSX extraction, standalone desktop/mobile UI behavior, and authenticated-test skipping without credential use.

## 2026-08-30

- Added a preview-only Redfinger VPS command-center page with five session slots, 30-second mock polling, a 200-device fleet model, confirmation-gated reboot/renew controls, passive capture placeholders, timestamped activity logs, and responsive ten/eight/six/four/two/one-column density.
- Extended publishing to include the standalone `/redfinger/` entrypoint while exposing its main-dashboard shortcut only on the preview hostname.
- Refined the fleet cards with compact remaining-time typography, session/region/OS abbreviations, icon-only health states, balanced per-device Log/Reboot/Renew actions, a read-only expanded device dialog, and sticky desktop command-center controls.
- Compressed Redfinger cards around three-digit device names, moved the health indicator beside each name, aligned remaining days with expiry dates, removed progress strips, converted card actions to accessible icon controls, moved fleet filters above summaries, and added Log/Reboot/Renew/passive-refresh controls to the expanded device panel.
- Added persistent 2–20 device density selection, combined fleet and session summaries into one compact desktop strip, placed device identity/status metadata on one line, removed card-action borders, and added a generated landscape dummy capture with a corrected 16:9 expanded preview.
- Rebuilt responsive Redfinger cards with container-aware typography, a strict name/metadata/status alignment grid, equal-width SVG action controls, and a professional density popover whose Detailed/Balanced/Compact/Overview guidance changes across the 2–20 range.
- Corrected density-dependent card distortion by enforcing one invariant card structure at every column count: 16:9 capture, complete expiry row, centered metadata, right-aligned status, equal-third actions, proportional spacing, and zero horizontal overflow from 2 through 20 columns.
- Locked the measured 10-column Redfinger card into a square scalable canvas, converted all child geometry to card-relative units, and absolutely centered session/region/OS metadata so densities now uniformly scale the same design rather than reflowing it.

## 2026-09-03

- Added authenticated farm trade-diagnostic ingestion at `/api/tradelog`, SQLite persistence, and authenticated retrieval at `/api/tradelogs`.
# 2026-09-04 — Preview workspace navigation

- Added a compact global workspace switcher to the preview entrypoints for The Fool, Adopt Me, and Redfinger.
- Organized destinations into Core, Operations, and Data groups so full-page tools remain discoverable without restoring the old generic Tools page.
- Kept the implementation framework-neutral so the same navigation works in both React and legacy HTML surfaces.
- Added an Adopt Me browser regression check for menu contents and keyboard dismissal.
- Added a reusable React Aria Select component and applied it to the interactive chart range control, with keyboard focus, selected-state feedback, and a theme-matched popover.
- Migrated the remaining Adopt Me single-choice controls to the shared Select primitive: configuration values, template icon/accent, exporter status/group filters, and action scope. Multi-choice filters retain their checkbox popover behavior.

# 2026-09-04 — Preview-wide component density pass

- Added a final shared component refinement layer across the private shell, public/shared hub, full-page utilities, Adopt Me, and Redfinger entrypoints.
- Removed decorative minimum heights, reduced redundant container padding, tightened headers/actions, and kept descriptions useful instead of adding filler content.
- Preserved Redfinger device-card geometry because its landscape preview and density proportions are explicit regression-tested invariants.
- Added desktop and mobile checks for shared dashboard/tool overflow and excessive dashboard-map height.

# 2026-09-13 — Verification gate and Redfinger responsive audit

- Replaced the placeholder `npm test` command with the five existing UI, compatibility, Adopt Me, and Redfinger preview suites.
- Fixed Adopt Me mobile regression coverage to open the responsive navigation drawer before selecting Inventory.
- Corrected Redfinger desktop expiry sizing, wide-density behavior, square card geometry, and tablet/mobile density handling without changing provider boundaries or user data.
- Restored the Redfinger desktop command strip to ten panels on one row and kept the mobile grid at two devices per row.
- Preview verification passed: 15 behavior checks, 54 visual captures with no errors or overflow, Adopt Me navigation, XLS/XLSX compatibility, and Redfinger fleet checks.
- Refreshed Graphify and generated project knowledge; no production publication, commit, push, database, vault, schema, or credential changes were made.

# 2026-09-13 — Phone-safe Account Splitter groups

- Added a four-group phone clipboard workflow to Account Splitter while retaining the existing full preview and structured JSON/CSV exports.
- Added group count selection from one to four, complete-line chunking, per-group record and character counts, and independent Copy group actions.
- Added compact two-column desktop output panels and one-column mobile output panels without changing vault parsing, UP/UC/UPC/UPCE formats, or protected data contracts.
- Preview verification passed: 15 behavior checks, 54 visual captures with no errors or overflow, Adopt Me navigation, XLS/XLSX compatibility, and Redfinger fleet checks.

# 2026-09-13 — Vault Cookie Operations surface

- Added a contextual Cookie Operations panel directly inside Vault while preserving the dedicated Cookie Tools route for advanced workflows.
- Added live non-sensitive counts for groups, stored records, and records missing cookies from the existing `vault[]` source of truth.
- Added links for coverage review, bulk lookup, and advanced Cookie Tools; cookie values remain masked and are never rendered by the panel.
- Added compact responsive styling with stacked mobile actions and preserved the existing Vault render lifecycle.
- Preview verification passed: 15 behavior checks, 54 visual captures with no errors or overflow, Adopt Me navigation, XLS/XLSX compatibility, and Redfinger fleet checks.

# 2026-09-13 — Vault Cookie Operations surface verification

- Added a contextual Cookie Operations panel directly inside Vault while preserving the dedicated Cookie Tools route for advanced workflows.
- Added live non-sensitive counts for groups, stored records, and records missing cookies from the existing `vault[]` source of truth.
- Added links for coverage review, bulk lookup, and advanced Cookie Tools; cookie values remain masked and are never rendered by the panel.
- Added compact responsive styling with stacked mobile actions and preserved the existing Vault render lifecycle.
- Preview verification passed: 15 behavior checks, 54 visual captures with no errors or overflow, Adopt Me navigation, XLS/XLSX compatibility, and Redfinger fleet checks.

# 2026-09-13 — Route transition cleanup and action styling

- Added shared route-transition cleanup so navigation closes open vault panels, modal overlays, and inactive dedicated tool details while preserving existing reopen handlers.
- Removed underline presentation from the dashboard `Enter The Fool` secondary action without changing its external shared-workspace destination.
- Added behavior coverage for route cleanup and computed non-underlined styling.
- Local and published behavior checks passed 16/16; full visual and specialized project suites passed with no overflow. Preview health returned HTTP 200 after the existing backend runner was restarted.

# 2026-09-13 — Account Splitter copy progression

- Added valid/rejected completion summary and largest rendered-group character count.
- Added phone-oriented copy progression: copied groups retain a completion label and the next group receives an emphasized `Copy next` action.
- Added an 8,000-character group warning while preserving complete-line boundaries and existing parser/export contracts.
- Local and published behavior checks passed 16/16; the full visual matrix remained 54 captures with no errors or overflow.

# 2026-09-13 — Vault selection actions

- Connected Vault Cookie Operations to the existing group-selection model and bulk handlers.
- Added non-sensitive selected-group count plus Copy cookies, Export selected, and Clear selection controls that remain disabled until a selection exists.
- Preserved masked cookie display, `vault[]` ownership, existing confirmations, and legacy export behavior.
- Local and published behavior checks passed 16/16; the full visual matrix remained 54 captures with no errors or overflow.
