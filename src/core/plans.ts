export type PlanKey = "pro" | "max5" | "max20" | "custom";

export interface PlanSettings {
  plan: PlanKey;
  sessionLimitTokens: number;
  weeklyLimitTokens: number;
}

export const DEFAULT_PLAN: PlanSettings = {
  plan: "pro",
  sessionLimitTokens: 27_500,
  weeklyLimitTokens: 325_000
};

export const PLAN_PRESETS: Record<Exclude<PlanKey, "custom">, PlanSettings> = {
  pro: DEFAULT_PLAN,
  max5: {
    plan: "max5",
    sessionLimitTokens: 55_000,
    weeklyLimitTokens: 650_000
  },
  max20: {
    plan: "max20",
    sessionLimitTokens: 137_500,
    weeklyLimitTokens: 1_625_000
  }
};
