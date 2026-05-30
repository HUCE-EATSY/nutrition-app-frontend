/**
 * diaryStore.ts
 * Zustand store cho nhật ký ăn uống – sử dụng đúng API theo swagger:
 *   GET    /api/logs/food?date=          → food logs ngày
 *   GET    /api/logs/food/summary?date=  → tổng hợp macro ngày
 *   POST   /api/logs/food                → tạo food log
 *   DELETE /api/logs/food/:id            → xóa food log
 */

import { create } from "zustand";
import { getTodayDateISO } from "@/utils/date";
import { DiaryDaySummary, DiaryEntry, DiaryHourSlot } from "@/types/contracts";
import {
  foodLogService,
  CreateFoodLogRequest,
  FoodLogDto,
  FoodLogSummaryDto,
} from "@/services/logService";
import { exerciseService } from "@/services/exerciseService";
import { getExerciseNameFromActivity } from "@/constants/exerciseMapping";
import { ActivityId } from "@/constants/activities";
import { useSettingsStore } from "./settingsStore";

// ── Payload giao tiếp với UI (giữ nguyên để UI hiện tại không phải thay đổi nhiều) ─
export interface CreateDiaryEntryPayload {
  /** UUID của food item (string) */
  foodItemId: string;
  /** ID loại bữa ăn lấy từ /api/meal-types (1=Sáng, 2=Trưa, 3=Tối…) */
  mealTypeId: number;
  /** YYYY-MM-DD */
  dateISO: string;
  /** Số gram */
  quantityG: number;
  /** Ghi chú tuỳ chọn */
  note?: string;
}

export interface CreateExercisePayload {
  activityId: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
  caloriesBurned: number;
}

/** Exercise log – đồng bộ với backend */
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseNameVi: string;
  exerciseNameEn: string;
  activityLabel: string;
  dateISO: string;
  hour: number;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string | null;
}

// ── Chuyển đổi FoodLogSummaryDto → DiaryDaySummary cho UI ─────────────────────
function mapSummaryToUI(
  dto: FoodLogSummaryDto,
  logs: FoodLogDto[]
): DiaryDaySummary {
  // Nhóm logs theo mealTypeId (dùng tạm như "hour slot" cho UI timeline)
  // Vì UI đang dùng khung giờ, ta map mealTypeId → hour xấp xỉ
  const mealHourMap: Record<number, number> = {
    1: 7,   // Bữa sáng → 7:00
    2: 12,  // Bữa trưa → 12:00
    3: 19,  // Bữa tối  → 19:00
    4: 15,  // Bữa phụ  → 15:00
  };

  // Build slots
  const slotMap: Record<number, DiaryEntry[]> = {};
  for (const log of logs) {
    let hour = mealHourMap[log.mealTypeId] ?? 12;
    if (log.createdAt) {
      // Backend returns UTC datetime ending with 'Z' usually, but just in case, parse it
      const dateObj = new Date(log.createdAt);
      if (!isNaN(dateObj.getTime())) {
        hour = dateObj.getHours();
      }
    }

    if (!slotMap[hour]) slotMap[hour] = [];
    slotMap[hour].push({
      id: String(log.id),
      dateISO: log.logDate,
      hour,
      title: log.foodName,
      calories: log.caloriesKcal,
      proteinGram: log.proteinG ?? 0,
      carbGram: log.carbsG ?? 0,
      fatGram: log.fatG ?? 0,
      type: "meal",
      imageUrl: log.imageUrl,
      quantityG: log.quantityG,
      foodItemId: log.foodItemId,
    });
  }

  const slots: DiaryHourSlot[] = Object.entries(slotMap).map(([h, entries]) => ({
    hour: Number(h),
    entries,
  }));

  return {
    dateISO: dto.logDate,
    targetCalories: dto.targetCalories ?? 2000,
    consumedCalories: dto.consumedCalories,
    targetProteinGram: dto.targetProteinG ?? 120,
    consumedProteinGram: dto.consumedProteinG,
    targetCarbGram: dto.targetCarbsG ?? 250,
    consumedCarbGram: dto.consumedCarbsG,
    targetFatGram: dto.targetFatG ?? 67,
    consumedFatGram: dto.consumedFatG,
    slots,
  };
}

// ── Store interface ──────────────────────────────────────────────────────────
interface DiaryState {
  selectedDate: string;
  summary: DiaryDaySummary | null;
  /** Raw food logs của ngày hiện tại (để delete/update) */
  rawLogs: FoodLogDto[];
  /** Exercise logs – lưu local vì backend chưa có endpoint */
  exercises: ExerciseLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setDate: (dateISO: string) => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  fetchDiary: (dateISO?: string) => Promise<void>;
  addMealEntry: (payload: CreateDiaryEntryPayload) => Promise<void>;
  deleteFoodLog: (logId: number) => Promise<void>;
  updateMealEntry: (logId: number, quantityG: number) => Promise<void>;
  addExercise: (payload: CreateExercisePayload) => Promise<void>;
  /** @deprecated dùng deleteFoodLog(logId) thay thế */
  deleteEntry: (entryId: string) => Promise<void>;
}

