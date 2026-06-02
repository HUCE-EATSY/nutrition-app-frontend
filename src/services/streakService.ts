import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

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
    if (USE_MOCK) {
      return {
        currentStreak: 3,
        longestStreak: 10,
        freezeCount: 2,
        weeklyProgress: [true, true, true, false, false, false, false],
        isLoggedToday: false,
      };
    }
    const response = await apiClient.get(API_URLS.streaks.me);
    return response.data.data;
  },

  useFreeze: async (): Promise<{ freezeCount: number }> => {
    const response = await apiClient.post(API_URLS.streaks.freeze);
    return response.data.data;
  },

  getLeaderboard: async (): Promise<LeaderboardUser[]> => {
    if (USE_MOCK) {
      return [
        { userId: "1", displayName: "Nguyễn Văn A", avatarUrl: null, currentStreak: 12, longestStreak: 15 },
        { userId: "2", displayName: "Trần Thị B", avatarUrl: null, currentStreak: 8, longestStreak: 10 },
      ];
    }
    const response = await apiClient.get(API_URLS.streaks.leaderboard);
    return response.data.data;
  },

  simLog: async (): Promise<{ currentStreak: number }> => {
    if (USE_MOCK) {
      return { currentStreak: 5 };
    }
    const response = await apiClient.post(API_URLS.streaks.simLog);
    return response.data.data;
  },
};
