import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService, CreateMenuPayload } from "@/services/menuService";

export const MENU_QUERY_KEYS = {
  all: ["menus"] as const,
  myPlans: () => [...MENU_QUERY_KEYS.all, "my-plans"] as const,
  dailyPlan: (date: string) => [...MENU_QUERY_KEYS.all, "daily-plan", date] as const,
};

export function useMyPlans() {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.myPlans(),
    queryFn: menuService.getMyPlans,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDailyPlanQuery(date: string) {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.dailyPlan(date),
    queryFn: () => menuService.getDailyPlan(date),
    staleTime: 0, // Always refetch since synchronization changes state
  });
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuService.createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.myPlans() });
    },
  });
}

export function useUpdateMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateMenuPayload }) =>
      menuService.updateMenu(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.myPlans() });
    },
  });
}

export function useDeleteMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: menuService.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.myPlans() });
    },
  });
}

export function useApplyMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuId, date }: { menuId: string; date: string }) =>
      menuService.applyDailyPlan(menuId, date),
    onSuccess: (_data, variables) => {
      // Invalidate daily plans for the applied date
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.dailyPlan(variables.date) });
    },
  });
}

export function useSyncToDiaryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealTypeId, date }: { mealTypeId: number; date: string }) =>
      menuService.syncToDiary(mealTypeId, date),
    onSuccess: (data, variables) => {
      // Immediately update daily plan cache with the server response
      if (data) {
        queryClient.setQueryData(MENU_QUERY_KEYS.dailyPlan(variables.date), data);
      }
      // Invalidate to ensure eventual consistency
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.dailyPlan(variables.date) });
      // Invalidate diary-related queries so nutrition summary updates
      queryClient.invalidateQueries({ queryKey: ["diary"] });
      queryClient.invalidateQueries({ queryKey: ["food-logs"] });
    },
  });
}
