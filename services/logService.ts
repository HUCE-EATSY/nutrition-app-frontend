/**
 * logService.ts
 * Tất cả API calls cho Food Logs + Weight Logs theo swagger:
 *
 * Food logs:
 *   GET    /api/logs/food?date=          → danh sách log theo ngày
 *   POST   /api/logs/food                → tạo food log
 *   PUT    /api/logs/food/:id            → cập nhật quantity
 *   DELETE /api/logs/food/:id            → xóa food log
 *   GET    /api/logs/food/summary?date=  → tổng hợp macro theo ngày
 *
 * Weight logs:
 *   GET    /api/logs/weight?from=&to=    → lịch sử cân nặng
 *   POST   /api/logs/weight              → tạo weight log
 *   PUT    /api/logs/weight/:id          → cập nhật weight log
 */

import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateFoodLogRequest {
  /** UUID của food item */
  food_item_id: string;
  /** ID bữa ăn từ /api/meal-types (1=Bữa sáng, 2=Bữa trưa,...) */
  meal_type_id: number;
  /** YYYY-MM-DD */
  log_date: string;
  /** Số gram, min 0.01 max 99999.99 */
  quantity_g: number;
  /** Tuỳ chọn: phương thức nhập (1–10) */
  input_method?: number;
  /** Tuỳ chọn: ghi chú */
  note?: string;
}

export interface UpdateFoodLogRequest {
  /** Số gram mới, min 0.01 max 99999.99 */
  quantity_g: number;
}

export interface FoodLogDto {
  id: number;
  foodItemId: string;
  foodName: string;
  mealTypeId: number;
  mealTypeName?: string;
  logDate: string;
  quantityG: number;
  caloriesKcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  imageUrl?: string;
}

export interface FoodLogSummaryDto {
  logDate: string;
  targetCalories?: number;
  consumedCalories: number;
  targetProteinG?: number;
  consumedProteinG: number;
  targetCarbsG?: number;
  consumedCarbsG: number;
  targetFatG?: number;
  consumedFatG: number;
  logs: FoodLogDto[];
}

export interface CreateWeightLogRequest {
  /** kg, min 1 max 500 */
  weight_kg: number;
  /** YYYY-MM-DD */
  log_date: string;
  note?: string;
}

export interface UpdateWeightLogRequest {
  /** kg, min 1 max 500 */
  weight_kg: number;
  note?: string;
}

