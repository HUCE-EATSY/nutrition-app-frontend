import { useEffect } from "react";
import { useStepsStore } from "@/store/statsStore";
import { StepsPeriod, STEPS_PERIOD_LABELS } from "@/constants/stats";

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

  // Tự động kiểm tra và fetch dữ liệu khi mount
  useEffect(() => {
    const init = async () => {
      const connected = await checkConnection();
      if (connected) {
        fetchHistory(period);
      }
    };
    init();
  }, [period, checkConnection, fetchHistory]);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(STEPS_PERIOD_LABELS).find(
      (key) => STEPS_PERIOD_LABELS[key as StepsPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as StepsPeriod);
  };

  return {
    activeTabLabel: STEPS_PERIOD_LABELS[period],
    tabs: Object.values(STEPS_PERIOD_LABELS),
    handleTabChange,
    
    // Dữ liệu và trạng thái
    isConnected,
    isLoading,
    error,
    todaySteps,
    connectAndSync,
  };
};
