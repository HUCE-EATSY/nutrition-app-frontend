import { create } from "zustand";
import { getTodayDateISO } from "@/hooks/utils/date";
import { DiaryDaySummary } from "@/constants/types/contracts";
import { useAuthStore } from "./authStore";

// ── Types ────────────────────────────────────────────────────────────────────
export interface ExerciseLog {
  id: string;
  activityId: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface CreateDiaryEntryPayload {
  foodId: number; // Changed from string to number
  foodName: string;  // hiển thị local, không gửi API
  dateISO: string;
  hour: number;
  quantityG: number;
  totalCalories: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
}

export interface CreateExercisePayload {
  activityId: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
  caloriesBurned: number;
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface DiaryState {
  selectedDate: string;
  summary: DiaryDaySummary | null;
  exercises: ExerciseLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDate: (dateISO: string) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  fetchDiary: (dateISO?: string) => Promise<void>;
  addMealEntry: (payload: CreateDiaryEntryPayload) => Promise<void>;
  addExercise: (payload: CreateExercisePayload) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
}

// ── API base (sẽ cấu hình từ env sau) ───────────────────────────────────────
const API_BASE = "http://localhost:5184"; // Backend .NET

function getHeaders() {
  const token = useAuthStore.getState().accessToken;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function shiftDate(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Store implementation ─────────────────────────────────────────────────────
export const useDiaryStore = create<DiaryState>((set, get) => ({
  selectedDate: getTodayDateISO(),
  summary: null,
  exercises: [],
  isLoading: false,
  error: null,

  setDate: (dateISO) => {
    set({ selectedDate: dateISO });
    get().fetchDiary(dateISO);
  },

  goToPrevDay: () => {
    const prev = shiftDate(get().selectedDate, -1);
    get().setDate(prev);
  },

  goToNextDay: () => {
    const today = getTodayDateISO();
    const next = shiftDate(get().selectedDate, 1);
    // Không cho phép vượt quá hôm nay
    if (next <= today) get().setDate(next);
  },

  fetchDiary: async (dateISO) => {
    const date = dateISO ?? get().selectedDate;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/diary?date=${date}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Không tải được nhật ký");
      const json = await res.json();
      set({ summary: json.data, isLoading: false });

      // Lấy danh sách bài tập trong ngày
      const exRes = await fetch(`${API_BASE}/api/diary/exercises?date=${date}`, {
        headers: getHeaders(),
      });
      if (exRes.ok) {
        const exJson = await exRes.json();
        set({ exercises: exJson.data ?? [] });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  addMealEntry: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/diary/entries`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ghi bữa ăn thất bại");
      // Reload diary sau khi thêm thành công
      await get().fetchDiary();
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },

  addExercise: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/diary/exercises`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Ghi hoạt động thất bại");
      await get().fetchDiary();
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },

  deleteEntry: async (entryId) => {
    try {
      const res = await fetch(`${API_BASE}/api/diary/entries/${entryId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      await get().fetchDiary();
    } catch (e: any) {
      set({ error: e.message });
      throw e;
    }
  },
}));
