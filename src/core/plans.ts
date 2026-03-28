export type PlanKey = "pro" | "max5" | "max20" | "custom";

export interface PlanSettings {
  plan: PlanKey;
  sessionLimitTokens: number;
  weeklyLimitTokens: number;
}

export const DEFAULT_PLAN: PlanSettings = {
  plan: "pro",
  sessionLimitTokens: 44_000,
  weeklyLimitTokens: 220_000
};

export const PLAN_PRESETS: Record<Exclude<PlanKey, "custom">, PlanSettings> = {
  pro: DEFAULT_PLAN,
  max5: {
    plan: "max5",
    sessionLimitTokens: 88_000,
    weeklyLimitTokens: 440_000
  },
  max20: {
    plan: "max20",
    sessionLimitTokens: 220_000,
    weeklyLimitTokens: 1_100_000
  }
};
