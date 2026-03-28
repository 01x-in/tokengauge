# TokenGauge

TokenGauge is a VS Code extension that shows Claude Code token usage in the status bar so you can see repo, 5-hour, and weekly budget pressure without leaving the editor.

## What’s Implemented

- Local Claude usage discovery via `CLAUDE_CONFIG_DIR`, `~/.claude/projects`, and `~/.config/claude/projects`
- JSONL parsing with corrupted-line tolerance
- Repo, 5-hour, and weekly aggregation
- Status bar mode cycling
- Fixed-width tooltip summary with weekly rotating tip
- First-run plan selection for `Pro`, `Max5`, `Max20`, or `Custom`
- Configurable threshold alerts with per-session snooze
- Cached polling loader to avoid reparsing unchanged files

## Dev Commands

```bash
npm install
npm test
npm run build
npm run package:vsix
```

## Local Testing

1. Run `npm install`
2. Run `npm run build`
3. Install `tokengauge-0.1.0.vsix` in VS Code
4. Open a workspace that has Claude Code logs available locally
5. Use the status bar item or the `TokenGauge:*` commands from the command palette

## Codex Workflow Notes

The repo still keeps the original `agent_docs/` planning documents and `.claude/agents/` prompts from the `create-01x-project` scaffold, but the product is now built and the implementation no longer depends on Claude-specific human gates. Codex can use the planning docs as context while iterating directly on the extension.
