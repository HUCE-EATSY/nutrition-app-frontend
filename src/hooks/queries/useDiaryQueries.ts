import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foodLogService, CreateFoodLogRequest, UpdateFoodLogRequest } from "@/services/logService";

export const DIARY_QUERY_KEYS = {
  all: ["diary"] as const,
  foodLogs: (date: string) => [...DIARY_QUERY_KEYS.all, "food", date] as const,
  summary: (date: string) => [...DIARY_QUERY_KEYS.all, "summary", date] as const,
};

export const useGetFoodLogs = (date: string) => {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.foodLogs(date),
    queryFn: () => foodLogService.getFoodLogs(date),
    enabled: !!date,
  });
};

export const useGetFoodSummary = (date: string) => {
  return useQuery({
    queryKey: DIARY_QUERY_KEYS.summary(date),
    queryFn: () => foodLogService.getFoodSummary(date),
    enabled: !!date,
  });
};

export const useCreateFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateFoodLogRequest) => foodLogService.createFoodLog(req),
    onSuccess: (_, variables) => {
      // Invalidate both food logs and summary for the log date
      queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEYS.all });
    },
  });
};

export const useUpdateFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, req }: { id: number; req: UpdateFoodLogRequest }) =>
      foodLogService.updateFoodLog(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEYS.all });
    },
  });
};

export const useDeleteFoodLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => foodLogService.deleteFoodLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DIARY_QUERY_KEYS.all });
    },
  });
};
