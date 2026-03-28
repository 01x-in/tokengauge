export interface UsageRecord {
  timestamp: string;
  workspacePath: string | null;
  sourceFile: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  totalTokens: number;
}

export interface UsageSnapshot {
  repoSessionConsumed: number;
  session5hConsumed: number;
  weeklyConsumed: number;
  repoSessionResetAt: string | null;
  session5hResetAt: string | null;
  weeklyResetAt: string;
  sourceFiles: string[];
  generatedAt: string;
}

export interface AggregateUsageSnapshotOptions {
  records: UsageRecord[];
  activeWorkspacePath: string | null;
  now: string;
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const aggregateUsageSnapshot = (
  options: AggregateUsageSnapshotOptions
): UsageSnapshot => {
  const nowMs = Date.parse(options.now);
  const sessionFloorMs = nowMs - FIVE_HOURS_MS;
  const weekFloorMs = getWeekFloorUtcMs(nowMs);
  const sessionRecords = options.records.filter((record) => {
    const recordMs = Date.parse(record.timestamp);
    return Number.isFinite(recordMs) && recordMs >= sessionFloorMs && recordMs <= nowMs;
  });
  const weeklyRecords = options.records.filter((record) => {
    const recordMs = Date.parse(record.timestamp);
    return Number.isFinite(recordMs) && recordMs >= weekFloorMs && recordMs <= nowMs;
  });
  const repoRecords = options.activeWorkspacePath
    ? sessionRecords.filter(
        (record) => record.workspacePath === options.activeWorkspacePath
      )
    : [];

  return {
    repoSessionConsumed: sumTokens(repoRecords),
    session5hConsumed: sumTokens(sessionRecords),
    weeklyConsumed: sumTokens(weeklyRecords),
    repoSessionResetAt: getResetAt(repoRecords),
    session5hResetAt: getResetAt(sessionRecords),
    weeklyResetAt: new Date(weekFloorMs + 7 * ONE_DAY_MS).toISOString(),
    sourceFiles: uniqueSourceFiles(weeklyRecords),
    generatedAt: new Date(nowMs).toISOString()
  };
};

const sumTokens = (records: UsageRecord[]): number => {
  return records.reduce((total, record) => total + record.totalTokens, 0);
};

const getResetAt = (records: UsageRecord[]): string | null => {
  if (records.length === 0) {
    return null;
  }

  const latestRecord = records.reduce((latest, record) =>
    Date.parse(record.timestamp) > Date.parse(latest.timestamp) ? record : latest
  );

  return new Date(Date.parse(latestRecord.timestamp) + FIVE_HOURS_MS).toISOString();
};

const uniqueSourceFiles = (records: UsageRecord[]): string[] => {
  return Array.from(new Set(records.map((record) => record.sourceFile))).sort();
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

  return weekFloor - distanceFromMonday * ONE_DAY_MS;
};
