import { type Dirent, promises as fs } from "node:fs";
import path from "node:path";

import {
  aggregateUsageSnapshot,
  type UsageRecord,
  type UsageSnapshot
} from "./usage-aggregator";
import { getClaudeProjectDirectoryCandidates } from "./path-resolver";
import { parseUsageFile } from "./usage-parser";

export interface LoadUsageSnapshotOptions {
  activeWorkspacePath: string | null;
  claudeConfigDir?: string | null;
  homeDir: string;
  now: string;
}

export const loadUsageSnapshot = async (
  options: LoadUsageSnapshotOptions
): Promise<UsageSnapshot> => {
  const candidates = getClaudeProjectDirectoryCandidates({
    claudeConfigDir: options.claudeConfigDir,
    homeDir: options.homeDir
  });
  const filePaths = await findJsonlFiles(candidates);
  const records: UsageRecord[] = [];

  for (const filePath of filePaths) {
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      records.push(...loadParsedRecords(fileContent, filePath));
    } catch {
      continue;
    }
  }

  return aggregateUsageSnapshot({
    records,
    activeWorkspacePath: options.activeWorkspacePath,
    now: options.now
  });
};

const findJsonlFiles = async (roots: string[]): Promise<string[]> => {
  const found = new Set<string>();

  for (const root of roots) {
    await walkDirectory(root, found);
  }

  return Array.from(found).sort();
};

const walkDirectory = async (directoryPath: string, found: Set<string>): Promise<void> => {
  let entries: Dirent[];

  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(entryPath, found);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      found.add(entryPath);
    }
  }
};

const loadParsedRecords = (fileContent: string, filePath: string): UsageRecord[] => {
  return parseUsageFile({ fileContent, filePath }).records;
};