function shiftDate(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Store ────────────────────────────────────────────────────────────────────
export const useDiaryStore = create<DiaryState>((set, get) => ({
  selectedDate: getTodayDateISO(),
  summary: null,
  rawLogs: [],
  exercises: [],
  isLoading: false,
  error: null,

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
    if (next <= today) get().setDate(next);
  },

  fetchDiary: async (dateISO) => {
    const date = dateISO ?? get().selectedDate;
    set({ isLoading: true, error: null });
    try {
      // 1. Lấy danh sách food logs
      const logs = await foodLogService.getFoodLogs(date);

      // 2. Lấy summary (macro tổng hợp)
      const summaryDto = await foodLogService.getFoodSummary(date);

      // 3. Lấy exercise logs từ API
      let mappedExercises: ExerciseLog[] = [];
      try {
        const exerciseSummary = await exerciseService.getDailySummary(date);
        const language = useSettingsStore.getState().language;
        mappedExercises = (exerciseSummary?.logs || []).map((log) => {
          let hour = 12; // default
          if (log.createdAt) {
            const dateObj = new Date(log.createdAt);
            if (!isNaN(dateObj.getTime())) {
              hour = dateObj.getHours();
            }
          }
          return {
            id: String(log.id),
            exerciseId: log.exerciseId,
            exerciseNameVi: log.exerciseNameVi,
            exerciseNameEn: log.exerciseNameEn,
            activityLabel: language === "en" ? log.exerciseNameEn : log.exerciseNameVi,
            dateISO: log.logDate,
            hour,
            durationMinutes: log.durationMinutes,
            caloriesBurned: Number(log.caloriesBurned),
            notes: log.notes,
          };
        });
      } catch (exErr) {
        console.error("Failed to load exercise summary:", exErr);
      }

      if (summaryDto) {
        set({
          rawLogs: logs,
          summary: mapSummaryToUI(summaryDto, logs),
          exercises: mappedExercises,
          isLoading: false,
        });
      } else {
        // Backend không trả summary → tự tính từ logs
        const consumed = logs.reduce(
          (acc, l) => ({
            calories: acc.calories + l.caloriesKcal,
            protein: acc.protein + (l.proteinG ?? 0),
            carbs: acc.carbs + (l.carbsG ?? 0),
            fat: acc.fat + (l.fatG ?? 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        const fakeSummaryDto: FoodLogSummaryDto = {
          logDate: date,
          consumedCalories: consumed.calories,
          consumedProteinG: consumed.protein,
          consumedCarbsG: consumed.carbs,
          consumedFatG: consumed.fat,
          logs,
        };
        set({
          rawLogs: logs,
          summary: mapSummaryToUI(fakeSummaryDto, logs),
          exercises: mappedExercises,
          isLoading: false,
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Không tải được nhật ký";
      set({ isLoading: false, error: message });
    }
  },

  addMealEntry: async (payload) => {
    const req: CreateFoodLogRequest = {
      food_item_id: payload.foodItemId,
      meal_type_id: payload.mealTypeId,
      log_date: payload.dateISO,
      quantity_g: payload.quantityG,
      note: payload.note,
    };
    await foodLogService.createFoodLog(req);
    // Refresh diary sau khi thêm
    await get().fetchDiary(payload.dateISO);
  },

  deleteFoodLog: async (logId) => {
    await foodLogService.deleteFoodLog(logId);
    await get().fetchDiary();
  },

  updateMealEntry: async (logId, quantityG) => {
    await foodLogService.updateFoodLog(logId, { quantity_g: quantityG });
    await get().fetchDiary();
  },

  /** @deprecated – gọi deleteFoodLog(Number(entryId)) */
  deleteEntry: async (entryId) => {
    const id = Number(entryId);
    if (!isNaN(id)) {
      await get().deleteFoodLog(id);
    }
  },

  addExercise: async (payload) => {
    try {
      const categories = await exerciseService.getCategories();
      const allExercises = categories.flatMap(cat => cat.exercises);
      const exerciseName = getExerciseNameFromActivity(payload.activityId as ActivityId);
      
      let exercise = allExercises.find(ex => ex.nameEn.toLowerCase() === exerciseName.toLowerCase());
      if (!exercise) {
        exercise = allExercises.find(ex => ex.nameEn.toLowerCase() === "walking") || allExercises[0];
      }
      
      if (!exercise) {
        throw new Error("Không tìm thấy bài tập phù hợp");
      }

      await exerciseService.createLog({
        exerciseId: exercise.id,
        logDate: payload.dateISO,
        durationMinutes: payload.durationMinutes,
        intensity: 2, // Mặc định trung bình
        notes: `Logged via: ${payload.activityLabel}`,
      });

      // Reload nhật ký để cập nhật UI
      await get().fetchDiary(payload.dateISO);
    } catch (error) {
      console.error("addExercise error:", error);
      throw error;
    }
  },
}));
