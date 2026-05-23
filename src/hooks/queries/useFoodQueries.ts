import { useQuery } from "@tanstack/react-query";
import { foodService, FoodItemDto } from "@/services/foodService";

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

const mapDtoToFoodItem = (dto: FoodItemDto): FoodItem => ({
  id: dto.id,
  name: dto.nameVi || "Món ăn chưa rõ tên",
  imageUrl: dto.imageUrl ?? null,
  category: dto.category || "Khác",
  calories: dto.caloriesKcal ?? 0,
  protein: dto.proteinG ?? 0,
  carbs: dto.carbsG ?? 0,
  fat: dto.fatG ?? 0,
  servingSize: dto.servingSizeG ?? 100,
  source: dto.source,
});

export function useFoodList(searchQuery: string = "") {
  return useQuery({
    queryKey: ["food", "list", searchQuery],
    queryFn: async () => {
      if (searchQuery.trim().length >= 2) {
        const result = await foodService.searchFoods({ q: searchQuery });
        return (result.items || []).map(mapDtoToFoodItem);
      } else {
        const items = await foodService.getAllFoods();
        return (items || []).map(mapDtoToFoodItem);
      }
    },
    enabled: searchQuery.length >= 2 || searchQuery === "",
  });
}

export function useFoodDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["food", "details", id],
    queryFn: async () => {
      if (!id) return null;
      const raw = await foodService.getFoodById(id);
      return raw ? mapDtoToFoodItem(raw) : null;
    },
    enabled: !!id,
  });
}
