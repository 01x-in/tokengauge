import { type Dirent, promises as fs } from "node:fs";
import path from "node:path";

import { aggregateUsageSnapshot, type UsageRecord, type UsageSnapshot } from "./usage-aggregator";
import { getClaudeProjectDirectoryCandidates } from "./path-resolver";
import { parseUsageFile } from "./usage-parser";

export interface UsageFileDescriptor {
  path: string;
  mtimeMs: number;
  size: number;
}

export interface UsageSnapshotLoaderDependencies {
  listJsonlFiles: (roots: string[]) => Promise<UsageFileDescriptor[]>;
  readFile: (filePath: string) => Promise<string>;
}

export interface UsageSnapshotLoaderOptions {
  activeWorkspacePath: string | null;
  claudeConfigDir?: string | null;
  homeDir: string;
  now: string;
}

interface CachedUsageFile {
  mtimeMs: number;
  size: number;
  records: UsageRecord[];
}

export interface UsageSnapshotLoader {
  loadSnapshot: (options: UsageSnapshotLoaderOptions) => Promise<UsageSnapshot>;
}

export const createUsageSnapshotLoader = (
  dependencies: UsageSnapshotLoaderDependencies = {
    listJsonlFiles: listJsonlFilesFromFs,
    readFile: (filePath: string) => fs.readFile(filePath, "utf8")
  }
): UsageSnapshotLoader => {
  const cache = new Map<string, CachedUsageFile>();

  return {
    loadSnapshot: async (options: UsageSnapshotLoaderOptions): Promise<UsageSnapshot> => {
      const candidates = getClaudeProjectDirectoryCandidates({
        claudeConfigDir: options.claudeConfigDir,
        homeDir: options.homeDir
      });
      const files = await dependencies.listJsonlFiles(candidates);
      const seen = new Set<string>();
      const records: UsageRecord[] = [];

      for (const file of files) {
        seen.add(file.path);
        const cached = cache.get(file.path);

        if (cached && cached.mtimeMs === file.mtimeMs && cached.size === file.size) {
          records.push(...cached.records);
          continue;
        }

        try {
          const fileContent = await dependencies.readFile(file.path);
          const parsedRecords = parseUsageFile({
            fileContent,
            filePath: file.path
          }).records;
          cache.set(file.path, {
            mtimeMs: file.mtimeMs,
            size: file.size,
            records: parsedRecords
          });
          records.push(...parsedRecords);
        } catch {
          continue;
        }
      }

      for (const cachedPath of cache.keys()) {
        if (!seen.has(cachedPath)) {
          cache.delete(cachedPath);
        }
      }

      return aggregateUsageSnapshot({
        records,
        activeWorkspacePath: options.activeWorkspacePath,
        now: options.now
      });
    }
  };
};

const listJsonlFilesFromFs = async (roots: string[]): Promise<UsageFileDescriptor[]> => {
  const found: UsageFileDescriptor[] = [];

  for (const root of roots) {
    await walkDirectory(root, found);
  }

  return found.sort((left, right) => left.path.localeCompare(right.path));
};

const walkDirectory = async (
  directoryPath: string,
  found: UsageFileDescriptor[]
): Promise<void> => {
  let entries: Dirent<string>[];

  try {
    entries = await fs.readdir(directoryPath, {
      withFileTypes: true,
      encoding: "utf8"
    });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walkDirectory(entryPath, found);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".jsonl")) {
      continue;
    }

    try {
      const stats = await fs.stat(entryPath);
      found.push({
        path: entryPath,
        mtimeMs: stats.mtimeMs,
        size: stats.size
      });
    } catch {
      continue;
    }
  }
};
