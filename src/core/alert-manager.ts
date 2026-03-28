export interface AlertThresholds {
  warning: number;
  critical: number;
  panic: number;
}

export interface AlertState {
  lastNotifiedThresholds: string[];
  snoozedUntil: string | null;
  sessionKey: string;
}

export interface EvaluateAlertStateOptions {
  previousPercentage: number | null;
  currentPercentage: number;
  state: AlertState;
  thresholds: AlertThresholds;
  sessionKey: string;
  now: string;
}

export interface EvaluateAlertStateResult {
  notifications: number[];
  state: AlertState;
}

export const evaluateAlertState = (
  options: EvaluateAlertStateOptions
): EvaluateAlertStateResult => {
  const state =
    options.state.sessionKey === options.sessionKey
      ? options.state
      : {
          lastNotifiedThresholds: [],
          snoozedUntil: null,
          sessionKey: options.sessionKey
        };

  if (state.snoozedUntil && Date.parse(state.snoozedUntil) > Date.parse(options.now)) {
    return { notifications: [], state };
  }

  const notifications: number[] = [];
  const knownThresholds = new Set(state.lastNotifiedThresholds);
  const previous = options.previousPercentage ?? 0;

  for (const threshold of [
    options.thresholds.warning,
    options.thresholds.critical,
    options.thresholds.panic
  ]) {
    const thresholdKey = `${threshold}`;
    if (
      previous < threshold &&
      options.currentPercentage >= threshold &&
      !knownThresholds.has(thresholdKey)
    ) {
      notifications.push(threshold);
      knownThresholds.add(thresholdKey);
    }
  }

  return {
    notifications,
    state: {
      lastNotifiedThresholds: Array.from(knownThresholds),
      snoozedUntil: state.snoozedUntil,
      sessionKey: options.sessionKey
    }
  };
};
