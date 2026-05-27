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
  createdAt?: string;
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
    createdAt: rawLog.created_at,
  };
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

let mockFoodLogs: FoodLogDto[] = [
  {
    id: 1,
    foodItemId: "mock-food-1",
    foodName: "Bún chả Hà Nội",
    mealTypeId: 1,
    mealTypeName: "Bữa sáng",
    logDate: new Date().toISOString().slice(0, 10),
    quantityG: 350,
    caloriesKcal: 450,
    proteinG: 18,
    carbsG: 62,
    fatG: 12,
  },
  {
    id: 2,
    foodItemId: "mock-food-2",
    foodName: "Cơm tấm sườn bì chả",
    mealTypeId: 2,
    mealTypeName: "Bữa trưa",
    logDate: new Date().toISOString().slice(0, 10),
    quantityG: 400,
    caloriesKcal: 657,
    proteinG: 32,
    carbsG: 85,
    fatG: 21,
  }
];

export const foodLogService = {
  /**
   * Lấy food logs theo ngày
   * GET /api/logs/food?date=YYYY-MM-DD
   */
  getFoodLogs: async (date: string): Promise<FoodLogDto[]> => {
    if (USE_MOCK) {
      return mockFoodLogs.filter((log) => log.logDate === date);
    }
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
    if (USE_MOCK) {
      const logs = mockFoodLogs.filter((log) => log.logDate === date);
      const consumed = logs.reduce(
        (acc, l) => ({
          calories: acc.calories + l.caloriesKcal,
          protein: acc.protein + (l.proteinG ?? 0),
          carbs: acc.carbs + (l.carbsG ?? 0),
          fat: acc.fat + (l.fatG ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
      return {
        logDate: date,
        consumedCalories: consumed.calories,
        consumedProteinG: consumed.protein,
        consumedCarbsG: consumed.carbs,
        consumedFatG: consumed.fat,
        targetCalories: 2000,
        targetProteinG: 130,
        targetCarbsG: 250,
        targetFatG: 65,
        logs: [],
      };
    }
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
    if (USE_MOCK) {
      // Cố gắng tìm tên món ăn từ danh sách mock food nếu có thể
      const newLog: FoodLogDto = {
        id: Math.floor(Math.random() * 1000000),
        foodItemId: req.food_item_id,
        foodName: "Món ăn giả lập",
        mealTypeId: req.meal_type_id,
        mealTypeName: req.meal_type_id === 1 ? "Bữa sáng" : req.meal_type_id === 2 ? "Bữa trưa" : req.meal_type_id === 3 ? "Bữa tối" : "Bữa phụ",
        logDate: req.log_date,
        quantityG: req.quantity_g,
        caloriesKcal: Math.round(req.quantity_g * 1.5),
        proteinG: Math.round(req.quantity_g * 0.08),
        carbsG: Math.round(req.quantity_g * 0.2),
        fatG: Math.round(req.quantity_g * 0.04),
      };
      mockFoodLogs.push(newLog);
      return newLog;
    }
    const response = await apiClient.post(API_URLS.logs.food, req);
    const rawLog = response.data.data ?? response.data;
    return mapFoodLogToDto(rawLog);
  },

  /**
   * Cập nhật số gram của food log
   * PUT /api/logs/food/:id
   */
  updateFoodLog: async (id: number, req: UpdateFoodLogRequest): Promise<FoodLogDto> => {
    if (USE_MOCK) {
      const idx = mockFoodLogs.findIndex((log) => log.id === id);
      if (idx !== -1) {
        const log = mockFoodLogs[idx];
        const ratio = req.quantity_g / log.quantityG;
        const updated = {
          ...log,
          quantityG: req.quantity_g,
          caloriesKcal: Math.round(log.caloriesKcal * ratio),
          proteinG: log.proteinG ? Math.round(log.proteinG * ratio) : 0,
          carbsG: log.carbsG ? Math.round(log.carbsG * ratio) : 0,
          fatG: log.fatG ? Math.round(log.fatG * ratio) : 0,
        };
        mockFoodLogs[idx] = updated;
        return updated;
      }
      throw new Error("Không tìm thấy log để cập nhật.");
    }
    const response = await apiClient.put(API_URLS.logs.foodById(id), req);
    const rawLog = response.data.data ?? response.data;
    return mapFoodLogToDto(rawLog);
  },

  /**
   * Xóa food log
   * DELETE /api/logs/food/:id
   */
  deleteFoodLog: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      mockFoodLogs = mockFoodLogs.filter((log) => log.id !== id);
      return;
    }
    await apiClient.delete(API_URLS.logs.foodById(id));
  },
};


