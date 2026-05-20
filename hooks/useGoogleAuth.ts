import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { API_URLS } from '@/constants/api';
import axiosClient from './api/axiosClient';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: false,
});

export const useGoogleAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();
  const { completeOnboarding, reset: resetOnboarding, setPublicFlowStep } = useOnboardingStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await axiosClient.post(API_URLS.auth.google, { idToken });
      return response.data;
    },
    onSuccess: (json) => {
      const { data } = json;

      // Clear query client cache to avoid cross-user/cross-session leaks
      queryClient.clear();

      // Thêm dòng này để lấy token dùng cho Swagger
      console.log(">>> TOKEN DÙNG CHO SWAGGER:", data.accessToken);

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
      if (refreshToken) {
        await axiosClient.post(API_URLS.auth.logout, { refreshToken });
      }
      await GoogleSignin.signOut();
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
    clearAuth();
    resetOnboarding();
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
      await logout();
    },
  };
};
