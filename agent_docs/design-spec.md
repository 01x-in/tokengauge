# Design Spec

## 1. Design Rationale
TokenGauge should feel clinical, quiet, and precise: a budget guardrail embedded in VS Code chrome, not an app that asks for attention. The product has no custom visual surface beyond native extension UI, so every decision favors dense legibility, low friction, and immediate signal over decoration.

Assumption: `agent_docs/product-brief.md` was not present when this spec was written, so the brief below is derived directly from `product-seed.md` and the seed's handoff note.

## 2. Color System
TokenGauge is both light and dark theme compatible through VS Code `ThemeColor` mapping at runtime. The hex values below define the semantic fallback palette and documentation target.

**Dark semantic palette**
- `--color-bg-primary: #111827`
- `--color-bg-secondary: #1f2937`
- `--color-bg-tertiary: #374151`
- `--color-bg-overlay: #0f172a`
- `--color-border: #334155`
- `--color-border-strong: #60a5fa`
- `--color-text-primary: #f8fafc`
- `--color-text-secondary: #cbd5e1`
- `--color-text-disabled: #64748b`
- `--color-text-inverse: #0f172a`
- `--color-brand: #22c55e`
- `--color-brand-hover: #16a34a`
- `--color-brand-subtle: #14532d`
- `--color-success: #22c55e`
- `--color-success-subtle: #052e16`
- `--color-warning: #f59e0b`
- `--color-warning-subtle: #451a03`
- `--color-error: #ef4444`
- `--color-error-subtle: #450a0a`
- `--color-info: #38bdf8`
- `--color-info-subtle: #082f49`

**Light semantic palette**
- `--color-bg-primary: #ffffff`
- `--color-bg-secondary: #f8fafc`
- `--color-bg-tertiary: #e2e8f0`
- `--color-bg-overlay: #f1f5f9`
- `--color-border: #cbd5e1`
- `--color-border-strong: #2563eb`
- `--color-text-primary: #0f172a`
- `--color-text-secondary: #334155`
- `--color-text-disabled: #94a3b8`
- `--color-text-inverse: #ffffff`
- `--color-brand: #16a34a`
- `--color-brand-hover: #15803d`
- `--color-brand-subtle: #dcfce7`
- `--color-success: #16a34a`
- `--color-success-subtle: #dcfce7`
- `--color-warning: #d97706`
- `--color-warning-subtle: #fef3c7`
- `--color-error: #dc2626`
- `--color-error-subtle: #fee2e2`
- `--color-info: #0284c7`
- `--color-info-subtle: #e0f2fe`

Contrast ratios: text-primary on bg-primary exceeds WCAG AA in both modes; text-secondary on bg-secondary also exceeds WCAG AA.

## 3. Typography
Display / Heading
  Font:       VS Code UI sans stack
  Source:     System
  Weights:    600, 700
  Use:        Extension setup labels, tooltip headings, and any compact section titles

Body / UI
  Font:       VS Code UI sans stack
  Source:     System
  Weights:    400, 500
  Use:        All labels, helper text, notifications, and quick-pick copy

Monospace
  Font:       ui-monospace
  Source:     System
  Weights:    400, 500
  Use:        Token counts, reset timers, plan denominators, and status bar text

Type Scale
- `--text-xs: 0.75rem`
- `--text-sm: 0.8125rem`
- `--text-base: 0.875rem`
- `--text-lg: 1rem`
- `--text-xl: 1.125rem`
- `--text-2xl: 1.25rem`
- `--text-3xl: 1.5rem`

Line Heights
- `--leading-tight: 1.15`
- `--leading-snug: 1.3`
- `--leading-normal: 1.45`
- `--leading-relaxed: 1.6`

Letter Spacing
- `--tracking-tight: -0.02em`
- `--tracking-normal: 0em`
- `--tracking-wide: 0.04em`

## 4. Spacing System
Base unit: 4px.

- `--space-1: 0.25rem`
- `--space-2: 0.5rem`
- `--space-3: 0.75rem`
- `--space-4: 1rem`
- `--space-5: 1.25rem`
- `--space-6: 1.5rem`
- `--space-8: 2rem`
- `--space-10: 2.5rem`
- `--space-12: 3rem`
- `--space-16: 4rem`
- `--space-20: 5rem`
- `--space-24: 6rem`

Default component padding: buttons `space-2` vertical and `space-4` horizontal; badges `space-1` vertical and `space-2` horizontal; tooltip rows `space-1` vertical and `space-3` horizontal.

Default card/panel padding: `space-4` all sides for quick pick and tooltip content.

Content max-width: no page-level content width; native VS Code surfaces own their sizing. Tooltip content should cap at `28rem`.

## 5. Shape and Depth
Border Radius
- `--radius-sm: 4px`
- `--radius-md: 6px`
- `--radius-lg: 8px`
- `--radius-full: 9999px`

Shadows
- `--shadow-sm: none`
- `--shadow-md: none`
- `--shadow-lg: none`

Rationale: border-first, not shadow-first. The product lives inside native VS Code chrome and should remain crisp and low-noise.

## 6. Motion
Motion should be minimal and utilitarian. Transitions communicate state changes, but nothing should feel decorative or attention-seeking.

- `--ease-default: cubic-bezier(0.2, 0, 0, 1)`
- `--ease-enter: cubic-bezier(0, 0, 0, 1)`
- `--ease-exit: cubic-bezier(0.4, 0, 1, 1)`
- `--ease-spring: cubic-bezier(0.2, 0.8, 0.2, 1)`

