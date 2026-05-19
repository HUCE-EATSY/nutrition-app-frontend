import { Platform } from 'react-native';

/**
 * Địa chỉ API Backend
 */
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback for different platforms if .env is missing
  if (Platform.OS === 'web') {
    return "http://localhost:5184";
  }
  return "http://192.168.100.215:5184";
};

export const API_BASE = getBaseUrl();
export const API_URLS = {
  auth: {
    google: `${API_BASE}/api/Auth/google`,
    refresh: `${API_BASE}/api/Auth/refresh`,
    logout: `${API_BASE}/api/Auth/logout`,
  },
  diary: `${API_BASE}/api/diary`,
  food: `${API_BASE}/api/food`,
  user: {
    onboarding: `${API_BASE}/api/User/onboarding`,
    profile: `${API_BASE}/api/User/profile`,
    goal: `${API_BASE}/api/User/goal`,
    info: `${API_BASE}/api/User/info`,
  }
};
