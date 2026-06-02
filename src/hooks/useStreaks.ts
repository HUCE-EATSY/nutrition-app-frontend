import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streakService } from "@/services/streakService";

export type StreaksData = {
  streakDays: number;
  currentStreak: number;
  shieldCount: number;
  weeklyProgress: boolean[]; // length = 7 (T2..CN)
  challengeProgress: number; // 0..1
  isLoading: boolean;
  refetch: () => void;
  freezeStreak: () => Promise<void>;
  isFreezing: boolean;
  simLogStreak: () => Promise<void>;
  isSimulating: boolean;
  isLoggedToday: boolean;
};

export const STREAK_QUERY_KEYS = {
  all: ["streaks"] as const,
  me: () => [...STREAK_QUERY_KEYS.all, "me"] as const,
  leaderboard: () => [...STREAK_QUERY_KEYS.all, "leaderboard"] as const,
};

export function useStreaks(): StreaksData {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: STREAK_QUERY_KEYS.me(),
    queryFn: streakService.getStreak,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const freezeMutation = useMutation({
    mutationFn: streakService.useFreeze,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEYS.me() });
    },
  });

  const simLogMutation = useMutation({
    mutationFn: streakService.simLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEYS.me() });
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEYS.leaderboard() });
    },
  });

  const currentStreak = data?.currentStreak ?? 0;
  const shieldCount = data?.freezeCount ?? 0;
  const weeklyProgress = data?.weeklyProgress ?? [false, false, false, false, false, false, false];

  return {
    streakDays: currentStreak,
    currentStreak: currentStreak,
    shieldCount: shieldCount,
    weeklyProgress: weeklyProgress,
    challengeProgress: Math.min(currentStreak / 7, 1),
    isLoading,
    refetch,
    freezeStreak: async () => {
      await freezeMutation.mutateAsync();
    },
    isFreezing: freezeMutation.isPending,
    simLogStreak: async () => {
      await simLogMutation.mutateAsync();
    },
    isSimulating: simLogMutation.isPending,
    isLoggedToday: data?.isLoggedToday ?? false,
  };
}
