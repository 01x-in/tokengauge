import { describe, expect, it } from "vitest";

import { createUsageSnapshotLoader } from "../../src/core/usage-loader";

describe("createUsageSnapshotLoader", () => {
  it("reuses cached parsed records when file metadata is unchanged", async () => {
    let readCount = 0;
    const loader = createUsageSnapshotLoader({
      listJsonlFiles: async () => [
        {
          path: "/tmp/session.jsonl",
          mtimeMs: 100,
          size: 200
        }
      ],
      readFile: async () => {
        readCount += 1;
        return JSON.stringify({
          timestamp: "2026-03-28T11:00:00.000Z",
          cwd: "/Users/tester/work/tokengauge",
          usage: {
            input_tokens: 10,
            output_tokens: 5,
            cache_creation_input_tokens: 0,
            cache_read_input_tokens: 0
          }
        });
      }
    });

    const first = await loader.loadSnapshot({
      activeWorkspacePath: "/Users/tester/work/tokengauge",
      claudeConfigDir: null,
      homeDir: "/Users/tester",
      now: "2026-03-28T12:00:00.000Z"
    });
    const second = await loader.loadSnapshot({
      activeWorkspacePath: "/Users/tester/work/tokengauge",
      claudeConfigDir: null,
      homeDir: "/Users/tester",
      now: "2026-03-28T12:30:00.000Z"
    });

    expect(readCount).toBe(1);
    expect(first.repoSessionConsumed).toBe(15);
    expect(second.repoSessionConsumed).toBe(15);
  });

  it("ignores subagent files and de-duplicates repeated request usage", async () => {
    const loader = createUsageSnapshotLoader({
      listJsonlFiles: async () => [
        {
          path: "/tmp/main/session.jsonl",
          mtimeMs: 100,
          size: 200
        },
        {
          path: "/tmp/main/subagents/agent-1.jsonl",
          mtimeMs: 100,
          size: 200
        }
      ],
      readFile: async (filePath) => {
        if (filePath.includes("/subagents/")) {
          return JSON.stringify({
            type: "assistant",
            timestamp: "2026-03-28T11:10:00.000Z",
            requestId: "subagent-1",
            cwd: "/Users/tester/work/tokengauge",
            message: {
              usage: {
                input_tokens: 999,
                output_tokens: 999,
                cache_creation_input_tokens: 999,
                cache_read_input_tokens: 999
              }
            }
          });
        }

        return [
          JSON.stringify({
            type: "assistant",
            timestamp: "2026-03-28T11:00:00.000Z",
            requestId: "req-1",
            cwd: "/Users/tester/work/tokengauge",
            message: {
              usage: {
                input_tokens: 100,
                output_tokens: 40,
                cache_creation_input_tokens: 2000,
                cache_read_input_tokens: 5000
              }
            }
          }),
          JSON.stringify({
            type: "assistant",
            timestamp: "2026-03-28T11:00:01.000Z",
            requestId: "req-1",
            cwd: "/Users/tester/work/tokengauge",
            message: {
              usage: {
                input_tokens: 100,
                output_tokens: 40,
                cache_creation_input_tokens: 2000,
                cache_read_input_tokens: 5000
              }
            }
          })
        ].join("\n");
      }
    });

    const snapshot = await loader.loadSnapshot({
      activeWorkspacePath: "/Users/tester/work/tokengauge",
      claudeConfigDir: null,
      homeDir: "/Users/tester",
      now: "2026-03-28T12:00:00.000Z"
    });

    expect(snapshot.repoSessionConsumed).toBe(140);
    expect(snapshot.session5hConsumed).toBe(140);
  });
});
