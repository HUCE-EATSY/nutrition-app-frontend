import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { OnboardingDraft, UserProfile } from "@/types/contracts";

export const USER_QUERY_KEYS = {
  all: ["user"] as const,
  info: () => [...USER_QUERY_KEYS.all, "info"] as const,
};

export const useGetUserInfo = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.info(),
    queryFn: userService.getUserInfo,
  });
};

export const useOnboardUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: OnboardingDraft) => userService.onboardUser(draft),
    onSuccess: () => {
      // Invalidate and refetch user info after successful onboarding
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.info() });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.info() });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => userService.updateGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.info() });
    },
  });
};


