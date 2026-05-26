import { useEffect, useMemo } from "react";
import { useNutritionStore } from "@/store/statsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { NutritionPeriod, NUTRITION_PERIOD_LABELS } from "@/constants/stats";

export interface DateItem {
  dayOfWeek: string;
  date: number;
  fullDateStr: string;
}

function buildLast7Days(lang: string): DateItem[] {
  const DOW = lang === "vi"
    ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    : ["S", "M", "T", "W", "T", "F", "S"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dayOfWeek: DOW[d.getDay()],
      date: d.getDate(),
      fullDateStr: d.toISOString().slice(0, 10),
    };
  });
}

export const useNutritionStats = () => {
  const {
    period,
    setPeriod,
    selectedDate,
    summaryCache,
    isLoading,
    error,
    setSelectedDate,
    fetchSummary,
  } = useNutritionStore();

  const language = useSettingsStore((state) => state.language);
  const dates = useMemo(() => buildLast7Days(language), [language]);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate, fetchSummary]);

  const getPeriodLabel = (p: NutritionPeriod) => {
    if (language === "en") {
      if (p === NutritionPeriod.DAY) return "Day";
      if (p === NutritionPeriod.WEEK) return "Week";
    }
    return NUTRITION_PERIOD_LABELS[p];
  };

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.values(NutritionPeriod).find(
      (p) => getPeriodLabel(p) === tab
    );
    if (selectedKey) setPeriod(selectedKey);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const summary = summaryCache[selectedDate] ?? null;

  return {
    period,
    activeTabLabel: getPeriodLabel(period),
    tabs: Object.values(NutritionPeriod).map(getPeriodLabel),
    handleTabChange,
    
    dates,
    selectedDate,
    handleSelectDate,
    summary,
    isLoading,
    error,
  };
};
