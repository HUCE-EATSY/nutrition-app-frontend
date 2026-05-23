import { FoodItem } from "@/hooks/queries/useFoodQueries";

export interface CalculatedNutrition {
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

/**
 * Calculates nutrition values based on grams and food item details
 */
export function calcNutrition(food: FoodItem, grams: number): CalculatedNutrition {
  const ratio = grams / food.servingSize;
  return {
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    carb: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  };
}
