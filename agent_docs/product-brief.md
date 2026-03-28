# Product Brief — TokenGauge

## 1. Product Overview

**Product name:** TokenGauge

**One-sentence pitch:** TokenGauge is a VS Code status bar extension for Claude Code users who want a passive fuel gauge for token usage, so they can stay inside their limits without switching to a terminal or browser.

**Problem statement:** Claude Code users on Pro and Max plans can be deep in a session with no clear sense of how close they are to a 5-hour reset or weekly cap. They only find out they are out of room when they hit the wall mid-flow, which breaks context and wastes time.

**Solution statement:** TokenGauge reads Claude Code’s local usage logs and turns them into a live, always-visible status bar indicator with hover details, reset timers, and warning thresholds. It gives the user a fast answer to one question: am I safe to keep going?

## 2. Target Users

### Persona 1: Maya, the Solo Builder

**Context:** Maya is building a side project in VS Code on a Claude Code Pro plan. She uses Claude constantly during focused coding sessions and does not want to open another tool just to check usage.

**Goal:** Keep moving while staying below her session and weekly limits.

**Frustration:** Existing tools tell her what happened after the fact, not whether she is about to run out of room.

**Behaviour:** She glances at the status bar, clicks to switch views when needed, and uses the tooltip to decide whether to keep prompting or slow down.

### Persona 2: Jordan, the Heavy Daily User

**Context:** Jordan works in VS Code for long stretches and depends on Claude Code throughout the day. He has been blocked before and now watches usage more carefully.

**Goal:** Avoid surprise interruptions and pace usage across the day.

**Frustration:** Terminal-only or dashboard-style tools are not visible enough during real work.

**Behaviour:** He keeps TokenGauge running in the background and relies on color changes and one-time warnings to catch risky usage before it becomes a problem.

## 3. Core Value Proposition

TokenGauge is not an analytics tool. It is a budget guardrail for Claude Code users who need an immediate, low-friction signal about remaining token room. The value is in staying in the flow: no browser, no terminal, no retrospective reports, just a live indicator in the place where the work is already happening.

## 4. Feature Set

**Must Have (MVP):**
- Status bar display for current token usage in the active view mode.
- Click-to-cycle between Repo, 5hr Session, and Weekly Limit views.
- Hover tooltip showing all three tiers with token counts, percentages, and reset timers.
- Color-coded status states with green, yellow, red, and pulsing red thresholds.
- One-time warning notifications when configured thresholds are crossed, with per-session snooze.
- First-run plan selector for Pro, Max5, Max20, or Custom limits.
- Automatic Claude Code data directory detection with the documented fallback chain.
- Weekly token-saving tip in the tooltip footer.

**Should Have (Post-MVP):**
- Better onboarding copy for explaining plan selection and data detection.
- Extra tip library expansion and tip rotation controls.

**Won't Have (Explicitly Out of Scope):**
- No analytics dashboard or charts.
- No cost-in-dollars display.
- No per-model breakdown.
- No OpenTelemetry integration.
- No multi-tool support in v1.
- No team/org features.
- No CLI companion tool.
- No historical data export.
- No webview or custom UI panels of any kind.

## 5. UX Principles

**Zero Context Switch:** The user should not need to leave VS Code to understand their current usage state.

**Always Visible, Never Noisy:** The status bar must stay present without becoming distracting; warnings should be rare and specific.

**Data First:** The UI should prioritize exact counts, percentages, and reset timing over decorative language.

**Terse Microcopy:** Text should read like a utility, not a product tour. If a message can be shorter without losing meaning, it should be shorter.

## 6. Success Metrics

- First-run completion rate for plan selection.
- Percentage of active Claude Code sessions where the status bar is visible and populated.
- Reduction in user-reported surprise limit hits after installing TokenGauge.
- Frequency of tooltip opens and mode switches per active session.
- Warning threshold accuracy: alerts should fire when the configured limits are crossed, not before or after.

## 7. Risks and Assumptions

- **Assumption:** Claude Code’s local JSONL usage logs are stable enough to parse reliably across normal installs.
- **Assumption:** The user is willing to choose a plan preset once, or enter a custom limit if needed.
- **Risk:** If Claude changes its local storage format, the extension could stop reading usage correctly.
- **Risk:** If the user runs multiple workspaces or switches projects often, the repo-session view may be harder to interpret unless detection stays accurate.
- **Risk:** Because the product is local-only, it cannot help if Claude usage data is missing, delayed, or corrupted.
