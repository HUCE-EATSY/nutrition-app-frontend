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

const WEEKDAY_LABELS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

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
    weekOffset,
    weeklyTimeline,
    isLoadingWeek,
    setWeekOffset,
    fetchWeeklyTimeline,
  } = useNutritionStore();

  const language = useSettingsStore((state) => state.language);
  const dates = useMemo(() => buildLast7Days(language), [language]);

  // Fetch dữ liệu ngày khi tab "Ngày" được chọn
  useEffect(() => {
    if (period === NutritionPeriod.DAY) {
      fetchSummary(selectedDate);
    }
  }, [selectedDate, period, fetchSummary]);

  // Fetch dữ liệu tuần khi tab "Tuần" được chọn hoặc offset thay đổi
  useEffect(() => {
    if (period === NutritionPeriod.WEEK) {
      fetchWeeklyTimeline(weekOffset);
    }
  }, [period, weekOffset, fetchWeeklyTimeline]);

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

  // --- Computed: Dữ liệu ngày ---
  const summary = summaryCache[selectedDate] ?? null;

  // --- Computed: Dữ liệu tuần (BarChart) ---
  // Mảng 7 phần tử, label = tên thứ, value = tổng calo tiêu thụ
  const barChartData = weeklyTimeline.map((item) => ({
    label: WEEKDAY_LABELS_VI[new Date(item.date).getDay()],
    value: Number(item.total_calories),
  }));

  // Calo mục tiêu (lấy từ ngày đầu tiên, chung cho cả tuần)
  const targetCalories = weeklyTimeline.length > 0 && weeklyTimeline[0].target
    ? Number(weeklyTimeline[0].target.target_calories)
    : 0;

  // Trung bình calo & macro chia cho 7 ngày của cả tuần (ngày chưa log = 0)
  const totalDays = weeklyTimeline.length || 7;
  const weeklyAvgCalories = weeklyTimeline.length > 0
    ? Math.round(weeklyTimeline.reduce((sum, d) => sum + Number(d.total_calories), 0) / totalDays)
    : 0;

  // Trung bình macro tuần
  const weeklyAvgProtein = weeklyTimeline.length > 0
    ? Math.round(weeklyTimeline.reduce((sum, d) => sum + Number(d.total_protein_g), 0) / totalDays)
    : 0;
  const weeklyAvgCarbs = weeklyTimeline.length > 0
    ? Math.round(weeklyTimeline.reduce((sum, d) => sum + Number(d.total_carbs_g), 0) / totalDays)
    : 0;
  const weeklyAvgFat = weeklyTimeline.length > 0
    ? Math.round(weeklyTimeline.reduce((sum, d) => sum + Number(d.total_fat_g), 0) / totalDays)
    : 0;

  // Điều hướng tuần
  const handlePrevWeek = () => setWeekOffset(weekOffset - 1);
  const handleNextWeek = () => {
    if (weekOffset < 0) setWeekOffset(weekOffset + 1);
  };
  const canGoNext = weekOffset < 0;

  return {
    period,
    activeTabLabel: getPeriodLabel(period),
    tabs: Object.values(NutritionPeriod).map(getPeriodLabel),
    handleTabChange,

    // Tab Ngày
    dates,
    selectedDate,
    handleSelectDate,
    summary,
    isLoading,
    error,

    // Tab Tuần
    weekOffset,
    barChartData,
    targetCalories,
    weeklyAvgCalories,
    weeklyAvgProtein,
    weeklyAvgCarbs,
    weeklyAvgFat,
    isLoadingWeek,
    handlePrevWeek,
    handleNextWeek,
    canGoNext,
    weeklyTimeline,
  };
};
