import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useStepsStore } from '@/store/statsStore';
import { API_URLS } from '@/constants/api';
import { apiClient } from '@/services/apiClient';
import { userService } from '@/services/userService';

let GoogleSignin: any = null;
let statusCodes: any = {};
let isGoogleSigninSupported = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GoogleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleModule.GoogleSignin;
  statusCodes = GoogleModule.statusCodes;

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  isGoogleSigninSupported = true;
} catch (e) {
  console.warn('Google Sign-In is not supported in this environment (missing native module).', e);
}

export const useGoogleAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();
  const { completeOnboarding, reset: resetOnboarding, setPublicFlowStep } = useOnboardingStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (idToken: string) => {
      if (process.env.EXPO_PUBLIC_USE_MOCK === "true") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          data: {
            isNewUser: true, // Thay đổi thành true nếu bạn muốn kiểm tra luồng Onboarding
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            userId: "mock-user-id-0001-0000-000000000000",
            email: "mock-user@gmail.com",
          }
        };
      }
      const response = await apiClient.post(API_URLS.auth.google, { idToken });
      return response.data;
    },
    onSuccess: (json) => {
      const { data } = json;

      // Clear query client cache to avoid cross-user/cross-session leaks
      queryClient.clear();

      if (data.isNewUser === false) {
        completeOnboarding();
      } else {
        setPublicFlowStep("mascot-intro");
      }

      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        email: data.email,
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with database';
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', errorMessage);
      setError(errorMessage);
      console.error(err);
    }
  });

  const signIn = async () => {
    if (process.env.EXPO_PUBLIC_USE_MOCK === "true") {
      setLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        mutation.mutate('mock-google-id-token');
      } catch (err: any) {
        setError(err.message || 'Đăng nhập Google giả lập thất bại.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isGoogleSigninSupported || !GoogleSignin) {
      setError('Google Sign-In không khả dụng trên thiết bị/trình giả lập này (thiếu Native Module). Vui lòng build lại ứng dụng bằng lệnh: npx expo run:android');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success' && response.data) {
        const idToken = response.data.idToken;
        if (idToken) {
          mutation.mutate(idToken);
        } else {
          setError('Không tìm thấy ID Token từ Google.');
        }
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // Hủy đăng nhập - không làm gì thêm
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Đang xử lý đăng nhập Google.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services không khả dụng hoặc chưa được cập nhật.');
      } else {
        console.error('Google Sign-In error:', err);
        setError(err.message || 'Đăng nhập Google thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Gọi backend để vô hiệu hoá refresh token
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken && process.env.EXPO_PUBLIC_USE_MOCK !== "true") {
        await apiClient.post(API_URLS.auth.logout, { refreshToken });
      }
      if (isGoogleSigninSupported && GoogleSignin && process.env.EXPO_PUBLIC_USE_MOCK !== "true") {
        await GoogleSignin.signOut();
      }
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
    clearAuth();
    resetOnboarding();
    useStepsStore.getState().reset();
    queryClient.clear();
  };

  return {
    userInfo,
    isAuthenticated,
    loading: loading || mutation.isPending,
    error,
    signIn,
    logout,
    deleteAccount: async () => {
      await userService.deleteAccount();
      await logout();
    },
  };
};
