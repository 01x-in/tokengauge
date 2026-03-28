import os from "node:os";

import * as vscode from "vscode";

import { DEFAULT_PLAN } from "./core/plans";
import {
  buildStatusBarPresentation,
  cycleDisplayMode,
  type DisplayMode
} from "./core/status-bar-presentation";
import { loadUsageSnapshot } from "./core/usage-service";

const DISPLAY_MODE_KEY = "tokengauge.displayMode";
const POLL_INTERVAL_MS = 30_000;

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    50
  );
  let displayMode = context.globalState.get<DisplayMode>(DISPLAY_MODE_KEY, "repo");

  statusBarItem.command = "tokengauge.cycleDisplayMode";
  statusBarItem.show();

  const refresh = async (): Promise<void> => {
    const snapshot = await loadUsageSnapshot({
      activeWorkspacePath: getActiveWorkspacePath(),
      claudeConfigDir: process.env.CLAUDE_CONFIG_DIR,
      homeDir: os.homedir(),
      now: new Date().toISOString()
    });
    const presentation = buildStatusBarPresentation({
      mode: displayMode,
      snapshot,
      plan: DEFAULT_PLAN,
      now: new Date().toISOString()
    });

    statusBarItem.text = presentation.text;
    statusBarItem.tooltip = presentation.tooltip;
    statusBarItem.color = new vscode.ThemeColor(presentation.colorKey);
  };

  context.subscriptions.push(
    statusBarItem,
    vscode.commands.registerCommand("tokengauge.cycleDisplayMode", async () => {
      displayMode = cycleDisplayMode(displayMode);
      await context.globalState.update(DISPLAY_MODE_KEY, displayMode);
      await refresh();
    }),
    vscode.commands.registerCommand("tokengauge.refreshUsage", refresh),
    vscode.commands.registerCommand("tokengauge.selectPlan", async () => {
      void vscode.window.showInformationMessage(
        "Plan selection arrives in the next story."
      );
    }),
    vscode.commands.registerCommand("tokengauge.snoozeAlerts", async () => {
      void vscode.window.showInformationMessage(
        "Alert snoozing arrives in the next story."
      );
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      void refresh();
    })
  );

  const timer = setInterval(() => {
    void refresh();
  }, POLL_INTERVAL_MS);

  context.subscriptions.push({
    dispose: (): void => {
      clearInterval(timer);
    }
  });

  await refresh();
};

export const deactivate = (): void => undefined;

const getActiveWorkspacePath = (): string | null => {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
};
