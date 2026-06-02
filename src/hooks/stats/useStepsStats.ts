import { useEffect } from "react";
import { useStepsStore } from "@/store/statsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { StepsPeriod, STEPS_PERIOD_LABELS } from "@/constants/stats";
import { useAuthStore } from "@/store/authStore";

export const useStepsStats = () => {
  const {
    period,
    setPeriod,
    isConnected,
    isLoading,
    error,
    todaySteps,
    checkConnection,
    fetchHistory,
    connectAndSync,
  } = useStepsStore();

  const language = useSettingsStore((state) => state.language);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Tự động kiểm tra và fetch dữ liệu khi mount
  useEffect(() => {
    if (!isAuthenticated) return;
    const init = async () => {
      const connected = await checkConnection();
      if (connected) {
        fetchHistory(useStepsStore.getState().period);
      }
    };
    init();
  }, [checkConnection, fetchHistory, isAuthenticated]);

  const getPeriodLabel = (p: StepsPeriod) => {
    if (language === "en") {
      if (p === StepsPeriod.WEEK) return "Week";
      if (p === StepsPeriod.MONTH) return "Month";
      if (p === StepsPeriod.SIX_MONTHS) return "6 Months";
    }
    return STEPS_PERIOD_LABELS[p];
  };

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.values(StepsPeriod).find(
      (p) => getPeriodLabel(p) === tab
    );
    if (selectedKey) setPeriod(selectedKey);
  };

  return {
    activeTabLabel: getPeriodLabel(period),
    tabs: Object.values(StepsPeriod).map(getPeriodLabel),
    handleTabChange,
    
    // Dữ liệu và trạng thái
    isConnected,
    isLoading,
    error,
    todaySteps,
    connectAndSync,
  };
};
