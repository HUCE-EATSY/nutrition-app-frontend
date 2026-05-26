import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStorage } from "./secureStorage";

interface WaterState {
  waterLogs: Record<string, number>; // maps dateISO (YYYY-MM-DD) -> water intake in ml
  waterGoal: number; // daily goal in ml
  hydrated: boolean;

  setHydrated: (value: boolean) => void;
  setWaterGoal: (goal: number) => void;
  addWater: (dateISO: string, amount: number) => void;
  subtractWater: (dateISO: string, amount: number) => void;
  setWater: (dateISO: string, amount: number) => void;
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      waterLogs: {},
      waterGoal: 2000, // Default 2000 ml
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      setWaterGoal: (goal) => set({ waterGoal: goal }),

      addWater: (dateISO, amount) => {
        const logs = { ...get().waterLogs };
        const current = logs[dateISO] || 0;
        logs[dateISO] = current + amount;
        set({ waterLogs: logs });
      },

      subtractWater: (dateISO, amount) => {
        const logs = { ...get().waterLogs };
        const current = logs[dateISO] || 0;
        logs[dateISO] = Math.max(0, current - amount);
        set({ waterLogs: logs });
      },

      setWater: (dateISO, amount) => {
        const logs = { ...get().waterLogs };
        logs[dateISO] = Math.max(0, amount);
        set({ waterLogs: logs });
      },
    }),
    {
      name: "dnt-water-store",
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        waterLogs: state.waterLogs,
        waterGoal: state.waterGoal,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
