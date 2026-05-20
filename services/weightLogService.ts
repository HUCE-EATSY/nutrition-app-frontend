import { apiClient } from "./apiClient";
import { WeightLogEntry, UserGoalApiResponse } from "@/constants/types/contracts";

/**
 * GET /api/logs/weight?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns weight log entries sorted ascending by date.
 */
export async function getWeightTimeline(from: string, to: string): Promise<WeightLogEntry[]> {
  const res = await apiClient.get("/api/logs/weight", { params: { from, to } });
  return res.data.data;
}

/**
 * GET /api/User/info — includes ActiveGoal with goal_weight_kg
 */
export async function getUserGoal(): Promise<UserGoalApiResponse | null> {
  try {
    const res = await apiClient.get("/api/User/info");
    // ActiveGoal is camelCase from .NET serialization default
    const goal = res.data.data?.ActiveGoal ?? res.data.data?.activeGoal;
    return goal ?? null;
  } catch {
    return null;
  }
}

/**
 * Create or update a weight log entry for a specific date (YYYY-MM-DD).
 */
export async function saveWeightLog(weightKg: number, dateISO: string, note?: string): Promise<WeightLogEntry> {
  // Query timeline for that specific day to see if there is an existing log
  const existingLogs = await getWeightTimeline(dateISO, dateISO);
  if (existingLogs && existingLogs.length > 0) {
    const existingLog = existingLogs[0];
    const res = await apiClient.put(`/api/logs/weight/${existingLog.id}`, {
      weight_kg: weightKg,
      note: note ?? existingLog.note,
    });
    return res.data.data;
  } else {
    const res = await apiClient.post("/api/logs/weight", {
      weight_kg: weightKg,
      log_date: dateISO,
      note,
    });
    return res.data.data;
  }
}

