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
    stepGoal,
    averageSteps,
    previousAverageSteps,
    historyData,
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

  const getFormattedDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    let daysCount = 7;
    if (period === StepsPeriod.WEEK) {
      daysCount = 7;
    } else if (period === StepsPeriod.MONTH) {
      daysCount = 30;
    } else if (period === StepsPeriod.SIX_MONTHS) {
      daysCount = 180;
    }

    startDate.setDate(endDate.getDate() - (daysCount - 1));

    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return {
    period,
    activeTabLabel: STEPS_PERIOD_LABELS[period],
    tabs: Object.values(STEPS_PERIOD_LABELS),
    handleTabChange,
    
    // Dữ liệu và trạng thái
    isConnected,
    isLoading,
    error,
    todaySteps,
    stepGoal,
    averageSteps,
    previousAverageSteps,
    historyData,
    dateRangeText: getFormattedDateRange(),
    connectAndSync,
  };
};
