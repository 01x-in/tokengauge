# Product Seed — TokenGauge (VS Code Extension)

> A lightweight VS Code status bar extension that acts as a fuel gauge for AI coding token usage — helping developers stay within their limits instead of analyzing past spend.

---

## Problem Statement

Developers using Claude Code on Pro/Max plans have no real-time visibility into how close they are to hitting their 5-hour session limit or weekly usage cap. They code happily until they slam into a "try again later" wall mid-flow, losing momentum and context. Existing tools (ccusage, Claude-Code-Usage-Monitor, ClaudeCodeUsage) are either terminal-only CLIs, macOS-only menu bar apps, or analytics dashboards focused on retrospective cost tracking. None of them answer the in-the-moment question: "Am I safe to keep going, or should I slow down?"

## Target User

A solo developer or indie builder on a Claude Code Pro plan, deep in a coding session inside VS Code, who has been burned at least once by unexpectedly hitting their usage limit — and now wants a passive, always-visible fuel gauge so they can pace themselves without context-switching to a terminal or browser.

## Core Value Proposition

TokenGauge lets Claude Code users see their remaining token budget at a glance in the VS Code status bar — with color-coded warnings and reset timers — so they never get blindsided by hitting a usage limit mid-session.

## Key Features

- Status bar displays current token usage for the selected view mode (repo session, 5hr rolling window, or weekly limit)
- Click on status bar cycles through three display modes: Repo (active project), 5hr Session, Weekly Limit
- Hover tooltip always shows all three tiers simultaneously with tokens consumed, percentage used, and reset countdown timers
- Color-coded status bar text: green (below 70%), yellow (70–85%), red (above 85%), pulsing red (above 95%) based on the active display mode
- Configurable alert thresholds (default 70%, 85%, 95%) that fire a one-time VS Code warning notification at each crossing, with per-session snooze
- One-time first-run plan selector (Pro / Max5 / Max20 / Custom) to set the session and weekly limit denominators, stored in globalState
- Auto-detection of Claude Code data directory with fallback chain: CLAUDE_CONFIG_DIR env var → ~/.claude/projects → ~/.config/claude/projects
- Weekly token-saving tip displayed in the tooltip footer, rotating from a curated library of 52 tips

## Tech Preferences

- Pure TypeScript, zero npm runtime dependencies — native Node.js fs, path, os only
- VS Code Extension API (minimum VS Code 1.74.0)
- JSONL parser reads usage blocks from Claude Code's local conversation log files
- 30-second polling interval with in-memory cache (no file system watchers)
- Packaged extension size target: under 50KB
- Publish to both VS Code Marketplace and Open VSX Registry (for Cursor/Windsurf users)

## Constraints

- Zero configuration required beyond the one-time plan selection — install and it works
- No API keys, no authentication, no network calls — purely local file reads
- No webview panels, no sidebar views — status bar and native VS Code notifications only
- Must not degrade VS Code performance — lazy file reads, no blocking operations
- Must handle missing data gracefully (new install, no Claude Code data yet, corrupted JSONL lines)

## Out of Scope

- No analytics dashboard or charts
- No cost-in-dollars display (tokens only — keeps it plan-agnostic and avoids stale pricing)
- No per-model breakdown
- No OpenTelemetry integration
- No multi-tool support (Codex, Gemini, Aider) — Claude Code only in v1
- No team/org features
- No CLI companion tool
- No historical data export
- No webview or custom UI panels of any kind

## Additional Context

- Competitive landscape: ClaudeCodeUsage (jack21) is the closest VS Code extension — it does status bar + webview dashboard focused on cost analytics. TokenGauge differentiates by being a budget guardrail, not an analytics tool — fuel gauge vs rearview mirror.
- ccusage (ryoppippi) is a popular CLI with statusline integration but it's terminal-native, not VS Code-native.
- Claude-Code-Usage-Monitor (Maciek-roboblog) is a Python terminal TUI with Rich UI — plan-aware limits (Pro: 44k, Max5: 88k, Max20: 220k) and rolling session detection logic that can be referenced.
- Claude-Usage-Tracker (hamed-elfayome) is macOS-only Swift menu bar app.
- The JSONL data format under ~/.claude/projects/ is a de facto standard — every tool in the ecosystem reads from it. Each assistant response contains a usage object with input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens.
- Anthropic officially documents OTEL export but that's overkill for this use case — local JSONL is the right data source.
- The 5hr rolling session window and weekly limits are not formally documented with exact token counts — the Monitor project uses empirically observed limits that can be referenced and made user-configurable.
- Future v2 will add multi-tool support (Codex, Gemini, Aider), CLI companion, optional minimal gauge webview, and Cursor/Windsurf-specific polish.
- Domain: tokengauge.cc. GitHub: tushar-im/tokengauge.

## Design Direction

No visual design needed — this is a status bar-only extension with no custom UI. Design decisions are limited to status bar text formatting and tooltip layout.

Status bar text: concise, monospace-friendly, data-dense. Format: `◇ 42.3k tokens` or `◇ 83% · 2h 14m`. The diamond character (◇) serves as the brand mark in place of a custom icon.

Tooltip: fixed-width layout using Unicode box characters for alignment. Three rows, each showing: label, token count, percentage, reset timer. No decorative elements.

Color states map to VS Code ThemeColor values — not custom colors. Green/yellow/red must work in both light and dark themes.

Warning notifications use native VS Code `window.showWarningMessage` — no custom toast or overlay.

Microcopy tone: terse and informational. "5hr session at 83% · Resets in 2h 14m" not "You're running low on tokens! Consider slowing down."

---
<!-- Agent Handoff Note

system-design-agent: This is a VS Code extension, not a web app or service. The entire
  architecture is a single TypeScript file that activates on VS Code startup, sets up a
  polling timer, reads local JSONL files, and updates a StatusBarItem. No server, no API,
  no database. The JSONL parsing and 5hr rolling window calculation are the core logic.

milestone-agent: Milestone 1 must deliver the status bar with all three display modes,
  click-to-cycle, and the hover tooltip. Milestone 2 adds the alert/threshold system.
  Milestone 3 adds the weekly tips. The user wants a shippable weekend MVP — keep Milestone 1
  tight enough to build in a day.

user-stories-agent: Key edge cases from ideation:
  - User has Claude Code installed but no conversation data yet (fresh install)
  - User has CLAUDE_CONFIG_DIR set to a non-default path
  - JSONL file has corrupted/incomplete lines (partial writes during crash)
  - User switches VS Code windows between projects — repo session must update to match active workspace
  - 5hr rolling window spans across midnight/timezone boundaries
  - User is on a custom enterprise plan with unknown limits

product-brief-agent: Positioning angle = "Not analytics. A budget guardrail."
  The user explicitly compared this to ClaudeCodeUsage and said that's for power users
  with $200 plans who want analytics. TokenGauge is for the Pro plan user who just wants
  to manage their usage and not hit the wall. Tagline direction: "Stay in the green."

design-spec-agent: No visual design surface — status bar and native notifications only.
  Skip this agent or produce a minimal spec covering just the status bar text format,
  tooltip layout, and ThemeColor mappings.
-->
