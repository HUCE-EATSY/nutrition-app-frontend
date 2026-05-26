import { apiClient } from "./apiClient";
import { WeightLogEntry, UserGoalApiResponse } from "@/types/contracts";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

let mockWeightLogs: WeightLogEntry[] = [
  {
    id: 1,
    weight_kg: 75.2,
    log_date: new Date().toISOString().slice(0, 10),
    note: "Giả lập cân nặng sáng sớm",
    created_at: new Date().toISOString()
  }
];

/**
 * GET /api/logs/weight?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns weight log entries sorted ascending by date.
 */
export async function getWeightTimeline(from: string, to: string): Promise<WeightLogEntry[]> {
  if (USE_MOCK) {
    return mockWeightLogs.filter(log => log.log_date >= from && log.log_date <= to);
  }
  const res = await apiClient.get("/api/logs/weight", { params: { from, to } });
  return res.data.data;
}

/**
 * GET /api/User/info — includes ActiveGoal with goalWeightKg
 */
export async function getUserGoal(): Promise<UserGoalApiResponse | null> {
  if (USE_MOCK) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { mockGetUserInfoResponse } = require("../constants/mocks/userMocks");
    return mockGetUserInfoResponse.activeGoal;
  }
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
  if (USE_MOCK) {
    const existingLogs = await getWeightTimeline(dateISO, dateISO);
    if (existingLogs && existingLogs.length > 0) {
      const existingLog = existingLogs[0];
      const updatedLog: WeightLogEntry = {
        ...existingLog,
        weight_kg: weightKg,
        note: note ?? existingLog.note,
      };
      mockWeightLogs = mockWeightLogs.map(log => log.id === existingLog.id ? updatedLog : log);
      return updatedLog;
    } else {
      const newLog: WeightLogEntry = {
        id: Math.floor(Math.random() * 100000),
        weight_kg: weightKg,
        log_date: dateISO,
        note: note ?? null,
        created_at: new Date().toISOString(),
      };
      mockWeightLogs.push(newLog);
      return newLog;
    }
  }

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

