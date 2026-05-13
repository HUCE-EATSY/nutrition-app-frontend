import axios from 'axios';
import { API_BASE } from '@/constants/api';
import { useAuthStore } from '@/hooks/store/authStore';

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Thêm interceptor để đính kèm token vào request
axiosClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response và lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Xử lý lỗi 401 (Unauthorized) - có thể refresh token ở đây
    if (error.response?.status === 401) {
      console.log('Phiên làm việc hết hạn');
      // Tùy chọn: Gọi refresh token hoặc logout
      // useAuthStore.getState().clearAuth();
    }
    
    // Ném lỗi ra ngoài để các hook xử lý
    const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosClient;
