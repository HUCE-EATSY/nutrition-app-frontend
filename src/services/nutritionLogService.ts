import { apiClient } from "./apiClient";
import { DailySummaryResponse } from "@/types/contracts";
import { foodLogService } from "./logService";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export async function getDailySummary(date: string): Promise<DailySummaryResponse> {
  if (USE_MOCK) {
    const logs = await foodLogService.getFoodLogs(date);
    const total_calories = logs.reduce((sum, log) => sum + log.caloriesKcal, 0);
    const total_protein_g = logs.reduce((sum, log) => sum + (log.proteinG ?? 0), 0);
    const total_carbs_g = logs.reduce((sum, log) => sum + (log.carbsG ?? 0), 0);
    const total_fat_g = logs.reduce((sum, log) => sum + (log.fatG ?? 0), 0);

    return {
      date,
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fat_g,
      target: {
        target_calories: 2000,
        target_protein_g: 130,
        target_carbs_g: 250,
        target_fat_g: 65,
        calories_pct: Math.min(100, Math.round((total_calories / 2000) * 100)),
        protein_pct: Math.min(100, Math.round((total_protein_g / 130) * 100)),
        carbs_pct: Math.min(100, Math.round((total_carbs_g / 250) * 100)),
        fat_pct: Math.min(100, Math.round((total_fat_g / 65) * 100)),
      }
    };
  }
  const res = await apiClient.get("/api/logs/food/summary", { params: { date } });
  return res.data.data;
}
