import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from './store/authStore';
import { useOnboardingStore } from './store/onboardingStore';
import { API_URLS } from '@/constants/api';
import Constants from 'expo-constants';

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
      const res = await fetch(API_URLS.auth.google, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Backend login failed');
      }

      const { data } = await res.json();
      
      if (data.isNewUser === false) {
        completeOnboarding();
      }

      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        email: data.email,
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with database';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

