import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secureStorage";

export interface PrivacySettings {
  shareProfile: boolean;
  collectAnalytics: boolean;
  personalizedAds: boolean;
}

export interface NotificationConfig {
  mealReminders: boolean;
  waterReminders: boolean;
  stepsAlerts: boolean;
  dailyTips: boolean;
}

export interface SettingsState {
  hydrated: boolean;
  theme: "dark" | "light";
  language: "vi" | "en";
  unit: "kg" | "lbs";
  notificationsEnabled: boolean;
  notificationConfig: NotificationConfig;
  privacySettings: PrivacySettings;
  setHydrated: (value: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  setLanguage: (language: "vi" | "en") => void;
  setUnit: (unit: "kg" | "lbs") => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationConfig: (config: Partial<NotificationConfig>) => void;
  setPrivacySettings: (settings: Partial<PrivacySettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hydrated: false,
      theme: "dark",
      language: "vi",
      unit: "kg",
      notificationsEnabled: true,
      notificationConfig: {
        mealReminders: true,
        waterReminders: true,
        stepsAlerts: true,
        dailyTips: true,
      },
      privacySettings: {
        shareProfile: true,
        collectAnalytics: true,
        personalizedAds: false,
      },
      setHydrated: (hydrated) => set({ hydrated }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setUnit: (unit) => set({ unit }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setNotificationConfig: (config) =>
        set((state) => ({
          notificationConfig: { ...state.notificationConfig, ...config },
        })),
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
        notificationsEnabled: state.notificationsEnabled,
        notificationConfig: state.notificationConfig,
        privacySettings: state.privacySettings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
