import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URLS } from "@/constants/api";
import { useAuthStore } from "@/hooks/store/authStore";
import { OnboardingDraft } from "@/constants/types/contracts";
import axiosClient from "./axiosClient";

export function useOnboardUser() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: OnboardingDraft) => {
      if (!accessToken) throw new Error("Not authenticated");

      const activityLevelMap: Record<string, number> = {
        sedentary: 1,
        light: 2,
        moderate: 3,
        active: 4,
        very_active: 5,
      };

      const body = {
        displayName: draft.nickname || "User",
        gender: draft.gender === "male" ? 1 : 2,
        dateOfBirth: draft.birthDateISO?.split("T")[0],
        heightCm: draft.heightCm,
        weightKg: draft.currentWeightKg,
        goalWeightKg: draft.targetWeightKg,
        activityLevel: activityLevelMap[draft.activityLevel || "sedentary"],
      };

      try {
        const response = await axiosClient.post(API_URLS.user.onboarding, body);
        return response.data.data;
      } catch (err: any) {
        // Kiểm tra nếu user đã onboarded
        const errorDetail = err.message || "";
        if (errorDetail.includes("already onboarded")) {
          console.log("User already onboarded, fetching existing info...");
          const infoRes = await axiosClient.get(API_URLS.user.info);
          return infoRes.data.data.activeGoal;
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "info"] });
    },
  });
}

export function useUserInfo() {
  const { accessToken } = useAuthStore();
  
  return useQuery({
    queryKey: ["user", "info"],
    queryFn: async () => {
      if (!accessToken) throw new Error("Not authenticated");
      const response = await axiosClient.get(API_URLS.user.info);
      return response.data.data;
    },
    enabled: !!accessToken,
    staleTime: 0,
    refetchOnMount: true,
  });
}
