import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secureStorage";

export interface PrivacySettings {
  shareProfile: boolean;
  collectAnalytics: boolean;
  personalizedAds: boolean;
}

export interface SettingsState {
  hydrated: boolean;
  theme: "dark" | "light";
  language: "vi" | "en";
  unit: "kg" | "lbs";
  privacySettings: PrivacySettings;
  setHydrated: (value: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  setLanguage: (language: "vi" | "en") => void;
  setUnit: (unit: "kg" | "lbs") => void;
  setPrivacySettings: (settings: Partial<PrivacySettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hydrated: false,
      theme: "dark",
      language: "vi",
      unit: "kg",
      privacySettings: {
        shareProfile: true,
        collectAnalytics: true,
        personalizedAds: false,
      },
      setHydrated: (hydrated) => set({ hydrated }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setUnit: (unit) => set({ unit }),
      setPrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),
    }),
    {
      name: "dnt-settings-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        unit: state.unit,
        privacySettings: state.privacySettings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

