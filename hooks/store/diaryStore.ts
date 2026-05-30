import { create } from "zustand";
import { getTodayDateISO } from "@/hooks/utils/date";
import { DiaryDaySummary } from "@/constants/types/contracts";
import { useAuthStore } from "./authStore";
import { API_BASE } from "@/constants/api";

// ── Types ────────────────────────────────────────────────────────────────────
export interface ExerciseLog {
  id: string;
  activityId: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
}

export interface CreateDiaryEntryPayload {
  foodId: string;    // Guid của food_item
  foodName: string;  // hiển thị local, không gửi API
  dateISO: string;   // YYYY-MM-DD
  hour: number;      // dùng để tính meal_type_id
  quantityG: number; // số gram
  totalCalories: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
}

/** Map giờ → meal_type_id theo convention của backend */
function hourToMealTypeId(hour: number): number {
  if (hour < 10) return 1; // Sáng
  if (hour < 14) return 2; // Trưa
  if (hour < 18) return 3; // Chiều
  return 4;                // Tối
}

export interface CreateExercisePayload {
  activityId: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface DiaryState {
  selectedDate: string;
  summary: DiaryDaySummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDate: (dateISO: string) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  fetchDiary: (dateISO?: string) => Promise<void>;
  addMealEntry: (payload: CreateDiaryEntryPayload) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
}

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
      const t = Date.now();
      // Endpoint đúng: GET /api/logs/food?date=YYYY-MM-DD
      const res = await fetch(`${API_BASE}/api/logs/food?date=${date}&_t=${t}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Không tải được nhật ký");
      const json = await res.json();
      set({ summary: json.data, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Không tải được nhật ký";
      set({ isLoading: false, error: message });
    }
  },

  addMealEntry: async (payload) => {
    try {
      // Endpoint đúng: POST /api/logs/food
      // Backend nhận: food_item_id (Guid), meal_type_id, log_date, quantity_g
      const body = {
        food_item_id: payload.foodId,
        meal_type_id: hourToMealTypeId(payload.hour),
        log_date: payload.dateISO,
        quantity_g: payload.quantityG,
        input_method: 5,
      };
      const res = await fetch(`${API_BASE}/api/logs/food`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Ghi bữa ăn thất bại");
      // Reload diary sau khi thêm thành công
      await get().fetchDiary();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Ghi bữa ăn thất bại";
      set({ error: message });
      throw e;
    }
  },

  deleteEntry: async (entryId) => {
    try {
      // Endpoint đúng: DELETE /api/logs/food/{id}
      const res = await fetch(`${API_BASE}/api/logs/food/${entryId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      await get().fetchDiary();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Xóa thất bại";
      set({ error: message });
      throw e;
    }
  },
}));
