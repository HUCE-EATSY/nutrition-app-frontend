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
export async function saveWeightLog(
  weightKg: number,
  dateISO: string,
  note?: string,
  photoUri?: string,
  photoMimeType = 'image/jpeg'
): Promise<WeightLogEntry> {
  if (USE_MOCK) {
    const existingLogs = await getWeightTimeline(dateISO, dateISO);
    if (existingLogs && existingLogs.length > 0) {
      const existingLog = existingLogs[0];
      const updatedLog: WeightLogEntry = {
        ...existingLog,
        weight_kg: weightKg,
        note: note ?? existingLog.note,
        photo_url: photoUri || existingLog.photo_url || null,
        photoUrl: photoUri || existingLog.photoUrl || null,
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
        photo_url: photoUri || null,
        photoUrl: photoUri || null,
      };
      mockWeightLogs.push(newLog);
      return newLog;
    }
  }

  // Query timeline for that specific day to see if there is an existing log
  const existingLogs = await getWeightTimeline(dateISO, dateISO);
  
  const form = new FormData();
  form.append("WeightKg", String(weightKg));
  if (note !== undefined && note !== null) {
    form.append("Note", note);
  }
  
  if (photoUri) {
    form.append("Photo", {
      uri: photoUri,
      name: "weight_photo.jpg",
      type: photoMimeType,
    } as any);
  }

  if (existingLogs && existingLogs.length > 0) {
    const existingLog = existingLogs[0];
    const res = await apiClient.put(`/api/logs/weight/${existingLog.id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  } else {
    form.append("LogDate", dateISO);
    const res = await apiClient.post("/api/logs/weight", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  }
}

/**
 * Upload body photo for a weight log.
 */
export async function uploadWeightPhoto(
  id: number,
  photoUri: string,
  photoMimeType = 'image/jpeg'
): Promise<WeightLogEntry> {
  if (USE_MOCK) {
    const idx = mockWeightLogs.findIndex(log => log.id === id);
    if (idx !== -1) {
      mockWeightLogs[idx] = {
        ...mockWeightLogs[idx],
        photo_url: photoUri,
        photoUrl: photoUri,
      };
      return mockWeightLogs[idx];
    }
    throw new Error("Không tìm thấy log để cập nhật ảnh.");
  }
  const form = new FormData();
  form.append("photo", {
    uri: photoUri,
    name: "weight_photo.jpg",
    type: photoMimeType,
  } as any);

  const res = await apiClient.post(`/api/logs/weight/${id}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

