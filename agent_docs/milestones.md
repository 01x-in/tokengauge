# Milestones

### Milestone 1 — Core Gauge
**Goal:** A user can open VS Code and see their Claude Code usage in the status bar, switch between the three views, and inspect the tooltip without leaving the editor.

**Stories:**
- STORY-101: Local Usage Reader — detect the Claude Code data directory, parse JSONL usage blocks, and surface repo/session/weekly usage totals from local files.
- STORY-102: Status Bar Gauge — show the active usage mode in the VS Code status bar, cycle modes on click, and display the three-tier tooltip with reset timers.

**Deliverables:**
- A working status bar item visible on startup.
- Repo, 5hr session, and weekly usage values derived from local Claude Code logs.
- Click-to-cycle behavior across all three modes.
- Tooltip that shows all three tiers at once.
- Graceful empty-state behavior when there is no Claude Code data yet or a JSONL line is corrupted.

**Definition of Done:**
- User can install the extension, open a workspace with Claude Code data, and immediately see a usage value in the status bar.
- Clicking the status bar cycles through Repo, 5hr Session, and Weekly Limit.
- Hovering the status bar shows all three tiers with tokens consumed and reset countdowns.
- Fresh installs and corrupted JSONL lines do not crash VS Code or block the status bar from rendering.

**Dependencies:**
- Claude Code local data format and directory layout from the product seed.

**Estimated Duration:** 3 days

### Milestone 2 — Plan and Warnings
**Goal:** A user can choose the correct plan denominator once, tune warning thresholds, and receive one-time alerts before they hit a usage wall.

**Stories:**
- STORY-201: First-Run Plan Setup — prompt for Pro / Max5 / Max20 / Custom on first launch, persist the selection in globalState, and use it to compute session and weekly limits.
- STORY-202: Threshold Alerts — fire one-time VS Code warnings at configurable warning levels, support per-session snooze, and avoid repeat alerts after a threshold has already been crossed.

**Deliverables:**
- First-run plan selector.
- Persistent plan choice across restarts.
- Configurable threshold values with sane defaults.
- Native warning notifications at threshold crossings.
- Snooze behavior for the current session.

**Definition of Done:**
- A first-time user is prompted to choose a plan and that choice survives VS Code restart.
- Warning notifications appear once when usage crosses each configured threshold.
- Snoozing a warning suppresses further notifications for the current session.
- A user can keep working without being spammed by repeated alerts.

**Dependencies:**
- Milestone 1 must already read and display live usage correctly.

**Estimated Duration:** 3 days

### Milestone 3 — Hardening and Finish
**Goal:** The extension feels complete for daily use: it handles workspace changes cleanly, rotates useful weekly tips, and is ready for packaging and release.

**Stories:**
- STORY-301: Workspace and Data Resilience — keep the repo view aligned with the active VS Code workspace, handle CLAUDE_CONFIG_DIR fallback paths, and stay responsive across polling updates and midnight boundary changes.
- STORY-302: Tooltip Tips and Release Readiness — add the rotating weekly token-saving tip in the tooltip footer, verify performance constraints, and prepare the packaged extension for Marketplace/Open VSX publishing.

**Deliverables:**
- Active workspace changes reflected in the repo usage view.
- Data directory fallback chain works as documented.
- Polling remains lightweight and responsive.
- Weekly tip footer appears in the tooltip and rotates from the curated tip library.
- Release packaging/publishing checks are in place.

**Definition of Done:**
- Switching VS Code windows or workspaces updates the repo usage view without manual refresh.
- Users with custom CLAUDE_CONFIG_DIR values still see usage data from the correct location.
- The extension remains responsive during repeated polling and across a midnight rollover.
- The tooltip shows a rotating weekly tip and the packaged artifact is ready for distribution.

**Dependencies:**
- Milestones 1 and 2 complete, because the core gauge and alerts must already be stable before hardening.

**Estimated Duration:** 4 days
