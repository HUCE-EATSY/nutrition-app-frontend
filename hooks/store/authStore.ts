import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secureStorage";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: any | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string | null, userInfo: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isAuthenticated: false,
      setAuth: (accessToken, refreshToken, userInfo) =>
        set({ accessToken, refreshToken, userInfo, isAuthenticated: true }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, userInfo: null, isAuthenticated: false }),
    }),
    {
      name: "dnt-auth-store",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
