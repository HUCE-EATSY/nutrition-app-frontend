import { useEffect } from "react";
import { useWeightStore } from "@/store/statsStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSettingsStore } from "@/store/settingsStore";
import { WeightPeriod, WEIGHT_PERIOD_LABELS } from "@/constants/stats";
import { getBmiStatusLabel } from "@/constants/i18n";

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
  const unit = useSettingsStore((state) => state.unit);
  const language = useSettingsStore((state) => state.language);

  const convertWeight = (val: number) => {
    if (unit === "lbs") {
      return parseFloat((val * 2.20462).toFixed(1));
    }
    return val;
  };

  // Auto-fetch whenever period changes
  useEffect(() => {
    fetchWeightData(period);
  }, [period, fetchWeightData]);

  const getPeriodLabel = (p: WeightPeriod) => {
    if (language === "en") {
      if (p === WeightPeriod.ONE_MONTH) return "1 Month";
      if (p === WeightPeriod.SIX_MONTHS) return "6 Months";
      if (p === WeightPeriod.ONE_YEAR) return "1 Year";
    }
    return WEIGHT_PERIOD_LABELS[p];
  };

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.values(WeightPeriod).find(
      (p) => getPeriodLabel(p) === tab
    );
    if (selectedKey) setPeriod(selectedKey);
  };

  const rawTarget = targetWeightKg ?? draft.targetWeightKg ?? null;
  const resolvedTarget = rawTarget !== null ? convertWeight(rawTarget) : null;

  // ── Chart data ───────────────────────────────────────────────
  const actualChartData: ChartPoint[] = weightLogs.map((log) => ({
    label: log.log_date.slice(8, 10), // "19" from "2026-05-19"
    value: convertWeight(log.weight_kg),
    fullDate: log.log_date,
  }));

  // Target line: flat horizontal across all same X points
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

  // ── Summary stats (BMI uses raw kg, displayed weight is converted) ────────────────────────────────────────────
  const firstLog = weightLogs[0];
  const lastLog = weightLogs[weightLogs.length - 1];
  const initialWeightKg = firstLog?.weight_kg ?? draft.currentWeightKg ?? 0;
  const currentWeightKg = lastLog?.weight_kg ?? draft.currentWeightKg ?? 0;

  const initialWeight = convertWeight(initialWeightKg);
  const currentWeight = convertWeight(currentWeightKg);
  const weightChange = parseFloat((currentWeight - initialWeight).toFixed(1));

  // Current BMI
  const currentBmi = parseFloat((currentWeightKg / (heightM * heightM)).toFixed(1));
  const firstBmi = parseFloat((initialWeightKg / (heightM * heightM)).toFixed(1));
  const bmiChange = parseFloat((currentBmi - firstBmi).toFixed(1));
  const bmiStatusKey = currentBmi < 18.5
    ? "underweight"
    : currentBmi < 25
    ? "normal"
    : currentBmi < 30
    ? "overweight"
    : "obese";
  const bmiStatus = getBmiStatusLabel(bmiStatusKey);
  const bmiStatusColor = currentBmi < 18.5
    ? "#F59E0B"
    : currentBmi < 25
    ? "#22C55E"
    : currentBmi < 30
    ? "#F59E0B"
    : "#EF4444";

  return {
    period,
    activeTabLabel: getPeriodLabel(period),
    tabs: Object.values(WeightPeriod).map(getPeriodLabel),
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
