export const WEEKLY_TIPS: string[] = [
  "Reuse the same Codex session for a feature instead of restarting context.",
  "Ask for the smallest possible diff before broad refactors.",
  "Give file paths and exact errors up front to reduce back-and-forth.",
  "Batch related edits into one request instead of drip-feeding changes.",
  "Use failing tests as the handoff artifact for bug fixes.",
  "Trim logs to the relevant stack frames before pasting them in.",
  "Call out constraints early: no new deps, no schema changes, no UI churn.",
  "Prefer concrete acceptance criteria over vague quality goals.",
  "Let the agent inspect the codebase before proposing architecture changes.",
  "Keep prompts scoped to one story when you want predictable diffs.",
  "Ask for verification commands, not just code changes.",
  "Paste the exact command output when something fails unexpectedly.",
  "Pin the target files when you want a minimal review surface.",
  "Use repo-local examples to guide style instead of describing style abstractly.",
  "Separate bug fixes from polish so the agent can optimize for one goal.",
  "Say what must not change alongside what should change.",
  "Mention whether existing user edits may be present in the worktree.",
  "Prefer reproduction steps over long symptom descriptions.",
  "Ask for a checkpoint commit when a story goes green.",
  "Use one branch per milestone to keep PR review focused.",
  "Have the agent summarize deltas instead of full file dumps.",
  "When a test is flaky, ask for root-cause analysis before retries.",
  "Keep generated docs aligned with the code or delete them quickly.",
  "Call out sandbox or network constraints before installation work starts.",
  "Provide sample data that matches production shape, not toy placeholders.",
  "Use strict types to surface integration mistakes earlier.",
  "Ask the agent to preserve user changes explicitly when the tree is dirty.",
  "Run the narrowest test target first, then the full suite.",
  "Prefer native platform APIs when the product surface is small.",
  "If packaging matters, test packaging before the final polish pass.",
  "Use percentage-based alerts only when the denominator is trustworthy.",
  "Cache file metadata when polling local logs repeatedly.",
  "Treat partially written JSONL as normal, not exceptional.",
  "Make empty states calm and factual instead of noisy.",
  "Separate display formatting from data loading for easier testing.",
  "Use command IDs intentionally so keyboard users can invoke features too.",
  "Keep tooltips monospace-friendly when they show dense operational data.",
  "Use one-time warnings for thresholds; repeated noise trains users to ignore them.",
  "Store lightweight preferences in editor state instead of inventing a config file.",
  "When a workflow has gates, be explicit when you are bypassing them.",
  "Prefer additive commits over one giant final dump.",
  "Let tests define the contract before adding extension-host behavior.",
  "Choose weekly rotation over random tips so the UI feels stable.",
  "Avoid webviews when a status bar and native notifications are enough.",
  "Treat local developer tools like operational software: clear, terse, reliable.",
  "Use workspace path matching carefully when multiple repos are open.",
  "Favor compile-safe helpers for time math instead of ad hoc date strings.",
  "Keep package size low by avoiding runtime dependencies where native APIs work.",
  "Ask for current branch and git status before touching milestone work.",
  "Push story checkpoints remotely if the user wants visible progress.",
  "When plan limits are uncertain, make them configurable instead of hardcoding guesses.",
  "Ship the useful slice first, then layer polish once the signal is trustworthy."
];

export interface GetWeeklyTipOptions {
  now: string;
  tips?: string[];
}

export const getWeeklyTip = (options: GetWeeklyTipOptions): string | null => {
  const tips = options.tips ?? WEEKLY_TIPS;
  if (tips.length === 0) {
    return null;
  }

  const weekIndex = Math.floor(getWeekFloorUtcMs(Date.parse(options.now)) / (7 * 24 * 60 * 60 * 1000));

  return tips[((weekIndex % tips.length) + tips.length) % tips.length] ?? null;
};

const getWeekFloorUtcMs = (nowMs: number): number => {
  const now = new Date(nowMs);
  const utcDay = now.getUTCDay();
  const distanceFromMonday = utcDay === 0 ? 6 : utcDay - 1;
  const weekFloor = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0,
    0,
    0,
    0
  );

  return weekFloor - distanceFromMonday * 24 * 60 * 60 * 1000;
};
