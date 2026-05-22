import { useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export interface FoodItem {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  source?: number;
}

const categoryMap: Record<number, string> = {
  1: "Cơm & Xôi",
  2: "Phở & Bún",
  3: "Bánh mì & Bánh",
  4: "Đồ uống",
  5: "Thực phẩm đóng gói",
  6: "Rau củ quả",
  7: "Thịt & Hải sản",
  10: "Khác",
};

const mapSearchItemToFoodItem = (item: any): FoodItem => ({
  id: item.id,
  name: item.name_vi || item.name_en || "Chưa rõ tên",
  imageUrl: item.image_url || null,
  category: categoryMap[item.category_id] || "Khác",
  calories: Number(item.calories_kcal ?? 0),
  protein: Number(item.protein_g ?? 0),
  carbs: Number(item.carbs_g ?? 0),
  fat: Number(item.fat_g ?? 0),
  servingSize: Number(item.serving_size_g ?? 100),
  source: item.source,
});

const mapDetailToFoodItem = (data: any): FoodItem => ({
  id: data.id,
  name: data.name_vi || data.name_en || "Chưa rõ tên",
  imageUrl: data.image_url || null,
  category: data.category?.name_vi || data.category?.name_en || "Khác",
  calories: Number(data.nutrition?.calories_kcal ?? 0),
  protein: Number(data.nutrition?.protein_g ?? 0),
  carbs: Number(data.nutrition?.carbs_g ?? 0),
  fat: Number(data.nutrition?.fat_g ?? 0),
  servingSize: Number(data.serving_size_g ?? 100),
  source: data.source,
});

export function useFoodList(searchQuery: string = "") {
  return useQuery({
    queryKey: ["food", "list", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/foods/search?Q=${encodeURIComponent(searchQuery)}`
        : `/api/foods`;
      const response = await axiosClient.get(url);
      const resData = response.data.data ?? response.data;
      const items = Array.isArray(resData?.items) ? resData.items : [];
      return items.map(mapSearchItemToFoodItem);
    },
    enabled: searchQuery.length >= 2 || searchQuery === "",
  });
}

export function useFoodDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["food", "details", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosClient.get(`/api/foods/${id}`);
      const raw = response.data.data ?? response.data ?? null;
      return raw ? mapDetailToFoodItem(raw) : null;
    },
    enabled: !!id,
  });
}
