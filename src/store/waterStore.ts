import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secureStorage";

export interface UserWater {
  waterLogs: Record<string, number>; // maps dateISO (YYYY-MM-DD) -> water intake in ml
  waterGoal: number; // daily goal in ml
  defaultStep: number; // default step in ml
}

interface WaterState {
  userWaterData: Record<string, UserWater>; // maps userId (or "guest") -> UserWater
  hydrated: boolean;

  setHydrated: (value: boolean) => void;
  setWaterGoal: (userId: string, goal: number) => void;
  setDefaultStep: (userId: string, step: number) => void;
  addWater: (userId: string, dateISO: string, amount: number) => void;
  subtractWater: (userId: string, dateISO: string, amount: number) => void;
  setWater: (userId: string, dateISO: string, amount: number) => void;
}

const DEFAULT_USER_WATER: UserWater = {
  waterLogs: {},
  waterGoal: 2000, // Default 2000 ml
  defaultStep: 250, // Default step 250 ml
};

const getUserWater = (userWaterData: Record<string, UserWater>, userId: string): UserWater => {
  return userWaterData[userId] || { ...DEFAULT_USER_WATER };
};

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      userWaterData: {},
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      setWaterGoal: (userId, goal) => {
        const data = { ...get().userWaterData };
        const userWater = getUserWater(data, userId);
        const finalGoal = Math.min(10000, Math.max(1, goal));
        data[userId] = { ...userWater, waterGoal: finalGoal };
        set({ userWaterData: data });
      },

      setDefaultStep: (userId, step) => {
        const data = { ...get().userWaterData };
        const userWater = getUserWater(data, userId);
        const finalStep = Math.min(2000, Math.max(1, step));
        data[userId] = { ...userWater, defaultStep: finalStep };
        set({ userWaterData: data });
      },

      addWater: (userId, dateISO, amount) => {
        const data = { ...get().userWaterData };
        const userWater = getUserWater(data, userId);
        const logs = { ...userWater.waterLogs };
        const current = logs[dateISO] || 0;
        logs[dateISO] = Math.min(10000, current + amount);
        data[userId] = { ...userWater, waterLogs: logs };
        set({ userWaterData: data });
      },

      subtractWater: (userId, dateISO, amount) => {
        const data = { ...get().userWaterData };
        const userWater = getUserWater(data, userId);
        const logs = { ...userWater.waterLogs };
        const current = logs[dateISO] || 0;
        logs[dateISO] = Math.max(0, current - amount);
        data[userId] = { ...userWater, waterLogs: logs };
        set({ userWaterData: data });
      },

      setWater: (userId, dateISO, amount) => {
        const data = { ...get().userWaterData };
        const userWater = getUserWater(data, userId);
        const logs = { ...userWater.waterLogs };
        logs[dateISO] = Math.min(10000, Math.max(0, amount));
        data[userId] = { ...userWater, waterLogs: logs };
        set({ userWaterData: data });
      },
    }),
    {
      name: "dnt-water-store",
      storage: createJSONStorage(() => secureStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || (persistedState && persistedState.waterLogs)) {
          // Migrate old single-user schema to multi-user format under key 'guest'
          return {
            userWaterData: {
              guest: {
                waterLogs: persistedState.waterLogs || {},
                waterGoal: persistedState.waterGoal || 2000,
                defaultStep: persistedState.defaultStep || 250,
              },
            },
          };
        }
        return persistedState as any;
      },
      partialize: (state) => ({
        userWaterData: state.userWaterData,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
