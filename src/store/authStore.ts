import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserInfo } from "@/types/contracts";
import { secureStorage } from "./secureStorage";

interface AuthState {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  /** True while we're verifying the user's profile after login (prevents premature routing) */
  isVerifyingProfile: boolean;
  setHydrated: (value: boolean) => void;
  setAuth: (accessToken: string, refreshToken: string | null, userInfo: UserInfo) => void;
  setVerifyingProfile: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      isAuthenticated: false,
      isVerifyingProfile: false,
      setHydrated: (value: boolean) => set({ hydrated: value }),
      setAuth: (accessToken, refreshToken, userInfo) =>
          set({ accessToken, refreshToken, userInfo, isAuthenticated: true }),
      setVerifyingProfile: (value: boolean) => set({ isVerifyingProfile: value }),
      clearAuth: () =>
          set({ accessToken: null, refreshToken: null, userInfo: null, isAuthenticated: false, isVerifyingProfile: false }),
    }),
    {
      name: "dnt-auth-store",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
