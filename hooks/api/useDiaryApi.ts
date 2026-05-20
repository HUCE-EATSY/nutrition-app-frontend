import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiaryDaySummary } from "@/constants/types/contracts";
import { ExerciseLog, CreateDiaryEntryPayload, CreateExercisePayload } from "@/hooks/store/diaryStore";
import axiosClient from "./axiosClient";

export function useDiary(dateISO: string) {
  return useQuery({
    queryKey: ["diary", dateISO],
    queryFn: async () => {
      const response = await axiosClient.get(`/api/diary?date=${dateISO}`);
      return response.data.data as DiaryDaySummary;
    },
  });
}

export function useExercises(dateISO: string) {
  return useQuery({
    queryKey: ["exercises", dateISO],
    queryFn: async () => {
      const response = await axiosClient.get(`/api/diary/exercises?date=${dateISO}`);
      return (response.data.data ?? []) as ExerciseLog[];
    },
  });
}

export function useAddMealEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDiaryEntryPayload) => {
      const response = await axiosClient.post(`/api/diary/entries`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary", variables.dateISO] });
    },
  });
}

export function useAddExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExercisePayload) => {
      const response = await axiosClient.post(`/api/diary/exercises`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary", variables.dateISO] });
      queryClient.invalidateQueries({ queryKey: ["exercises", variables.dateISO] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, dateISO }: { entryId: string; dateISO: string }) => {
      const response = await axiosClient.delete(`/api/diary/entries/${entryId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["diary", variables.dateISO] });
    },
  });
}
