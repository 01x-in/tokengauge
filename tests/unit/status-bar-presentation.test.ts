import { describe, expect, it } from "vitest";

import {
  buildStatusBarPresentation,
  cycleDisplayMode
} from "../../src/core/status-bar-presentation";

describe("cycleDisplayMode", () => {
  it("cycles repo -> session -> weekly -> repo", () => {
    expect(cycleDisplayMode("repo")).toBe("session");
    expect(cycleDisplayMode("session")).toBe("weekly");
    expect(cycleDisplayMode("weekly")).toBe("repo");
  });
});

describe("buildStatusBarPresentation", () => {
  it("renders a neutral empty state when usage is unavailable", () => {
    const presentation = buildStatusBarPresentation({
      mode: "repo",
      snapshot: {
        repoSessionConsumed: 0,
        session5hConsumed: 0,
        weeklyConsumed: 0,
        repoSessionResetAt: null,
        session5hResetAt: null,
        weeklyResetAt: "2026-03-30T00:00:00.000Z",
        sourceFiles: [],
        generatedAt: "2026-03-28T12:00:00.000Z"
      },
      plan: {
        plan: "pro",
        sessionLimitTokens: 44000,
        weeklyLimitTokens: 220000
      },
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(presentation.text).toBe("◇ no data");
    expect(presentation.colorKey).toBe("statusBarItem.warningForeground");
    expect(presentation.tooltip).toContain("No Claude Code usage data found yet.");
  });

  it("renders the active label and tooltip summary for all three tiers", () => {
    const presentation = buildStatusBarPresentation({
      mode: "weekly",
      snapshot: {
        repoSessionConsumed: 390,
        session5hConsumed: 890,
        weeklyConsumed: 120_450,
        repoSessionResetAt: "2026-03-28T16:30:00.000Z",
        session5hResetAt: "2026-03-28T16:30:00.000Z",
        weeklyResetAt: "2026-03-30T00:00:00.000Z",
        sourceFiles: ["/tmp/a.jsonl", "/tmp/b.jsonl"],
        generatedAt: "2026-03-28T12:00:00.000Z"
      },
      plan: {
        plan: "pro",
        sessionLimitTokens: 44000,
        weeklyLimitTokens: 220000
      },
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(presentation.text).toBe("◇ 54.8% · 1d 12h");
    expect(presentation.colorKey).toBe("statusBarItem.foreground");
    expect(presentation.tooltip).toContain("Repo");
    expect(presentation.tooltip).toContain("5hr");
    expect(presentation.tooltip).toContain("Weekly");
    expect(presentation.tooltip).toContain("390");
    expect(presentation.tooltip).toContain("120.5k");
  });
});
