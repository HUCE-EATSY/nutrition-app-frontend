import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { API_URLS } from '@/constants/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface FoodLogDto {
  id: number;
  foodItemId: string;
  foodNameVi: string;
  mealTypeId: number;
  mealTypeNameVi: string;
  logDate: string; // DateOnly as ISO string
  quantityG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  note?: string;
  createdAt: string;
}

export interface DailySummaryDto {
  date: string; // DateOnly as ISO string
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalLogs: number;
  logs: FoodLogDto[];
}

export interface CreateFoodLogDto {
  foodItemId: string;
  mealTypeId: number;
  logDate: string; // DateOnly as ISO string (YYYY-MM-DD)
  quantityG: number;
  note?: string;
}

export interface UpdateFoodLogDto {
  mealTypeId?: number;
  quantityG?: number;
  note?: string;
}

// ── API Functions ────────────────────────────────────────────────────────────
async function getDailySummary(
  date: string,
  accessToken: string
): Promise<DailySummaryDto> {
  const response = await fetch(`${API_URLS.diary.daily}?date=${date}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get daily summary');
  }

  const json = await response.json();
  return json.data;
}

async function createFoodLog(
  dto: CreateFoodLogDto,
  accessToken: string
): Promise<FoodLogDto> {
  const response = await fetch(API_URLS.diary.logs, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create food log');
  }

  const json = await response.json();
  return json.data;
}

async function updateFoodLog(
  logId: number,
  dto: UpdateFoodLogDto,
  accessToken: string
): Promise<FoodLogDto> {
  const response = await fetch(`${API_URLS.diary.logs}/${logId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to update food log');
  }

  const json = await response.json();
  return json.data;
}

async function deleteFoodLog(
  logId: number,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_URLS.diary.logs}/${logId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete food log');
  }
}

// ── React Query Hooks ────────────────────────────────────────────────────────
export function useDailySummary(date: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['diary', 'daily', date],
    queryFn: () => getDailySummary(date, accessToken!),
    enabled: !!accessToken,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateFoodLog() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateFoodLogDto) => createFoodLog(dto, accessToken!),
    onSuccess: (data) => {
      // Invalidate daily summary for the log date
      queryClient.invalidateQueries({ queryKey: ['diary', 'daily', data.logDate] });
    },
  });
}

export function useUpdateFoodLog() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, dto }: { logId: number; dto: UpdateFoodLogDto }) =>
      updateFoodLog(logId, dto, accessToken!),
    onSuccess: (data) => {
      // Invalidate daily summary for the log date
      queryClient.invalidateQueries({ queryKey: ['diary', 'daily', data.logDate] });
    },
  });
}

export function useDeleteFoodLog() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, date }: { logId: number; date: string }) =>
      deleteFoodLog(logId, accessToken!),
    onSuccess: (_, variables) => {
      // Invalidate daily summary for the log date
      queryClient.invalidateQueries({ queryKey: ['diary', 'daily', variables.date] });
    },
  });
}