export interface WeightLogDto {
  id: number;
  weightKg: number;
  logDate: string;
  note?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function mapFoodLogToDto(rawLog: any): FoodLogDto {
  return {
    id: rawLog.id,
    foodItemId: rawLog.food_item_id,
    foodName: rawLog.food_name_vi || rawLog.food_name_en || "Chưa rõ tên",
    mealTypeId: rawLog.meal_type_id,
    mealTypeName: rawLog.meal_type_name,
    logDate: rawLog.log_date,
    quantityG: rawLog.quantity_g,
    caloriesKcal: rawLog.calories_kcal,
    proteinG: rawLog.protein_g ?? 0,
    carbsG: rawLog.carbs_g ?? 0,
    fatG: rawLog.fat_g ?? 0,
    imageUrl: rawLog.image_url,
  };
}

// ── Food Log Service ──────────────────────────────────────────────────────────

export const foodLogService = {
  /**
   * Lấy food logs theo ngày
   * GET /api/logs/food?date=YYYY-MM-DD
   */
  getFoodLogs: async (date: string): Promise<FoodLogDto[]> => {
    const response = await apiClient.get(API_URLS.logs.food, {
      params: { date },
    });
    const resData = response.data.data ?? response.data;
    
    // Nếu backend trả về `{ date: '...', meals: [...] }`
    if (resData && typeof resData === "object" && Array.isArray(resData.meals)) {
      const flattenedLogs: FoodLogDto[] = [];
      for (const meal of resData.meals) {
        if (Array.isArray(meal.logs)) {
          for (const rawLog of meal.logs) {
            flattenedLogs.push(mapFoodLogToDto(rawLog));
          }
        }
      }
      return flattenedLogs;
    }

    // Fallback nếu trả về mảng trực tiếp
    if (Array.isArray(resData)) {
      return resData.map(mapFoodLogToDto);
    }
    
    return [];
  },

  /**
   * Tổng hợp macro theo ngày
   * GET /api/logs/food/summary?date=YYYY-MM-DD
   */
  getFoodSummary: async (date: string): Promise<FoodLogSummaryDto | null> => {
    const response = await apiClient.get(API_URLS.logs.foodSummary, {
      params: { date },
    });
    const raw = response.data.data ?? response.data;
    if (!raw) return null;

    return {
      logDate: raw.date || date,
      consumedCalories: raw.total_calories ?? 0,
      consumedProteinG: raw.total_protein_g ?? 0,
      consumedCarbsG: raw.total_carbs_g ?? 0,
      consumedFatG: raw.total_fat_g ?? 0,
      targetCalories: raw.target?.target_calories,
      targetProteinG: raw.target?.target_protein_g,
      targetCarbsG: raw.target?.target_carbs_g,
      targetFatG: raw.target?.target_fat_g,
      logs: [],
    };
  },

  /**
   * Tạo food log mới
   * POST /api/logs/food
   */
  createFoodLog: async (req: CreateFoodLogRequest): Promise<FoodLogDto> => {
    const response = await apiClient.post(API_URLS.logs.food, req);
    const rawLog = response.data.data ?? response.data;
    return mapFoodLogToDto(rawLog);
  },

  /**
   * Cập nhật số gram của food log
   * PUT /api/logs/food/:id
   */
  updateFoodLog: async (id: number, req: UpdateFoodLogRequest): Promise<FoodLogDto> => {
    const response = await apiClient.put(API_URLS.logs.foodById(id), req);
    const rawLog = response.data.data ?? response.data;
    return mapFoodLogToDto(rawLog);
  },

  /**
   * Xóa food log
   * DELETE /api/logs/food/:id
   */
  deleteFoodLog: async (id: number): Promise<void> => {
    await apiClient.delete(API_URLS.logs.foodById(id));
  },
};

// ── Weight Log Service ────────────────────────────────────────────────────────

export const weightLogService = {
  /**
   * Lấy lịch sử cân nặng theo khoảng thời gian
   * GET /api/logs/weight?from=YYYY-MM-DD&to=YYYY-MM-DD
   */
  getWeightLogs: async (from?: string, to?: string): Promise<WeightLogDto[]> => {
    const response = await apiClient.get(API_URLS.logs.weight, {
      params: { from, to },
    });
    const data = response.data.data ?? response.data;
    const array = Array.isArray(data) ? data : [];
    return array.map((raw: any) => ({
      id: raw.id,
      weightKg: raw.weight_kg,
      logDate: raw.log_date,
      note: raw.note,
    }));
  },

  /**
   * Tạo weight log mới
   * POST /api/logs/weight
   */
  createWeightLog: async (req: CreateWeightLogRequest): Promise<WeightLogDto> => {
    const response = await apiClient.post(API_URLS.logs.weight, req);
    const raw = response.data.data ?? response.data;
    return {
      id: raw.id,
      weightKg: raw.weight_kg,
      logDate: raw.log_date,
      note: raw.note,
    };
  },

  /**
   * Cập nhật weight log
   * PUT /api/logs/weight/:id
   */
  updateWeightLog: async (id: number, req: UpdateWeightLogRequest): Promise<WeightLogDto> => {
    const response = await apiClient.put(API_URLS.logs.weightById(id), req);
    const raw = response.data.data ?? response.data;
    return {
      id: raw.id,
      weightKg: raw.weight_kg,
      logDate: raw.log_date,
      note: raw.note,
    };
  },
};

