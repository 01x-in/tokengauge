import { describe, expect, it } from "vitest";

import {
  aggregateUsageSnapshot,
  type UsageRecord
} from "../../src/core/usage-aggregator";

describe("aggregateUsageSnapshot", () => {
  it("computes repo, 5hr session, and weekly totals with reset times", () => {
    const records: UsageRecord[] = [
      {
        timestamp: "2026-03-28T08:00:00.000Z",
        workspacePath: "/Users/tester/work/tokengauge",
        sourceFile: "/tmp/a.jsonl",
        inputTokens: 200,
        outputTokens: 100,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        totalTokens: 300
      },
      {
        timestamp: "2026-03-28T11:30:00.000Z",
        workspacePath: "/Users/tester/work/tokengauge",
        sourceFile: "/tmp/b.jsonl",
        inputTokens: 50,
        outputTokens: 25,
        cacheCreationInputTokens: 10,
        cacheReadInputTokens: 5,
        totalTokens: 90
      },
      {
        timestamp: "2026-03-28T11:00:00.000Z",
        workspacePath: "/Users/tester/work/other",
        sourceFile: "/tmp/c.jsonl",
        inputTokens: 400,
        outputTokens: 100,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        totalTokens: 500
      }
    ];

    const snapshot = aggregateUsageSnapshot({
      records,
      activeWorkspacePath: "/Users/tester/work/tokengauge",
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(snapshot.repoSessionConsumed).toBe(390);
    expect(snapshot.session5hConsumed).toBe(890);
    expect(snapshot.weeklyConsumed).toBe(890);
    expect(snapshot.repoSessionResetAt).toBe("2026-03-28T13:00:00.000Z");
    expect(snapshot.session5hResetAt).toBe("2026-03-28T13:00:00.000Z");
    expect(snapshot.weeklyResetAt).toBe("2026-03-30T00:00:00.000Z");
  });

  it("returns an empty snapshot when there are no matching records", () => {
    const snapshot = aggregateUsageSnapshot({
      records: [],
      activeWorkspacePath: "/Users/tester/work/tokengauge",
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(snapshot.repoSessionConsumed).toBe(0);
    expect(snapshot.session5hConsumed).toBe(0);
    expect(snapshot.weeklyConsumed).toBe(0);
    expect(snapshot.sourceFiles).toEqual([]);
  });
});
