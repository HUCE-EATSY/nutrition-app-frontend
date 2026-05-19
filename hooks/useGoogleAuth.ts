import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
  const { completeOnboarding, reset: resetOnboarding } = useOnboardingStore();

  const mutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await axiosClient.post(API_URLS.auth.google, { idToken });
      return response.data;
    },
    onSuccess: (json) => {
      const { data } = json;
      if (data.isNewUser === false) {
        completeOnboarding();
      }

      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        email: data.email,
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with database';
      setError(errorMessage);
      console.error(err);
    }
  });

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Google Auth Configured Web Client ID:', WEB_CLIENT_ID);
      console.log('EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID:', process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success' && response.data) {
        const idToken = response.data.idToken;
        if (idToken) {
          mutation.mutate(idToken);
        } else {
          setError('Không tìm thấy ID Token từ Google.');
        }
      } else {
        console.log('Google Sign-In response type:', response.type);
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
        setError('Đang xử lý đăng nhập Google.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
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
      await GoogleSignin.signOut();
    } catch (e) {
      console.error('Failed to sign out from Google:', e);
    }
    clearAuth();
    resetOnboarding();
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
