import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { adminTokenStore } from '../../services/adminTokenStore';
import { create } from 'zustand';

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  checkAuth: () => Promise<boolean>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  checkAuth: async () => {
    try {
      const token = adminTokenStore.getToken();
      const isAuth = !!token;
      set({ isAuthenticated: isAuth, isLoading: false });
      return isAuth;
    } catch (error) {
      console.error('[AdminAuth] Error checking admin auth:', error);
      set({ isAuthenticated: false, isLoading: false });
      return false;
    }
  },
}));

// NOTE: checkAuth() được gọi trong useEffect bên trong hook để tránh
// async setState xảy ra trong commit phase của React (gây infinite loop).

/**
 * Hook quản lý admin authentication — hoàn toàn tách biệt khỏi authStore chung.
 * Chỉ dùng 'adminToken' trong in-memory store, không ảnh hưởng tới user thường.
 */
export function useAdminAuth() {
  const router = useRouter();
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const isLoading = useAdminAuthStore((state) => state.isLoading);
  const setAuthenticated = useAdminAuthStore((state) => state.setAuthenticated);
  const checkAuth = useAdminAuthStore((state) => state.checkAuth);

  // Chạy checkAuth sau khi component mount — an toàn với React commit phase
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    try {
      adminTokenStore.clearToken();
      setAuthenticated(false);
      router.replace('/admin/login');
    } catch (error) {
      console.error('[AdminAuth] Error logging out:', error);
    }
  }, [router, setAuthenticated]);

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
}