- `--duration-instant: 0ms`
- `--duration-fast: 100ms`
- `--duration-normal: 160ms`
- `--duration-slow: 220ms`

Animation budget: Minimal. The only persistent animation allowed is the >95% red pulse, and it must stop under `prefers-reduced-motion: reduce`.

## 7. Component Inventory
### Status Bar Item
Character: compact, data-dense, and always legible at a glance.
Variants: Repo session, 5hr session, Weekly limit, Attention state.
States: Default shows active mode; Hover exposes the full tooltip; Focus follows native VS Code accessibility behavior; Active/Pressed cycles the display mode; Disabled is hidden only when no data exists.
Size options: single-line only.
Notes: Use the diamond brand mark and concise token/percentage text.

### Quick Pick / Plan Selector
Character: terse setup control with no visual flourish.
Variants: Pro, Max5, Max20, Custom.
States: Default, Hover, Focus, Active/Pressed, Disabled while loading, Loading during initial scan, Error if custom values are invalid.
Size options: VS Code native quick-pick sizing.
Notes: Only shown once unless the user resets global state.

### Tooltip
Character: fixed-width, information-first, and tightly aligned.
Variants: Standard summary, low-data empty state, parse-error state.
States: Default, Hover, Focus via native hover, Loading while refreshing, Error when data is unreadable.
Size options: one compact surface only.
Notes: Contains all three tiers, reset timers, and the rotating tip footer.

### Badge / Tag
Character: small, muted, and utilitarian.
Variants: Repo, 5hr, Weekly, New, Snoozed.
States: Default, Hover, Active, Disabled.
Size options: `sm` only.
Notes: Used to label rows inside the tooltip and setup copy.

### Button
Character: secondary and quiet; no hero actions.
Variants: Primary quick-pick confirm, Secondary cancel, Ghost reset.
States: Default, Hover, Focus, Active/Pressed, Disabled, Loading.
Size options: `sm`, `md`.
Notes: Only appears in setup or settings flows.

### Input
Character: compact numeric entry with clear validation feedback.
Variants: Integer, Percentage, Duration.
States: Default, Hover, Focus, Filled, Error, Disabled.
Size options: `sm`, `md`.
Notes: Used only for custom plan denominators and threshold settings.

### Loading State
Character: restrained, with no shimmer or skeleton theater.
Variants: Status bar placeholder, tooltip refresh, quick-pick scan.
States: Static placeholder or subtle spinner only.
Size options: context-dependent.
Notes: The product should feel responsive even while polling local files.

### Empty State
Character: calm and direct.
Variants: No Claude data, no active workspace, unsupported plan.
States: Informational only.
Size options: tooltip-sized.
Notes: Explain the next actionable step in one sentence.

### Error State
Character: precise, non-alarming, and actionable.
Variants: Corrupted JSONL, unreadable directory, unknown plan, invalid custom values.
States: Visible, recoverable, or fallback to last known good state.
Size options: tooltip-sized or notification-sized.
Notes: Never expose stack traces in user-facing copy.

### Toast / Notification
Character: native VS Code warning messaging with one clear action.
Variants: Threshold crossed, one-time setup reminder, parse failure.
States: Warning, informational, snoozed.
Size options: native only.
Notes: Use `window.showWarningMessage`; no custom toast UI.

## 8. Layout System
Grid: 4px base unit.
Page grid: no custom app grid; surfaces are native VS Code status bar, quick pick, and hover tooltip.
Sidebar width: not applicable.
Panel/drawer widths: tooltip `320px` target, quick pick `480px` target.

Breakpoints
- `--breakpoint-sm: 640px`
- `--breakpoint-md: 768px`
- `--breakpoint-lg: 1024px`
- `--breakpoint-xl: 1280px`
- `--breakpoint-2xl: 1536px`

Responsive strategy: Desktop-only chrome surfaces. The extension adapts to VS Code, not to custom page layouts.

## 9. Microcopy Tone
Rule 1 - Terse signal: say what changed and what it means.
  Good: "5hr session at 83%"
  Bad: "Your usage is approaching the limit, please consider reducing activity"

Rule 2 - No drama: warnings should be factual, not emotional.
  Good: "Weekly limit crossed"
  Bad: "You're in trouble"

Rule 3 - Actionable empty/error copy: tell the user the next step.
  Good: "No Claude Code data found. Open a project and start a session."
  Bad: "Nothing to show"

Rule 4 - Short labels: prefer nouns and numbers over sentences.
  Good: "Reset in 2h 14m"
  Bad: "The session will reset in approximately two hours and fourteen minutes"

Error message format: plain language, state the failure, then state the fallback or next action. Never show stack traces.

Empty state format: one short sentence plus one suggested action. No illustration.

Loading message format: active verb plus object, such as "Scanning local usage files".

## 10. Accessibility Floor
- Color contrast: WCAG AA minimum for all text and status indicators.
- Focus indicators: 2px solid `--color-border-strong` with 2px offset.
- Target sizes: 44x44px for quick-pick buttons and inputs; status bar actions use native VS Code hit targets.
- Motion: all motion disabled under `prefers-reduced-motion: reduce`.
- Screen reader: status bar item must expose an accessible label; quick pick and notifications rely on native VS Code semantics; all icon-only actions need labels.

## 11. UI Assertions
# No frontend routes — ui-ux-review-agent will skip automatically
