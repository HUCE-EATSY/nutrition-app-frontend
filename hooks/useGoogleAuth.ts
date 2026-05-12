import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from './store/authStore';
import { API_URLS } from '@/constants/api';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token', // Yêu cầu Google trả về ID Token
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Trên Web, id_token thường nằm trong params
      const idToken = response.authentication?.idToken || response.params.id_token;
      
      if (idToken) {
        loginToBackend(idToken);
      } else {
        // Log chi tiết response để debug nếu vẫn không thấy idToken
        console.log('Google Auth Response:', JSON.stringify(response, null, 2));
        setError('Không tìm thấy ID Token từ Google. Hãy kiểm tra console log.');
      }
    } else if (response?.type === 'error') {
      setError('Google login failed');
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
      
      // data: { accessToken, refreshToken, userId, email, isNewUser }
      // Lưu vào Zustand store
      setAuth(data.accessToken, data.refreshToken, {
        id: data.userId,
        email: data.email,
        // Có thể bổ sung thêm các thông tin khác từ Google nếu Backend trả về
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to sync with database');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    clearAuth();
  };

  return {
    userInfo,
    isAuthenticated,
    loading,
    error,
    signIn: () => promptAsync(),
    logout,
    request,
  };
};
