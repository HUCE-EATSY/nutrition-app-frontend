import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { API_URLS } from '@/constants/api';
import { apiClient } from '@/services/apiClient';
import { userService } from '@/services/userService';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
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
      
      console.log('=== GOOGLE AUTH SUCCESS ===');
      console.log('ID Token:', idToken?.substring(0, 50) + '...');
      console.log('Full Response:', JSON.stringify(response, null, 2));
      
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

  const loginToBackend = async (idToken: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== CALLING BACKEND ===');
      console.log('URL:', API_URLS.auth.google);
      console.log('ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
      
      const res = await fetch(API_URLS.auth.google, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      console.log('Backend Response Status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Backend Error:', errorData);
        throw new Error(errorData.message || 'Backend login failed');
      }

      const { data } = await res.json();
      
      console.log('=== LOGIN SUCCESS ===');
      console.log('User ID:', data.userId);
      console.log('Email:', data.email);
      console.log('Is New User:', data.isNewUser);
      
      // Thêm dòng này để lấy token dùng cho Swagger
      console.log(">>> TOKEN DÙNG CHO SWAGGER:", data.accessToken);
      
      if (data.isNewUser === false) {
        completeOnboarding();
      }

      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        email: data.email,
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with database';
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', errorMessage);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Gọi backend để vô hiệu hoá refresh token
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await apiClient.post(API_URLS.auth.logout, { refreshToken });
      }
    } catch {
      // Lỗi logout backend không ảnh hưởng client
    } finally {
      clearAuth();
      resetOnboarding();
    }
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
      try {
        await userService.deleteAccount();
      } catch {
        // kể cả lỗi vẫn xóa local
      } finally {
        clearAuth();
        resetOnboarding();
      }
    },
    request,
  };
};

