import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { API_URLS } from '@/constants/api';

// ── Types ────────────────────────────────────────────────────────────────────
export interface FoodDto {
  id: string;
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  categoryNameVi: string;
  servingSizeG: number;
  servingUnitVi: string;
  thumbnailUrl?: string;
  barcode?: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

export interface FoodSearchRequest {
  query?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface FoodSearchResponse {
  foods: FoodDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateFoodDto {
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  servingSizeG: number;
  servingUnitVi?: string;
  thumbnailUrl?: string;
  barcode?: number;
  caloriesKcal: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

// ── API Functions ────────────────────────────────────────────────────────────
async function searchFoods(
  request: FoodSearchRequest,
  accessToken: string | null
): Promise<FoodSearchResponse> {
  const params = new URLSearchParams();
  if (request.query) params.append('query', request.query);
  if (request.categoryId) params.append('categoryId', request.categoryId.toString());
  if (request.page) params.append('page', request.page.toString());
  if (request.pageSize) params.append('pageSize', request.pageSize.toString());

  const response = await fetch(`${API_URLS.food.search}?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search foods');
  }

  const json = await response.json();
  return json.data;
}

async function getFoodById(
  id: string,
  accessToken: string | null
): Promise<FoodDto> {
  const response = await fetch(`${API_URLS.food.base}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get food');
  }

  const json = await response.json();
  return json.data;
}

async function createFood(
  dto: CreateFoodDto,
  accessToken: string
): Promise<FoodDto> {
  const response = await fetch(API_URLS.food.base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to create food');
  }

  const json = await response.json();
  return json.data;
}

// ── React Query Hooks ────────────────────────────────────────────────────────
export function useFoodSearch(request: FoodSearchRequest) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['foods', 'search', request],
    queryFn: () => searchFoods(request, accessToken),
    enabled: !!request.query && request.query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFoodById(id: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['foods', id],
    queryFn: () => getFoodById(id!, accessToken),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateFood() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateFoodDto) => createFood(dto, accessToken!),
    onSuccess: () => {
      // Invalidate food searches to refetch
      queryClient.invalidateQueries({ queryKey: ['foods', 'search'] });
    },
  });
}
