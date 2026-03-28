import { describe, expect, it } from "vitest";

import {
  evaluateAlertState,
  type AlertThresholds
} from "../../src/core/alert-manager";

describe("evaluateAlertState", () => {
  const thresholds: AlertThresholds = {
    warning: 70,
    critical: 85,
    panic: 95
  };

  it("emits each crossed threshold exactly once when usage jumps", () => {
    const result = evaluateAlertState({
      previousPercentage: 60,
      currentPercentage: 97,
      state: {
        lastNotifiedThresholds: [],
        snoozedUntil: null,
        sessionKey: "repo:1"
      },
      thresholds,
      sessionKey: "repo:1",
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(result.notifications).toEqual([70, 85, 95]);
    expect(result.state.lastNotifiedThresholds).toEqual(["70", "85", "95"]);
  });

  it("suppresses repeated notifications in the same session and while snoozed", () => {
    const result = evaluateAlertState({
      previousPercentage: 90,
      currentPercentage: 96,
      state: {
        lastNotifiedThresholds: ["70", "85"],
        snoozedUntil: "2026-03-28T12:30:00.000Z",
        sessionKey: "repo:1"
      },
      thresholds,
      sessionKey: "repo:1",
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(result.notifications).toEqual([]);
    expect(result.state.lastNotifiedThresholds).toEqual(["70", "85"]);
  });
});
