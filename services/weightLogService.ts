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
