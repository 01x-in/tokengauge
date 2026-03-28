import { describe, expect, it, vi } from "vitest";

import { DEFAULT_PLAN } from "../../src/core/plans";
import { ensurePlanSelection } from "../../src/core/plan-service";

describe("ensurePlanSelection", () => {
  it("returns the stored plan without prompting when state is valid", async () => {
    const promptPreset = vi.fn();
    const promptCustomLimit = vi.fn();

    const plan = await ensurePlanSelection({
      storedPlan: {
        plan: "max5",
        sessionLimitTokens: 88_000,
        weeklyLimitTokens: 440_000
      },
      promptPreset,
      promptCustomLimit
    });

    expect(plan).toEqual({
      plan: "max5",
      sessionLimitTokens: 88_000,
      weeklyLimitTokens: 440_000
    });
    expect(promptPreset).not.toHaveBeenCalled();
    expect(promptCustomLimit).not.toHaveBeenCalled();
  });

  it("collects custom limits when the user selects the custom plan", async () => {
    const plan = await ensurePlanSelection({
      storedPlan: null,
      promptPreset: vi.fn().mockResolvedValue("custom"),
      promptCustomLimit: vi
        .fn()
        .mockResolvedValueOnce("12345")
        .mockResolvedValueOnce("45678")
    });

    expect(plan).toEqual({
      plan: "custom",
      sessionLimitTokens: 12_345,
      weeklyLimitTokens: 45_678
    });
  });

  it("falls back to the default plan when selection is canceled", async () => {
    const plan = await ensurePlanSelection({
      storedPlan: null,
      promptPreset: vi.fn().mockResolvedValue(undefined),
      promptCustomLimit: vi.fn()
    });

    expect(plan).toEqual(DEFAULT_PLAN);
  });
});
