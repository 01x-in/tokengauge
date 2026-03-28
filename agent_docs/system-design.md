# System Design — TokenGauge

## 1. Architecture Overview

TokenGauge is a single-process VS Code extension that runs entirely inside the editor host. It reads Claude Code usage JSONL files from the local filesystem, aggregates token totals in memory, and updates a `StatusBarItem` plus native notifications on a polling loop.

This architecture fits the product because the core value is immediate, passive visibility with no extra service to operate, no API keys, and no network dependency. A local extension keeps the UX fast, preserves privacy, and avoids turning a budget guardrail into an analytics platform.

### Components
- **Extension Activator**: Boots on VS Code startup, restores persisted settings, creates the status bar item, and wires commands plus polling.
- **Path Resolver**: Locates Claude Code data directories using the configured fallback chain and resolves the active workspace/session file scope.
- **JSONL Reader**: Reads Claude Code conversation log files and parses usage blocks defensively, skipping malformed lines.
- **Usage Aggregator**: Computes repo session totals, 5-hour rolling totals, and weekly totals from parsed usage records.
- **Status Bar Controller**: Renders the active mode, cycles display modes on click, and applies color state based on thresholds.
- **Tooltip Builder**: Generates the hover text with all three tiers, reset timers, and the weekly tip footer.
- **Alert Manager**: Tracks threshold crossings, shows one-time warnings, and honors per-session snooze state.
- **Settings Store**: Persists first-run plan selection, thresholds, and snooze metadata in VS Code global state.
- **Cache Layer**: Keeps recent file read and aggregate results in memory to avoid repeated disk work on the 30-second poll.

## 2. Tech Stack

- **Frontend framework**: None. The UI is native VS Code chrome only.
- **Styling**: VS Code `StatusBarItem` text, `ThemeColor`, tooltip strings, and native warning messages.
- **Backend runtime**: Node.js inside the VS Code extension host.
- **Framework**: VS Code Extension API.
- **Language**: TypeScript in strict mode.
- **Database**: None.
- **Secondary stores**: VS Code `globalState` for persisted extension preferences and snooze state; in-memory cache for active session data.
- **Auth mechanism**: None. The extension only reads local files.
- **File storage**: Local Claude Code JSONL logs under the resolved Claude data directories.
- **Caching layer**: In-memory cache only; no Redis, IndexedDB, or filesystem cache.
- **Deployment**: VS Code Marketplace and Open VSX extension packaging.
- **CI/CD**: Standard npm-based lint/test/build pipeline plus packaging verification.

Rationale:
- The extension does not need a web UI, server, or database because every required input is already on disk.
- Native VS Code APIs are the most reliable way to reach the status bar and notifications without extra dependencies.
- Keeping the runtime dependency-free reduces package size and avoids unnecessary startup overhead.

## 3. Data Model

The product has no external database. Its data model is a small set of persisted settings and runtime aggregates.

### `PlanSelection`
- `plan`: `'pro' | 'max5' | 'max20' | 'custom'`
- `sessionLimitTokens`: `number`
- `weeklyLimitTokens`: `number`
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp

Description: Stores the one-time plan selector result and the denominators used for percentage calculations.

### `AlertThresholds`
- `warningThreshold`: `number` default `70`
- `criticalThreshold`: `number` default `85`
- `panicThreshold`: `number` default `95`

Description: Stores configurable percentage thresholds for color states and warning notifications.

### `AlertState`
- `lastNotifiedThresholds`: `string[]`
- `snoozedUntil`: ISO timestamp or `null`
- `sessionKey`: `string`

Description: Prevents repeated notifications for the same threshold crossing within a session and supports per-session snooze.

### `UsageSnapshot`
- `repoSessionConsumed`: `number`
- `session5hConsumed`: `number`
- `weeklyConsumed`: `number`
- `repoSessionResetAt`: ISO timestamp or `null`
- `session5hResetAt`: ISO timestamp or `null`
- `weeklyResetAt`: ISO timestamp or `null`
- `sourceFiles`: `string[]`
- `generatedAt`: ISO timestamp

Description: Runtime aggregate computed from parsed usage blocks and used by the status bar and tooltip.

### `UsageRecord`
- `timestamp`: ISO timestamp
- `inputTokens`: `number`
- `outputTokens`: `number`
- `cacheCreationInputTokens`: `number`
- `cacheReadInputTokens`: `number`
- `workspacePath`: `string`
- `sourceFile`: `string`

Description: Normalized usage event extracted from one JSONL usage block.

### `AppSettings`
- `claudeConfigDirOverride`: `string | null`
- `selectedPlan`: `PlanSelection | null`
- `thresholds`: `AlertThresholds`
- `weeklyTipIndex`: `number`

Description: Persistent extension-level configuration.

### Relationships
- `AppSettings.selectedPlan` determines the denominator used by `UsageSnapshot` percentages.
- `AlertState.sessionKey` is derived from the active workspace and selected mode so alerts reset naturally when the user changes projects or sessions.
- `UsageRecord` entries roll up into a single `UsageSnapshot` for each poll cycle.

### Indexes
There is no database index layer. The effective “indexes” are:
- file path lookups by resolved workspace directory
- in-memory map keyed by source file path
- in-memory session key keyed by workspace + mode + time window

