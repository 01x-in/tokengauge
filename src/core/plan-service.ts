import { DEFAULT_PLAN, PLAN_PRESETS, type PlanKey, type PlanSettings } from "./plans";

export interface EnsurePlanSelectionOptions {
  storedPlan: PlanSettings | null;
  promptPreset: () => Promise<PlanKey | undefined>;
  promptCustomLimit: (
    kind: "session" | "weekly"
  ) => Promise<string | undefined>;
}

export const ensurePlanSelection = async (
  options: EnsurePlanSelectionOptions
): Promise<PlanSettings> => {
  if (isValidPlan(options.storedPlan)) {
    return options.storedPlan;
  }

  const selectedPlan = await options.promptPreset();
  if (!selectedPlan) {
    return DEFAULT_PLAN;
  }

  if (selectedPlan !== "custom") {
    return PLAN_PRESETS[selectedPlan];
  }

  const sessionLimitTokens = await promptPositiveInteger(
    options.promptCustomLimit,
    "session"
  );
  const weeklyLimitTokens = await promptPositiveInteger(
    options.promptCustomLimit,
    "weekly"
  );

  if (!sessionLimitTokens || !weeklyLimitTokens) {
    return DEFAULT_PLAN;
  }

  return {
    plan: "custom",
    sessionLimitTokens,
    weeklyLimitTokens
  };
};

const promptPositiveInteger = async (
  promptCustomLimit: EnsurePlanSelectionOptions["promptCustomLimit"],
  kind: "session" | "weekly"
): Promise<number | null> => {
  const value = await promptCustomLimit(kind);
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const isValidPlan = (value: PlanSettings | null): value is PlanSettings => {
  return (
    value !== null &&
    typeof value.sessionLimitTokens === "number" &&
    value.sessionLimitTokens > 0 &&
    typeof value.weeklyLimitTokens === "number" &&
    value.weeklyLimitTokens > 0
  );
};
