import { useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export interface FoodItem {
  id: number;
  name: string;
  imageUrl: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
}

export function useFoodList(searchQuery: string = "") {
  return useQuery({
    queryKey: ["food", "list", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/v1/Food?search=${encodeURIComponent(searchQuery)}`
        : `/api/v1/Food`;
      const response = await axiosClient.get(url);
      return (response.data.data ?? []) as FoodItem[];
    },
    enabled: searchQuery.length >= 2 || searchQuery === "",
  });
}

export function useFoodDetails(id: string | undefined) {
  return useQuery({
    queryKey: ["food", "details", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosClient.get(`/api/v1/Food/${id}`);
      return response.data.data as FoodItem;
    },
    enabled: !!id,
  });
}
