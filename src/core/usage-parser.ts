import path from "node:path";

import type { UsageRecord } from "./usage-aggregator";

export interface ParseUsageFileOptions {
  fileContent: string;
  filePath: string;
}

export interface ParseUsageFileResult {
  records: UsageRecord[];
  skippedLineCount: number;
}

interface RawUsagePayload {
  input_tokens?: unknown;
  output_tokens?: unknown;
  cache_creation_input_tokens?: unknown;
  cache_read_input_tokens?: unknown;
}

export const parseUsageFile = (
  options: ParseUsageFileOptions
): ParseUsageFileResult => {
  const records: UsageRecord[] = [];
  let skippedLineCount = 0;

  for (const line of options.fileContent.split(/\r?\n/u)) {
    if (!line.trim()) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      const record = toUsageRecord(parsed, options.filePath);

      if (record) {
        records.push(record);
      } else {
        skippedLineCount += 1;
      }
    } catch {
      skippedLineCount += 1;
    }
  }

  return { records, skippedLineCount };
};

const toUsageRecord = (
  parsed: Record<string, unknown>,
  filePath: string
): UsageRecord | null => {
  const usagePayload = findUsagePayload(parsed);
  const timestamp = findTimestamp(parsed);

  if (!usagePayload || !timestamp) {
    return null;
  }

  const inputTokens = toTokenNumber(usagePayload.input_tokens);
  const outputTokens = toTokenNumber(usagePayload.output_tokens);
  const cacheCreationInputTokens = toTokenNumber(
    usagePayload.cache_creation_input_tokens
  );
  const cacheReadInputTokens = toTokenNumber(usagePayload.cache_read_input_tokens);

  return {
    timestamp,
    workspacePath: findWorkspacePath(parsed) ?? deriveWorkspacePathFromFile(filePath),
    sourceFile: filePath,
    requestKey: findRequestKey(parsed),
    inputTokens,
    outputTokens,
    cacheCreationInputTokens,
    cacheReadInputTokens,
    totalTokens: inputTokens + outputTokens
  };
};

const findUsagePayload = (value: unknown): RawUsagePayload | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    "input_tokens" in value ||
    "output_tokens" in value ||
    "cache_creation_input_tokens" in value ||
    "cache_read_input_tokens" in value
  ) {
    return value as RawUsagePayload;
  }

  for (const child of Object.values(value)) {
    const match = findUsagePayload(child);
    if (match) {
      return match;
    }
  }

  return null;
};

const findTimestamp = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of ["timestamp", "created_at", "createdAt", "time"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && !Number.isNaN(Date.parse(candidate))) {
      return new Date(candidate).toISOString();
    }
  }

  for (const child of Object.values(value)) {
    const match = findTimestamp(child);
    if (match) {
      return match;
    }
  }

  return null;
};

const findWorkspacePath = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of ["cwd", "workspacePath", "projectPath", "project_path"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.startsWith("/")) {
      return candidate;
    }
  }

  for (const child of Object.values(value)) {
    const match = findWorkspacePath(child);
    if (match) {
      return match;
    }
  }

  return null;
};

const findRequestKey = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  for (const key of ["requestId", "id", "uuid"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  const message = value.message;
  if (isRecord(message)) {
    const messageId = message.id;
    if (typeof messageId === "string" && messageId.length > 0) {
      return messageId;
    }
  }

  return null;
};

const deriveWorkspacePathFromFile = (filePath: string): string | null => {
  const projectsIndex = filePath.lastIndexOf(`${path.sep}projects${path.sep}`);
  if (projectsIndex === -1) {
    return null;
  }

  const relative = filePath.slice(projectsIndex + `${path.sep}projects${path.sep}`.length);
  const firstSegment = relative.split(path.sep)[0];

  if (!firstSegment) {
    return null;
  }

  return firstSegment.replace(/-/gu, path.sep);
};

const toTokenNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
