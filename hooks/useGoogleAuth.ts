import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Replace with your own client IDs from Google Cloud Console
// For Expo Go development, you often use the Web Client ID with the Expo Proxy.
const GOOGLE_WEB_CLIENT_ID = '714322223749-0ijdvg2otoh476mp2m01ci4l4dh56qrv.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = ''; // Thêm iOS Client ID từ Google Console
const GOOGLE_ANDROID_CLIENT_ID = ''; // Thêm Android Client ID từ Google Console

const redirectUri = AuthSession.makeRedirectUri();

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, userInfo, isAuthenticated } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri,
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
