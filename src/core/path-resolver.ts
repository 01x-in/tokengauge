import path from "node:path";

export interface ClaudeDirectoryCandidateOptions {
  claudeConfigDir?: string | null;
  homeDir: string;
}

export const getClaudeProjectDirectoryCandidates = (
  options: ClaudeDirectoryCandidateOptions
): string[] => {
  const candidates = new Set<string>();

  if (options.claudeConfigDir) {
    candidates.add(normalizeProjectsDirectory(options.claudeConfigDir));
  }

  candidates.add(path.join(options.homeDir, ".claude", "projects"));
  candidates.add(path.join(options.homeDir, ".config", "claude", "projects"));

  return Array.from(candidates);
};

const normalizeProjectsDirectory = (claudeConfigDir: string): string => {
  return path.basename(claudeConfigDir) === "projects"
    ? claudeConfigDir
    : path.join(claudeConfigDir, "projects");
};
