# User Stories

### STORY-101: Local Usage Reader

**As a** developer using Claude Code inside VS Code,
**I want** TokenGauge to find my local Claude usage logs and derive repo, 5hr, and weekly token totals,
**So that** the extension can show a useful gauge without any network setup.

**Acceptance Criteria:**
- [ ] The extension resolves Claude data directories in this order: `CLAUDE_CONFIG_DIR`, `~/.claude/projects`, `~/.config/claude/projects`.
- [ ] Valid JSONL usage blocks are parsed into normalized usage records that include timestamps, workspace mapping, and all token counters.
- [ ] Repo, 5hr session, and weekly totals are computed from valid local data without crashing on malformed input.

**Edge Cases:**
- [Fresh install]: Missing Claude data directories return an empty snapshot instead of throwing.
- [Corrupted line]: A malformed JSONL line is skipped and valid records from the same file still count.
- [No workspace folder]: Repo totals degrade safely when VS Code is open without a folder.

**Error States:**
- [No Claude data found] -> Return an empty usage snapshot and render a neutral status label.
- [Read permission failure] -> Surface a terse warning and keep the last known snapshot.

**Notes:**
This story owns path discovery, parsing, and aggregation only. It must stay dependency-free at runtime.

### STORY-102: Status Bar Gauge

**As a** solo developer working inside VS Code,
**I want** the status bar to show the current usage view and let me cycle modes while exposing the full tooltip,
**So that** I can check my budget at a glance without leaving the editor.

**Acceptance Criteria:**
- [ ] The status bar shows the active view mode with the diamond brand mark and a compact usage label.
- [ ] Clicking the status bar cycles modes in this order: Repo, 5hr Session, Weekly Limit, then back to Repo.
- [ ] The tooltip shows Repo, 5hr Session, and Weekly Limit rows together with tokens consumed, percentages, and reset timers.

**Edge Cases:**
- [No usage data]: The status bar still renders and shows a neutral empty-state label.
- [Double click]: Two rapid clicks advance exactly two modes and do not corrupt state.
- [Partial parse]: The tooltip still renders valid rows when one tier has incomplete data.

**Error States:**
- [Tooltip data unavailable] -> Show a short message that usage details are not available yet.
- [Refresh failure] -> Keep the last known label visible and avoid interrupting the editor.

**Notes:**
Keep text terse and data-dense. Do not add onboarding, alerts, or tips here.

### STORY-201: First-Run Plan Setup

**As a** first-time user,
**I want** to choose my Claude plan once and store it locally,
**So that** TokenGauge can calculate percentages against the correct session and weekly limits.

**Acceptance Criteria:**
- [ ] On first activation, the extension prompts for Pro, Max5, Max20, or Custom.
- [ ] The selected plan is saved in VS Code globalState and reused on future launches.
- [ ] The chosen plan determines the denominators used by the status bar and tooltip percentages.

**Edge Cases:**
- [Custom plan]: The user can enter custom session and weekly limits.
- [Invalid custom input]: Non-numeric, zero, or negative values are rejected and the user is prompted again.
- [Existing user]: A user with stored settings is not prompted again unless the state is reset.

**Error States:**
- [Plan selection canceled] -> Use a safe fallback display and re-prompt on next activation.
- [Unreadable stored plan] -> Treat the extension as unconfigured and show the plan picker again.

**Notes:**
This story is local-only. It must not introduce accounts, sync, or network lookups.

### STORY-202: Threshold Alerts

**As a** developer trying not to hit the wall mid-session,
**I want** one-time warnings when my active usage crosses configured thresholds,
**So that** I can slow down before Claude Code stops me.

**Acceptance Criteria:**
- [ ] The extension shows native warning notifications the first time the active mode crosses 70 percent, 85 percent, or 95 percent.
- [ ] Each warning names the affected tier and the percentage crossed.
- [ ] Once a threshold fires in a session, it does not repeat until the next session or until snooze expires.

**Edge Cases:**
- [Threshold jump]: If usage jumps across multiple thresholds between polls, each crossed threshold is handled once.
- [Mode switch]: Changing display modes does not retrigger an already-fired threshold for the same session key.
- [Dismissed warning]: Closing the warning does not reset threshold state.

**Error States:**
- [Notification snoozed] -> Suppress further warnings for the current session.
- [Warning cannot be shown] -> Preserve state and continue evaluating future crossings.

**Notes:**
This story owns threshold and snooze behavior only. Use native VS Code warning UI.

### STORY-301: Workspace and Data Resilience

**As a** daily user switching between projects,
**I want** repo usage and polling behavior to stay accurate across workspace and time-boundary changes,
**So that** the extension remains trustworthy throughout the day.

**Acceptance Criteria:**
- [ ] Repo usage follows the active VS Code workspace folder for the current window.
- [ ] The extension refreshes every 30 seconds using in-memory cache data to avoid unnecessary file reads.
- [ ] Midnight and 5hr rolling-window boundaries are handled correctly when computing resets and percentages.

**Edge Cases:**
- [Workspace switch]: Opening a different folder updates repo usage without restart.
- [Slow file read]: The extension keeps the last known snapshot until the next successful refresh.
- [Missing environment variable]: Fallback directory resolution still works when `CLAUDE_CONFIG_DIR` is unset.

**Error States:**
- [Data directory unavailable] -> Show `◇ data unavailable` and continue polling.
- [Polling refresh failure] -> Preserve the previous snapshot and show a terse warning only when state changes.

**Notes:**
This story hardens live behavior but does not add new UI surfaces.

### STORY-302: Tooltip Tips and Release Readiness

**As a** developer checking usage details,
**I want** a rotating weekly tip in the tooltip footer and a packaged extension that is ready to test,
**So that** the product feels complete for daily use and distribution.

**Acceptance Criteria:**
- [ ] The tooltip footer shows one tip from the curated 52-tip library and rotates weekly rather than per hover.
- [ ] The tip footer stays secondary to the three usage rows and never displaces them.
- [ ] The project builds, tests, and packages successfully for local VS Code installation.

**Edge Cases:**
- [Empty tip library]: The tooltip still renders without the footer.
- [Tip index overflow]: Rotation wraps cleanly after the final tip.
- [Same-week reopen]: Reopening the tooltip in the same week shows the same tip.

**Error States:**
- [Tip unavailable] -> Omit the footer and keep the usage rows intact.
- [Packaging failure] -> Report the exact build step that failed and do not claim release readiness.

**Notes:**
This story includes packaging verification but not marketplace publishing.
