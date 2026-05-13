import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { API_URLS } from '@/constants/api';
import axiosClient from './api/axiosClient';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();
  const { completeOnboarding, reset: resetOnboarding } = useOnboardingStore();

  // Tạo redirectUri phù hợp cho cả Expo Go và Standalone app
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'nutritionappfrontend',
  });


  const [request, response, promptAsync] = Google.useAuthRequest({
    // Quan trọng: Khi chạy trên Expo Go, Google Provider thường ưu tiên webClientId
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    // iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID,
    
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params.id_token;
      
      if (idToken) {
        loginToBackend(idToken);
      } else {
        console.log('Google Auth Response:', JSON.stringify(response, null, 2));
        setError('Không tìm thấy ID Token từ Google.');
      }
    } else if (response?.type === 'error') {
      console.error('Google Auth Error Response:', response);
      setError('Google login failed: ' + (response.error?.message || 'Unknown error'));
    }
  }, [response]);

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

  const loginToBackend = (idToken: string) => {
    mutation.mutate(idToken);
  };

  const loading = mutation.isPending;

  const logout = async () => {
    clearAuth();
    resetOnboarding();
  };

  return {
    userInfo,
    isAuthenticated,
    loading,
    error,
    signIn: () => {
      console.log('Attempting sign in with Redirect URI:', redirectUri);
      return promptAsync();
    },
    logout,
    deleteAccount: async () => {
      clearAuth();
      resetOnboarding();
    },
    request,
  };
};
