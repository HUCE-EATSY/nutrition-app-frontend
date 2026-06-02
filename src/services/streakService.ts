import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

export type StreakMeResponse = {
  currentStreak: number;
  longestStreak: number;
  freezeCount: number;
  weeklyProgress: boolean[];
  isLoggedToday: boolean;
};

export type LeaderboardUser = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  currentStreak: number;
  longestStreak: number;
};

export const streakService = {
  getStreak: async (): Promise<StreakMeResponse> => {
    const response = await apiClient.get(API_URLS.streaks.me);
    return response.data.data;
  },

  useFreeze: async (): Promise<{ freezeCount: number }> => {
    const response = await apiClient.post(API_URLS.streaks.freeze);
    return response.data.data;
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    const response = await apiClient.get(API_URLS.streaks.leaderboard);
    return response.data.data;
  },

  simLog: async (): Promise<{ currentStreak: number }> => {
    const response = await apiClient.post(API_URLS.streaks.simLog);
    return response.data.data;
  },
};


