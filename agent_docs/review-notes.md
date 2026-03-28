# Review Notes
Date: 2026-03-28
Verdict: NEEDS REVISION

## Summary
The planning set is directionally solid and faithful to the product seed, but there is a critical alignment failure between `milestones.md` and `user-stories.md`. The current story IDs and scope split would break the orchestrator's build loop because it depends on exact story-ID matching and milestone coverage.

## Issues Found

### Critical (must fix before building)
- Story ID mismatch: `agent_docs/milestones.md` defines `STORY-101`, `STORY-102`, `STORY-201`, `STORY-202`, `STORY-301`, and `STORY-302`, but `agent_docs/user-stories.md` defines `STORY-101`, `STORY-102`, `STORY-103`, `STORY-201`, `STORY-202`, `STORY-301`, and `STORY-302` with different feature ownership. In particular, Milestone 2 expects first-run plan setup in `STORY-201`, while `user-stories.md` assigns threshold alerts to `STORY-201` and moves plan selection to `STORY-301`.
- Milestone 1 completeness gap: `agent_docs/milestones.md` says Milestone 1 ships a working status bar with values derived from local Claude logs, but the data-discovery and polling work required for that is split into `STORY-103` in `agent_docs/user-stories.md` and is not present in the Milestone 1 story list. The milestone cannot be implemented end-to-end as currently numbered.

### Minor (should fix but not blockers)
- Design-spec timing note: `agent_docs/design-spec.md` states that `agent_docs/product-brief.md` was not present when it was written. That is acceptable for this project because the seed already contains the relevant UX direction, but the note should be removed or regenerated after the product brief exists to avoid confusion later.

## What's Working Well
- Product fidelity: The product brief, system design, and design spec all preserve the core positioning of TokenGauge as a local, passive budget guardrail rather than an analytics tool.
- Technical discipline: The system design makes clear, practical choices for a VS Code extension and respects the seed constraints around zero runtime dependencies, local-only reads, and native VS Code UI surfaces.
- Milestone shape: The overall three-milestone plan is sensible for a solo builder and keeps the MVP focused.

## Recommendation
Fix the critical issues above before proceeding. The following docs need updates: `agent_docs/milestones.md`, `agent_docs/user-stories.md`, and optionally `agent_docs/design-spec.md`.
