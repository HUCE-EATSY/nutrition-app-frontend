import axios from "axios";
import { API_BASE } from "../constants/api";
import { useAuthStore } from "../hooks/store/authStore";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand store
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors here (e.g., token expiration, 401)
    if (error.response?.status === 401) {
      // Trigger logout or refresh token logic
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);
