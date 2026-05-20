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
  // Actions
  setDate: (dateISO: string) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
}

function shiftDate(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Store implementation ─────────────────────────────────────────────────────
export const useDiaryStore = create<DiaryState>((set, get) => ({
  selectedDate: getTodayDateISO(),

  setDate: (dateISO) => {
    set({ selectedDate: dateISO });
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
}));
