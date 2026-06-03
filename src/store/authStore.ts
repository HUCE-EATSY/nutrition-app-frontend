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
  // ─── Premium Status ───────────────────────────────────────────────
  isPremium: boolean;
  premiumPlan: string | null;
  premiumExpiresAt: string | null;
  // ─── Actions ──────────────────────────────────────────────────────
  setHydrated: (value: boolean) => void;
  setAuth: (accessToken: string, refreshToken: string | null, userInfo: UserInfo) => void;
  setVerifyingProfile: (value: boolean) => void;
  clearAuth: () => void;
  /** Cập nhật trạng thái Premium sau khi fetch /api/Subscription/me */
  setPremiumStatus: (isPremium: boolean, planCode?: string, expiresAt?: string) => void;
  /** Xoá trạng thái Premium (dùng khi logout) */
  clearPremiumStatus: () => void;
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
      isPremium: false,
      premiumPlan: null,
      premiumExpiresAt: null,
      setHydrated: (value: boolean) => set({ hydrated: value }),
      setAuth: (accessToken, refreshToken, userInfo) =>
          set({ accessToken, refreshToken, userInfo, isAuthenticated: true }),
      setVerifyingProfile: (value: boolean) => set({ isVerifyingProfile: value }),
      clearAuth: () =>
          set({
            accessToken: null,
            refreshToken: null,
            userInfo: null,
            isAuthenticated: false,
            isVerifyingProfile: false,
            isPremium: false,
            premiumPlan: null,
            premiumExpiresAt: null,
          }),
      setPremiumStatus: (isPremium, planCode, expiresAt) =>
          set({
            isPremium,
            premiumPlan: planCode ?? null,
            premiumExpiresAt: expiresAt ?? null,
          }),
      clearPremiumStatus: () =>
          set({ isPremium: false, premiumPlan: null, premiumExpiresAt: null }),
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
