import { apiClient } from "./apiClient";
import { DailySummaryResponse } from "@/constants/types/contracts";

export async function getDailySummary(date: string): Promise<DailySummaryResponse> {
  const res = await apiClient.get("/api/logs/food/summary", { params: { date } });
  return res.data.data;
}
