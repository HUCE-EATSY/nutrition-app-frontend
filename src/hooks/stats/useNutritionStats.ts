import { useEffect, useMemo } from "react";
import { useNutritionStore } from "@/store/statsStore";
import { NutritionPeriod, NUTRITION_PERIOD_LABELS } from "@/constants/stats";

export interface DateItem {
  dayOfWeek: string;
  date: number;
  fullDateStr: string;
}

function buildLast7Days(): DateItem[] {
  const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
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

  const dates = useMemo(() => buildLast7Days(), []);

  useEffect(() => {
    fetchSummary(selectedDate);
  }, [selectedDate]);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(NUTRITION_PERIOD_LABELS).find(
      key => NUTRITION_PERIOD_LABELS[key as NutritionPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as NutritionPeriod);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const summary = summaryCache[selectedDate] ?? null;

  return {
    period,
    activeTabLabel: NUTRITION_PERIOD_LABELS[period],
    tabs: Object.values(NUTRITION_PERIOD_LABELS),
    handleTabChange,
    
    dates,
    selectedDate,
    handleSelectDate,
    summary,
    isLoading,
    error,
  };
};
