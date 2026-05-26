import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";
import { OnboardingDraft } from "@/types/contracts";
import { Platform } from "react-native";
import { useAuthStore } from "../store/authStore";
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

const goalTypeMap: Record<string, number> = {
  lose_weight: 1,
  gain_weight: 2,
  maintain_weight: 3,
};

export const userService = {
  /** POST /api/User/onboarding → UserGoalResponse */
  onboardUser: async (draft: OnboardingDraft) => {
    if (USE_MOCK) {
      await delay(500);
      return mockOnboardingResponse;
    }

    console.log("userService.onboardUser called with draft:", JSON.stringify(draft, null, 2));

    const emailPrefix = useAuthStore.getState().userInfo?.email?.split("@")[0];
    const body = {
      displayName: draft.nickname || emailPrefix || "User",
      gender: draft.gender === "male" ? 1 : 2,
      dateOfBirth: draft.birthDateISO?.split("T")[0] ?? "2000-01-01",
      heightCm: draft.heightCm ?? 170,
      weightKg: draft.currentWeightKg ?? 60,
      goalWeightKg: draft.targetWeightKg ?? draft.currentWeightKg ?? 60,
      activityLevel: activityLevelMap[draft.activityLevel || "sedentary"],
      goalType: goalTypeMap[draft.goalType || "maintain_weight"],
    };

    console.log("userService.onboardUser sending body:", JSON.stringify(body, null, 2));


    try {
      const response = await apiClient.post(API_URLS.user.onboarding, body);
      return response.data.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorCode = errorData?.code || errorData?.extensions?.code;
      let errorDetail = errorData?.detail || errorData?.message || error.message;

      if (errorData?.errors && typeof errorData.errors === "object") {
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const msgStr = Array.isArray(messages) ? messages.join(", ") : String(messages);
            return `${field}: ${msgStr}`;
          })
          .join("; ");
        if (validationErrors) {
          errorDetail = `${errorDetail} (${validationErrors})`;
        }
      }

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

  /** POST /api/User/avatar → upload avatar (multipart/form-data) */
  uploadAvatar: async (imageUri: string, mimeType = 'image/jpeg'): Promise<{ avatarUrl: string }> => {
    if (USE_MOCK) {
      await delay(500);
      return { avatarUrl: imageUri };
    }
    const form = new FormData();
    
    if (Platform.OS === 'web') {
      // Trên Web, cần fetch blob từ URI và append blob thực tế vào FormData
      const res = await fetch(imageUri);
      const blob = await res.blob();
      form.append('avatar', blob, 'avatar.jpg');
    } else {
      // Trên Mobile, append object dạng { uri, name, type }
      form.append('avatar', {
        uri: imageUri,
        name: 'avatar.jpg',
        type: mimeType,
      } as any);
    }

    const response = await apiClient.post(API_URLS.user.avatar, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    const raw = response.data.data ?? response.data;
    
    // Backend trả về snake_case: { avatar_url: "..." }, chuẩn hóa về camelCase để khớp Destructure
    return {
      avatarUrl: raw?.avatar_url ?? raw?.avatarUrl ?? ""
    };
  },

  /** DELETE /api/User/account → xóa tài khoản */
  deleteAccount: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(500);
      return;
    }
    await apiClient.delete(API_URLS.user.account);
  },
};
