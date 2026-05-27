import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";
import { StepLogEntry } from "@/types/contracts";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

let mockStepLogs: StepLogEntry[] = [];

/**
 * GET /api/logs/steps?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns steps log entries sorted ascending by date.
 */
export async function getStepsTimeline(from: string, to: string): Promise<StepLogEntry[]> {
  if (USE_MOCK) {
    return mockStepLogs.filter(log => log.log_date >= from && log.log_date <= to);
  }
  const res = await apiClient.get(API_URLS.logs.steps, { params: { from, to } });
  return res.data.data ?? [];
}

/**
 * Create or update a step log entry.
 * POST /api/logs/steps
 */
export async function saveStepLog(
  steps: number,
  stepGoal: number,
  dateISO: string,
  provider: number,
  caloriesBurnedKcal?: number
): Promise<StepLogEntry> {
  const reqPayload = {
    steps,
    step_goal: stepGoal,
    log_date: dateISO,
    provider,
    calories_burned_kcal: caloriesBurnedKcal ?? Math.round(steps * 0.04),
  };

  if (USE_MOCK) {
    const existingIdx = mockStepLogs.findIndex(log => log.log_date === dateISO);
    const mockEntry: StepLogEntry = {
      id: existingIdx !== -1 ? mockStepLogs[existingIdx].id : Math.floor(Math.random() * 100000),
      log_date: dateISO,
      steps,
      step_goal: stepGoal,
      provider,
      calories_burned_kcal: reqPayload.calories_burned_kcal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      mockStepLogs[existingIdx] = mockEntry;
    } else {
      mockStepLogs.push(mockEntry);
    }
    return mockEntry;
  }

  const res = await apiClient.post(API_URLS.logs.steps, reqPayload);
  return res.data.data;
}
