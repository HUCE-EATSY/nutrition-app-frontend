import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DiaryEntry, DiaryHourSlot } from "@/constants/types/contracts";
import { getTodayDateISO } from "@/hooks/utils/date";
import { diarySummary as mockSummary } from "@/constants/mocks/data";

// ─── Types ───────────────────────────────────────────────────────────────────

type DiaryStoreState = {
  // Ngày đang chọn (chia sẻ giữa Dashboard và Diary tab)
  selectedDateISO: string;

  // Danh sách entries theo từng ngày: key là dateISO
  entriesByDate: Record<string, DiaryEntry[]>;

  // Mục tiêu dinh dưỡng (tạm thời hard-code, sau sẽ lấy từ NutritionPlan)
  targetCalories: number;
  targetProteinGram: number;
  targetCarbGram: number;
  targetFatGram: number;

  // Actions
  setSelectedDate: (dateISO: string) => void;
  addEntry: (entry: DiaryEntry) => void;
  removeEntry: (dateISO: string, entryId: string) => void;
};

// ─── Computed selectors (dùng ngoài store, không cần persist) ────────────────

export function getEntriesForDate(
  entriesByDate: Record<string, DiaryEntry[]>,
  dateISO: string
): DiaryEntry[] {
  return entriesByDate[dateISO] ?? [];
}

export function getSlotsForDate(
  entriesByDate: Record<string, DiaryEntry[]>,
  dateISO: string
): DiaryHourSlot[] {
  const entries = getEntriesForDate(entriesByDate, dateISO);
  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 → 23:00
  return hours.map((hour) => ({
    hour,
    entries: entries.filter((e) => e.hour === hour),
  }));
}

export function getTotalsForDate(
  entriesByDate: Record<string, DiaryEntry[]>,
  dateISO: string
) {
  const entries = getEntriesForDate(entriesByDate, dateISO);
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinGram: acc.proteinGram + entry.proteinGram,
      carbGram: acc.carbGram + entry.carbGram,
      fatGram: acc.fatGram + entry.fatGram,
    }),
    { calories: 0, proteinGram: 0, carbGram: 0, fatGram: 0 }
  );
}

// ─── Seed dữ liệu mock cho ngày hôm nay (để UI không rỗng lúc dev) ───────────

function buildInitialEntries(): Record<string, DiaryEntry[]> {
  const todayISO = getTodayDateISO();
  const entries: DiaryEntry[] = mockSummary.slots.flatMap((slot) =>
    slot.entries.map((e) => ({ ...e, dateISO: todayISO }))
  );
  return { [todayISO]: entries };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDiaryStore = create<DiaryStoreState>()(
  persist(
    (set) => ({
      selectedDateISO: getTodayDateISO(),
      entriesByDate: buildInitialEntries(),

      // Mục tiêu mặc định (lấy từ mock; sau thay bằng NutritionPlan)
      targetCalories: mockSummary.targetCalories,
      targetProteinGram: mockSummary.targetProteinGram,
      targetCarbGram: mockSummary.targetCarbGram,
      targetFatGram: mockSummary.targetFatGram,

      setSelectedDate: (dateISO) => set({ selectedDateISO: dateISO }),

      addEntry: (entry) =>
        set((state) => {
          const existing = state.entriesByDate[entry.dateISO] ?? [];
          return {
            entriesByDate: {
              ...state.entriesByDate,
              [entry.dateISO]: [...existing, entry],
            },
          };
        }),

      removeEntry: (dateISO, entryId) =>
        set((state) => {
          const existing = state.entriesByDate[dateISO] ?? [];
          return {
            entriesByDate: {
              ...state.entriesByDate,
              [dateISO]: existing.filter((e) => e.id !== entryId),
            },
          };
        }),
    }),
    {
      name: "dnt-diary-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist dữ liệu thực, không persist selectedDate
      partialize: (state) => ({
        entriesByDate: state.entriesByDate,
        targetCalories: state.targetCalories,
        targetProteinGram: state.targetProteinGram,
        targetCarbGram: state.targetCarbGram,
        targetFatGram: state.targetFatGram,
      }),
    }
  )
);
