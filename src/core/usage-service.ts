import type { UsageSnapshot } from "./usage-aggregator";
import {
  createUsageSnapshotLoader,
  type UsageSnapshotLoader
} from "./usage-loader";

export interface LoadUsageSnapshotOptions {
  activeWorkspacePath: string | null;
  claudeConfigDir?: string | null;
  homeDir: string;
  now: string;
}

const defaultLoader = createUsageSnapshotLoader();

export const loadUsageSnapshot = async (
  options: LoadUsageSnapshotOptions,
  loader: UsageSnapshotLoader = defaultLoader
): Promise<UsageSnapshot> => {
  return loader.loadSnapshot(options);
};
