import type { PlanSettings } from "./plans";
import type { UsageSnapshot } from "./usage-aggregator";

export type DisplayMode = "repo" | "session" | "weekly";

export interface BuildStatusBarPresentationOptions {
  mode: DisplayMode;
  snapshot: UsageSnapshot;
  plan: PlanSettings;
  now: string;
  weeklyTip?: string | null;
}

export interface StatusBarPresentation {
  text: string;
  tooltip: string;
  colorKey: string;
  activePercentage: number;
  activeLabel: string;
}

export const cycleDisplayMode = (mode: DisplayMode): DisplayMode => {
  if (mode === "repo") {
    return "session";
  }

  if (mode === "session") {
    return "weekly";
  }

  return "repo";
};

export const buildStatusBarPresentation = (
  options: BuildStatusBarPresentationOptions
): StatusBarPresentation => {
  const activeTier = getActiveTier(options);

  if (activeTier.tokens <= 0) {
    return {
      text: "◇ no data",
      tooltip: buildEmptyTooltip(),
      colorKey: "statusBarItem.warningForeground",
      activePercentage: 0,
      activeLabel: activeTier.label
    };
  }

  const percentage = getPercentage(activeTier.tokens, activeTier.limit);
  const resetLabel = formatResetCountdown(activeTier.resetAt, options.now);

  return {
    text: `◇ ${percentage.toFixed(1)}% · ${resetLabel}`,
    tooltip: buildTooltip(options),
    colorKey: getColorKey(percentage),
    activePercentage: percentage,
    activeLabel: activeTier.label
  };
};

const getActiveTier = (
  options: BuildStatusBarPresentationOptions
): {
  label: string;
  tokens: number;
  limit: number;
  resetAt: string | null;
} => {
  switch (options.mode) {
    case "repo":
      return {
        label: "Repo",
        tokens: options.snapshot.repoSessionConsumed,
        limit: options.plan.sessionLimitTokens,
        resetAt: options.snapshot.repoSessionResetAt
      };
    case "session":
      return {
        label: "5hr",
        tokens: options.snapshot.session5hConsumed,
        limit: options.plan.sessionLimitTokens,
        resetAt: options.snapshot.session5hResetAt
      };
    case "weekly":
      return {
        label: "Weekly",
        tokens: options.snapshot.weeklyConsumed,
        limit: options.plan.weeklyLimitTokens,
        resetAt: options.snapshot.weeklyResetAt
      };
  }
};

const buildEmptyTooltip = (): string => {
  return [
    "TokenGauge",
    "",
    "No Claude Code usage data found yet.",
    "Open a Claude Code project and start a session."
  ].join("\n");
};

const buildTooltip = (options: BuildStatusBarPresentationOptions): string => {
  const rows = [
    buildTierRow(
      "Repo",
      options.snapshot.repoSessionConsumed,
      options.plan.sessionLimitTokens,
      options.snapshot.repoSessionResetAt,
      options.now
    ),
    buildTierRow(
      "5hr",
      options.snapshot.session5hConsumed,
      options.plan.sessionLimitTokens,
      options.snapshot.session5hResetAt,
      options.now
    ),
    buildTierRow(
      "Weekly",
      options.snapshot.weeklyConsumed,
      options.plan.weeklyLimitTokens,
      options.snapshot.weeklyResetAt,
      options.now
    )
  ];
  const footer = options.weeklyTip ? ["", `Tip: ${options.weeklyTip}`] : [];

  return ["TokenGauge", "", ...rows, ...footer].join("\n");
};

const buildTierRow = (
  label: string,
  tokens: number,
  limit: number,
  resetAt: string | null,
  now: string
): string => {
  const compactLabel = label.padEnd(6, " ");
  const compactTokens = formatCompactTokens(tokens).padStart(6, " ");
  const percentage = `${getPercentage(tokens, limit).toFixed(1)}%`.padStart(6, " ");
  const reset = formatResetCountdown(resetAt, now).padStart(7, " ");

  return `${compactLabel}${compactTokens}${percentage}${reset}`;
};

const formatCompactTokens = (tokens: number): string => {
  if (tokens >= 100_000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }

  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }

  return `${tokens}`;
};

const formatResetCountdown = (resetAt: string | null, now: string): string => {
  if (!resetAt) {
    return "n/a";
  }

  const diffMs = Math.max(0, Date.parse(resetAt) - Date.parse(now));
  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const getPercentage = (tokens: number, limit: number): number => {
  if (limit <= 0) {
    return 0;
  }

  return (tokens / limit) * 100;
};

const getColorKey = (percentage: number): string => {
  if (percentage >= 95) {
    return "statusBarItem.errorForeground";
  }

  if (percentage >= 85) {
    return "statusBarItem.errorForeground";
  }

  if (percentage >= 70) {
    return "statusBarItem.warningForeground";
  }

  return "statusBarItem.foreground";
};
