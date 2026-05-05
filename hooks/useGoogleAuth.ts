import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from './store/authStore';

WebBrowser.maybeCompleteAuthSession();

// Replace with your own client IDs from Google Cloud Console
const GOOGLE_CLIENT_ID = '714322223749-0ijdvg2otoh476mp2m01ci4l4dh56qrv.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({
      preferLocalhost: true,
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        getUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setError('Google login failed');
    }
  }, [response]);

  const getUserInfo = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await res.json();
      
      // Store in Zustand (which persists to SecureStore)
      setAuth(token, null, user);
      
    } catch (err) {
      setError('Failed to fetch user info');
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
