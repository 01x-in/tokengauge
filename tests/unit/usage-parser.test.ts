import { describe, expect, it } from "vitest";

import { parseUsageFile } from "../../src/core/usage-parser";

describe("parseUsageFile", () => {
  it("parses valid usage records and skips corrupted lines", () => {
    const jsonl = [
      JSON.stringify({
        timestamp: "2026-03-28T09:00:00.000Z",
        cwd: "/Users/tester/work/tokengauge",
        message: {
          usage: {
            input_tokens: 100,
            output_tokens: 50,
            cache_creation_input_tokens: 10,
            cache_read_input_tokens: 5
          }
        }
      }),
      "{bad json",
      JSON.stringify({
        timestamp: "2026-03-28T10:00:00.000Z",
        cwd: "/Users/tester/work/tokengauge",
        usage: {
          input_tokens: 200,
          output_tokens: 25,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 20
        }
      })
    ].join("\n");

    const result = parseUsageFile({
      fileContent: jsonl,
      filePath: "/Users/tester/.claude/projects/tokengauge/session.jsonl"
    });

    expect(result.records).toHaveLength(2);
    expect(result.skippedLineCount).toBe(1);
    expect(result.records[0]).toMatchObject({
      workspacePath: "/Users/tester/work/tokengauge",
      totalTokens: 165
    });
    expect(result.records[1]).toMatchObject({
      totalTokens: 245
    });
  });
});