## 4. API Surface

TokenGauge exposes no network API and no HTTP endpoints. The external surface is the VS Code command registry and native extension lifecycle hooks.

### Extension commands

#### `tokengauge.cycleDisplayMode`
- **Method**: command invocation
- **Path**: VS Code command ID
- **Input**: none
- **Output**: updates the active status bar display mode
- **Auth requirement**: none
- **Error cases**:
  - extension not activated → no-op until activation completes
  - no usage data available → status bar still cycles, tooltip remains empty-state aware

#### `tokengauge.refreshUsage`
- **Method**: command invocation
- **Path**: VS Code command ID
- **Input**: none
- **Output**: triggers an immediate file scan and status update
- **Auth requirement**: none
- **Error cases**:
  - unreadable Claude directory → show native warning with recovery guidance
  - corrupted JSONL lines → skip invalid lines and continue

#### `tokengauge.selectPlan`
- **Method**: command invocation
- **Path**: VS Code command ID
- **Input**: plan choice
- **Output**: persists the plan selection to `globalState`
- **Auth requirement**: none
- **Error cases**:
  - invalid plan choice → reject and prompt again
  - custom plan missing numeric limits → block save until both values are set

#### `tokengauge.snoozeAlerts`
- **Method**: command invocation
- **Path**: VS Code command ID
- **Input**: none
- **Output**: records per-session snooze state
- **Auth requirement**: none
- **Error cases**:
  - no active session → no-op

### Internal lifecycle hooks
- `activate(context)` initializes the extension.
- `deactivate()` clears timers and in-memory references.
- `setInterval` polling runs every 30 seconds.

## 5. Key Technical Decisions (ADRs)

### ADR 1: Local filesystem polling instead of watchers
- **Decision**: Use a 30-second polling loop to scan usage files.
- **Rationale**: Claude Code files may be appended by external processes, and polling is simpler and more predictable than file watchers across platforms.
- **Trade-offs**: Data is not instant; updates can lag by up to one poll interval.
- **Alternatives considered**: filesystem watchers, event-driven hooks, or parsing on demand only.

### ADR 2: No backend, no sync service
- **Decision**: Keep all logic inside the extension and local disk.
- **Rationale**: The product is a private, local budget guardrail. A backend would add latency, maintenance, and privacy concerns without improving the core use case.
- **Trade-offs**: Settings and usage history do not sync across machines.
- **Alternatives considered**: cloud sync, telemetry ingestion, or a companion API.

### ADR 3: Native VS Code UI only
- **Decision**: Use only the status bar, hover tooltip, and warning notifications.
- **Rationale**: The seed explicitly excludes webviews and sidebars, and the status bar is the right surface for passive, always-visible feedback.
- **Trade-offs**: Rich analytics and historical exploration are intentionally unavailable.
- **Alternatives considered**: webview dashboard, side panel, or command palette-centric UI.

### ADR 4: Dependency-free runtime
- **Decision**: Avoid npm runtime dependencies.
- **Rationale**: The extension must stay small, fast, and easy to publish across marketplaces.
- **Trade-offs**: Parsing, date handling, and state management must be implemented with native APIs and TypeScript.
- **Alternatives considered**: JSON parser libraries, date utility packages, and UI helper dependencies.

## 6. Security Considerations

- **Auth/authz**: None required. The extension only reads local files that the user already owns.
- **Validation strategy**: Treat every JSONL line as untrusted input. Parse defensively, clamp numeric fields, and ignore malformed or partial records.
- **Secrets management**: No secrets, tokens, or API keys are used or stored.
- **Privacy**: No network calls, no telemetry, and no uploads. All usage data remains local.
- **Failure containment**: Corrupted files, unreadable directories, or missing data must degrade to empty state rather than crash the extension host.

## 7. Performance Targets

- **Scale**: Single developer workstation; tens of log files, not millions of events.
- **Poll interval**: 30 seconds.
- **Startup target**: Extension activation should complete fast enough to avoid noticeable VS Code startup slowdown.
- **Read target**: File reads should be incremental and limited to relevant Claude directories.
- **UI target**: Status bar updates should be immediate once aggregate data is available.

Caching strategy:
- Cache parsed file metadata and the latest aggregate snapshot in memory.
- Recompute only when file mtimes or sizes change.
- Reuse the last known snapshot if no files changed since the previous poll.

## 8. Infrastructure

- **Hosting environment**: None. The product is local-only.
- **Regions**: Not applicable.
- **Dev environment**: Local VS Code extension host on the user’s machine.
- **Staging environment**: Not applicable in the classic sense; use extension packaging and local dev host verification.
- **Production environment**: User-installed extension from Marketplace or Open VSX.
- **Environment variables**:
  - `CLAUDE_CONFIG_DIR`
  - No other environment variables are required
- **Claude directory resolution**:
  - `CLAUDE_CONFIG_DIR`
  - `~/.claude/projects`
  - `~/.config/claude/projects`
- **State persistence**: VS Code `globalState` for plan selection, thresholds, and alert snooze status.
- **Migration approach**: Versioned settings schema in extension state. On activation, migrate older saved shapes into the current `AppSettings` structure.
- **Packaging approach**: Standard VS Code extension packaging with a minimal `package.json` contribution surface.
