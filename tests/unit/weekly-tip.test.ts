import { describe, expect, it } from "vitest";

import { getWeeklyTip } from "../../src/core/weekly-tip";

describe("getWeeklyTip", () => {
  it("returns a stable tip within the same week and rotates the next week", () => {
    const first = getWeeklyTip({
      now: "2026-03-28T12:00:00.000Z",
      tips: ["Tip A", "Tip B", "Tip C"]
    });
    const second = getWeeklyTip({
      now: "2026-03-29T18:00:00.000Z",
      tips: ["Tip A", "Tip B", "Tip C"]
    });
    const third = getWeeklyTip({
      now: "2026-03-30T08:00:00.000Z",
      tips: ["Tip A", "Tip B", "Tip C"]
    });

    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });

  it("returns null when the tip library is empty", () => {
    expect(getWeeklyTip({ now: "2026-03-28T12:00:00.000Z", tips: [] })).toBeNull();
  });
});
