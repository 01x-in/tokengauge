import { describe, expect, it } from "vitest";

import { PLAN_PRESETS } from "../../src/core/plans";

describe("PLAN_PRESETS", () => {
  it("uses calibrated default denominators for the Pro plan", () => {
    expect(PLAN_PRESETS.pro.sessionLimitTokens).toBe(27_500);
    expect(PLAN_PRESETS.pro.weeklyLimitTokens).toBe(325_000);
  });
});
