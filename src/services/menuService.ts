import { apiClient } from "./apiClient";
import { API_BASE } from "../constants/api";

export type MenuFoodItem = {
  foodItemId: string;
  nameVi: string;
  nameEn: string;
  imageUrl: string | null;
  mealTypeId: number;
  quantityG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MenuResponse = {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  userId: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
  foods: MenuFoodItem[];
};

export type CreateMenuPayload = {
  name: string;
  description?: string;
  coverImageUrl?: string;
  foods: {
    foodItemId: string;
    mealTypeId: number;
    quantityG: number;
  }[];
};

export type DailyPlanItem = {
  id: string;
  foodItemId: string;
  foodNameVi: string;
  foodNameEn: string;
  imageUrl: string | null;
  mealTypeId: number;
  quantityG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isSynced: boolean;
};

export type DailyPlanResponse = {
  logDate: string;
  items: DailyPlanItem[];
};

export const menuService = {
  getMyPlans: async (): Promise<MenuResponse[]> => {
    const response = await apiClient.get(`${API_BASE}/api/menus/my-plans`);
    return response.data.data;
  },

  createMenu: async (payload: CreateMenuPayload): Promise<MenuResponse> => {
    const response = await apiClient.post(`${API_BASE}/api/menus`, payload);
    return response.data.data;
  },

  updateMenu: async (id: string, payload: CreateMenuPayload): Promise<MenuResponse> => {
    const response = await apiClient.put(`${API_BASE}/api/menus/${id}`, payload);
    return response.data.data;
  },

  deleteMenu: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_BASE}/api/menus/${id}`);
  },

  applyDailyPlan: async (menuId: string, date: string): Promise<void> => {
    await apiClient.post(`${API_BASE}/api/daily-plans/apply`, { menuId, date });
  },

  getDailyPlan: async (date: string): Promise<DailyPlanResponse> => {
    const response = await apiClient.get(`${API_BASE}/api/daily-plans/${date}`);
    return response.data.data;
  },

  syncToDiary: async (mealTypeId: number, date: string): Promise<DailyPlanResponse> => {
    const response = await apiClient.post(`${API_BASE}/api/daily-plans/sync-to-diary`, { mealTypeId, date });
    return response.data.data;
  },
};
