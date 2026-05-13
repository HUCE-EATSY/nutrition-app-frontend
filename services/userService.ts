import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";
import { OnboardingDraft } from "../constants/types/contracts";
import {
  mockGetUserInfoResponse,
  mockOnboardingResponse,
  mockUpdateProfileResponse,
  mockUpdateGoalResponse,
} from "../constants/mocks/userMocks";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const activityLevelMap: Record<string, number> = {
  sedentary: 1,
  light: 2,
  moderate: 3,
  active: 4,
  very_active: 5,
};

export const userService = {
  /** POST /api/User/onboarding → UserGoalResponse */
  onboardUser: async (draft: OnboardingDraft) => {
    if (USE_MOCK) {
      await delay(500);
      return mockOnboardingResponse;
    }

    const body = {
      displayName: draft.nickname,
      gender: draft.gender === "male" ? 1 : 2,
      dateOfBirth: draft.birthDateISO?.split("T")[0],
      heightCm: draft.heightCm,
      weightKg: draft.currentWeightKg,
      goalWeightKg: draft.targetWeightKg,
      activityLevel: activityLevelMap[draft.activityLevel || "sedentary"],
    };

    try {
      const response = await apiClient.post(API_URLS.user.onboarding, body);
      return response.data.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorCode = errorData?.code || errorData?.extensions?.code;
      const errorDetail = errorData?.detail || errorData?.message || error.message;

      if (errorCode === "USER_ALREADY_ONBOARDED" || errorDetail?.includes("already onboarded")) {
        const infoRes = await apiClient.get(API_URLS.user.info);
        return infoRes.data.data?.activeGoal;
      }
      throw new Error(errorDetail || "Failed to onboard user");
    }
  },

  /** GET /api/User/info → GetUserInfoResponse { userId, profile, activeGoal, createdAt, updatedAt } */
  getUserInfo: async () => {
    if (USE_MOCK) {
      await delay(500);
      return mockGetUserInfoResponse;
    }
    const response = await apiClient.get(API_URLS.user.info);
    return response.data.data;
  },

  /** PUT /api/User/profile → UserProfileResponse */
  updateProfile: async (data: any) => {
    if (USE_MOCK) {
      await delay(500);
      return { ...mockUpdateProfileResponse, ...data };
    }
    const response = await apiClient.put(API_URLS.user.profile, data);
    return response.data.data;
  },

  /** PUT /api/User/goal → UserGoalUpdateResponse */
  updateGoal: async (data: any) => {
    if (USE_MOCK) {
      await delay(500);
      return { ...mockUpdateGoalResponse, ...data };
    }
    const response = await apiClient.put(API_URLS.user.goal, data);
    return response.data.data;
  },
};
