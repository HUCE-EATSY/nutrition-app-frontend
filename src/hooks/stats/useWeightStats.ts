import { useEffect } from "react";
import { useWeightStore } from "@/store/statsStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { WeightPeriod, WEIGHT_PERIOD_LABELS } from "@/constants/stats";

export interface ChartPoint {
  label: string;   // day "19"
  value: number;
  fullDate: string; // "2026-05-19"
}

export const useWeightStats = () => {
  const {
    period,
    setPeriod,
    weightLogs,
    targetWeightKg,
    isLoading,
    error,
    fetchWeightData,
  } = useWeightStore();

  const { draft } = useOnboardingStore();

  // Auto-fetch whenever period changes
  useEffect(() => {
    fetchWeightData(period);
  }, [period, fetchWeightData]);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(WEIGHT_PERIOD_LABELS).find(
      (key) => WEIGHT_PERIOD_LABELS[key as WeightPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as WeightPeriod);
  };

  // ── Chart data ───────────────────────────────────────────────
  const actualChartData: ChartPoint[] = weightLogs.map((log) => ({
    label: log.log_date.slice(8, 10), // "19" from "2026-05-19"
    value: log.weight_kg,
    fullDate: log.log_date,
  }));

  // Target line: flat horizontal across all same X points
  const resolvedTarget = targetWeightKg ?? draft.targetWeightKg ?? null;
  const targetChartData: ChartPoint[] = resolvedTarget !== null
    ? actualChartData.map((p) => ({ ...p, value: resolvedTarget }))
    : [];

  // ── BMI data ─────────────────────────────────────────────────
  const heightM = (draft.heightCm ?? 170) / 100;
  const bmiData: ChartPoint[] = weightLogs.map((log) => ({
    label: log.log_date.slice(8, 10),
    value: parseFloat((log.weight_kg / (heightM * heightM)).toFixed(1)),
    fullDate: log.log_date,
  }));

  // ── Summary stats ────────────────────────────────────────────
  const firstLog = weightLogs[0];
  const lastLog = weightLogs[weightLogs.length - 1];
  const initialWeight = firstLog?.weight_kg ?? draft.currentWeightKg ?? 0;
  const currentWeight = lastLog?.weight_kg ?? draft.currentWeightKg ?? 0;
  const weightChange = parseFloat((currentWeight - initialWeight).toFixed(1));

  // Current BMI
  const currentBmi = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));
  const firstBmi = parseFloat((initialWeight / (heightM * heightM)).toFixed(1));
  const bmiChange = parseFloat((currentBmi - firstBmi).toFixed(1));
  const bmiStatus = currentBmi < 18.5
    ? "Thiếu cân"
    : currentBmi < 25
    ? "Bình thường"
    : currentBmi < 30
    ? "Thừa cân"
    : "Béo phì";
  const bmiStatusColor = currentBmi < 18.5
    ? "#F59E0B"
    : currentBmi < 25
    ? "#22C55E"
    : currentBmi < 30
    ? "#F59E0B"
    : "#EF4444";

  return {
    period,
    activeTabLabel: WEIGHT_PERIOD_LABELS[period],
    tabs: Object.values(WEIGHT_PERIOD_LABELS),
    handleTabChange,

    actualChartData,
    targetChartData,
    resolvedTarget,
    bmiData,

    initialWeight,
    currentWeight,
    weightChange,
    currentBmi,
    bmiChange,
    bmiStatus,
    bmiStatusColor,

    isLoading,
    error,
  };
};
