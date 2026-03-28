import { describe, expect, it } from "vitest";

import { getClaudeProjectDirectoryCandidates } from "../../src/core/path-resolver";

describe("getClaudeProjectDirectoryCandidates", () => {
  it("prefers CLAUDE_CONFIG_DIR before default project directories", () => {
    const candidates = getClaudeProjectDirectoryCandidates({
      claudeConfigDir: "/tmp/claude",
      homeDir: "/Users/tester"
    });

    expect(candidates).toEqual([
      "/tmp/claude/projects",
      "/Users/tester/.claude/projects",
      "/Users/tester/.config/claude/projects"
    ]);
  });

  it("keeps an explicit projects directory intact", () => {
    const candidates = getClaudeProjectDirectoryCandidates({
      claudeConfigDir: "/tmp/projects",
      homeDir: "/Users/tester"
    });

    expect(candidates[0]).toBe("/tmp/projects");
  });
});
