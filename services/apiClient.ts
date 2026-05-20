import axios from "axios";
import { API_BASE, API_URLS } from "../constants/api";
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
    // Bỏ qua trang cảnh báo của ngrok free để tránh lỗi CORS/JSON parsing ở client
    config.headers["ngrok-skip-browser-warning"] = "true";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tránh vòng lặp vô hạn khi chính API refresh bị 401
    if (originalRequest && error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== API_URLS.auth.refresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      const userInfo = useAuthStore.getState().userInfo;

      if (refreshToken) {
        try {
          // Gửi request bằng axios gốc để tránh trigger interceptor đè lên hoặc vòng lặp
          const response = await axios.post(API_URLS.auth.refresh, {
            refreshToken: refreshToken,
          });

          const resData = response.data?.data ?? response.data;
          if (resData && resData.accessToken) {
            const nextAccessToken = resData.accessToken;
            const nextRefreshToken = resData.refreshToken || refreshToken;
            
            // Cập nhật Zustand store
            if (userInfo) {
              useAuthStore.getState().setAuth(nextAccessToken, nextRefreshToken, userInfo);
            }
            
            processQueue(null, nextAccessToken);
            originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
            isRefreshing = false;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);

// Public API client without authentication
export const publicApiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
