import axios from 'axios';
import { adminTokenStore } from './adminTokenStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5184/api';

// Admin API Client
const adminApiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin token
adminApiClient.interceptors.request.use(
  async (config) => {
    const token = adminTokenStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear and redirect to login
      adminTokenStore.clearToken();
      // You can add navigation logic here
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

export const adminAuth = {
  login: async (email: string, password: string) => {
    const response = await adminApiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      adminTokenStore.setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    adminTokenStore.clearToken();
  },

  checkAuth: async () => {
    const token = adminTokenStore.getToken();
    return !!token;
  },
};

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalFoods: number;
  totalExercises: number;
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'food' | 'exercise';
  action: string;
  description: string;
  timestamp: string;
}

export const adminDashboard = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await adminApiClient.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await adminApiClient.get('/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data;
  },
};

// ==================== USERS MANAGEMENT ====================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  role?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const adminUsers = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await adminApiClient.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<AdminUser> => {
    const response = await adminApiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await adminApiClient.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await adminApiClient.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await adminApiClient.delete(`/users/${id}`);
  },

  updateStatus: async (id: string, isActive: boolean): Promise<void> => {
    await adminApiClient.put(`/users/${id}/status`, { isActive });
  },

  getStats: async (): Promise<UserStats> => {
    const response = await adminApiClient.get('/users/stats');
    return response.data;
  },
};

// ==================== FOODS MANAGEMENT ====================

export interface AdminFood {
  id: number;
  nameVi: string;
  nameEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
  category?: string;
}

export interface FoodStats {
  total: number;
  avgCalories: number;
  lowCalCount: number;
}

export const adminFoods = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
  }): Promise<PaginatedResponse<AdminFood>> => {
    const response = await adminApiClient.get('/foods', { params });
    return response.data;
  },

  getById: async (id: number): Promise<AdminFood> => {
    const response = await adminApiClient.get(`/foods/${id}`);
    return response.data;
  },

  create: async (data: Partial<AdminFood>): Promise<AdminFood> => {
    const response = await adminApiClient.post('/foods', data);
    return response.data;
  },

  update: async (id: number, data: Partial<AdminFood>): Promise<AdminFood> => {
    const response = await adminApiClient.put(`/foods/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await adminApiClient.delete(`/foods/${id}`);
  },

  getStats: async (): Promise<FoodStats> => {
    const response = await adminApiClient.get('/foods/stats');
    return response.data;
  },

  bulkImport: async (file: FormData): Promise<{ success: number; failed: number }> => {
    const response = await adminApiClient.post('/foods/bulk-import', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// ==================== EXERCISES MANAGEMENT ====================

export interface AdminExercise {
  id: number;
  nameVi: string;
  nameEn: string;
  metValue: number;
  categoryId: number;
  categoryName?: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface ExerciseStats {
  total: number;
  active: number;
  avgMet: number;
}

export const adminExercises = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
    status?: 'active' | 'inactive';
  }): Promise<PaginatedResponse<AdminExercise>> => {
    const response = await adminApiClient.get('/exercises', { params });
    return response.data;
  },

  getById: async (id: number): Promise<AdminExercise> => {
    const response = await adminApiClient.get(`/exercises/${id}`);
    return response.data;
  },

  create: async (data: Partial<AdminExercise>): Promise<AdminExercise> => {
    const response = await adminApiClient.post('/exercises', data);
    return response.data;
  },

  update: async (id: number, data: Partial<AdminExercise>): Promise<AdminExercise> => {
    const response = await adminApiClient.put(`/exercises/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await adminApiClient.delete(`/exercises/${id}`);
  },

  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await adminApiClient.put(`/exercises/${id}/status`, { isActive });
  },

  getStats: async (): Promise<ExerciseStats> => {
    const response = await adminApiClient.get('/exercises/stats');
    return response.data;
  },
};

export default adminApiClient;
