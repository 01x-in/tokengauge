import os from "node:os";

import * as vscode from "vscode";

import {
  evaluateAlertState,
  type AlertState,
  type AlertThresholds
} from "./core/alert-manager";
import { ensurePlanSelection } from "./core/plan-service";
import { type PlanKey } from "./core/plans";
import {
  buildStatusBarPresentation,
  cycleDisplayMode,
  type DisplayMode
} from "./core/status-bar-presentation";
import { loadUsageSnapshot } from "./core/usage-service";
import { getWeeklyTip } from "./core/weekly-tip";

const DISPLAY_MODE_KEY = "tokengauge.displayMode";
const PLAN_SETTINGS_KEY = "tokengauge.planSettings";
const ALERT_STATE_KEY = "tokengauge.alertState";
const POLL_INTERVAL_MS = 30_000;
const SESSION_SNOOZE_MS = 12 * 60 * 60 * 1000;

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    50
  );
  let displayMode = context.globalState.get<DisplayMode>(DISPLAY_MODE_KEY, "repo");
  let alertState = context.globalState.get<AlertState>(ALERT_STATE_KEY, {
    lastNotifiedThresholds: [],
    snoozedUntil: null,
    sessionKey: ""
  });
  let previousPercentage: number | null = null;
  let plan = await ensurePlanSelection({
    storedPlan: context.globalState.get(PLAN_SETTINGS_KEY, null),
    promptPreset: () => promptForPlanPreset(),
    promptCustomLimit: (kind) => promptForCustomLimit(kind)
  });

  await context.globalState.update(PLAN_SETTINGS_KEY, plan);

  statusBarItem.command = "tokengauge.cycleDisplayMode";
  statusBarItem.show();

  const refresh = async (): Promise<void> => {
    const now = new Date().toISOString();
    const snapshot = await loadUsageSnapshot({
      activeWorkspacePath: getActiveWorkspacePath(),
      claudeConfigDir: process.env.CLAUDE_CONFIG_DIR,
      homeDir: os.homedir(),
      now
    });
    const presentation = buildStatusBarPresentation({
      mode: displayMode,
      snapshot,
      plan,
      now,
      weeklyTip: getWeeklyTip({ now })
    });
    const sessionKey = `${displayMode}:${getActiveWorkspacePath() ?? "no-workspace"}:${
      snapshot.session5hResetAt ?? snapshot.weeklyResetAt
    }`;
    const evaluatedAlerts = evaluateAlertState({
      previousPercentage,
      currentPercentage: presentation.activePercentage,
      state: alertState,
      thresholds: getAlertThresholds(),
      sessionKey,
      now
    });

    statusBarItem.text = presentation.text;
    statusBarItem.tooltip = presentation.tooltip;
    statusBarItem.color = new vscode.ThemeColor(presentation.colorKey);

    previousPercentage = presentation.activePercentage;
    alertState = evaluatedAlerts.state;
    await context.globalState.update(ALERT_STATE_KEY, alertState);

    for (const threshold of evaluatedAlerts.notifications) {
      void vscode.window.showWarningMessage(
        `${presentation.activeLabel} usage crossed ${threshold.toFixed(0)}%.`,
        "Snooze"
      ).then(async (selection) => {
        if (selection === "Snooze") {
          alertState = {
            ...alertState,
            snoozedUntil: new Date(Date.parse(now) + SESSION_SNOOZE_MS).toISOString()
          };
          await context.globalState.update(ALERT_STATE_KEY, alertState);
        }
      });
    }
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
      plan = await ensurePlanSelection({
        storedPlan: null,
        promptPreset: () => promptForPlanPreset(),
        promptCustomLimit: (kind) => promptForCustomLimit(kind)
      });
      await context.globalState.update(PLAN_SETTINGS_KEY, plan);
      await refresh();
    }),
    vscode.commands.registerCommand("tokengauge.snoozeAlerts", async () => {
      alertState = {
        ...alertState,
        snoozedUntil: new Date(Date.now() + SESSION_SNOOZE_MS).toISOString()
      };
      await context.globalState.update(ALERT_STATE_KEY, alertState);
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

const getAlertThresholds = (): AlertThresholds => {
  const configuration = vscode.workspace.getConfiguration("tokengauge");

  return {
    warning: configuration.get<number>("thresholds.warning", 70),
    critical: configuration.get<number>("thresholds.critical", 85),
    panic: configuration.get<number>("thresholds.panic", 95)
  };
};

const promptForPlanPreset = async (): Promise<PlanKey | undefined> => {
  const selection = await vscode.window.showQuickPick(
    [
      { label: "Pro", value: "pro" as const },
      { label: "Max5", value: "max5" as const },
      { label: "Max20", value: "max20" as const },
      { label: "Custom", value: "custom" as const }
    ],
    {
      title: "Choose your Claude plan",
      placeHolder: "TokenGauge needs plan limits to compute percentages."
    }
  );

  return selection?.value;
};

const promptForCustomLimit = async (
  kind: "session" | "weekly"
): Promise<string | undefined> => {
  return vscode.window.showInputBox({
    title: `Custom ${kind} token limit`,
    placeHolder: kind === "session" ? "44000" : "220000",
    validateInput: (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0
        ? null
        : "Enter a positive integer token limit.";
    }
  });
};
