import { useWeightStore } from "@/hooks/store/statsStore";
import { WeightPeriod, WEIGHT_PERIOD_LABELS } from "@/constants/stats";

export const useWeightStats = () => {
  const period = useWeightStore((state) => state.period);
  const setPeriod = useWeightStore((state) => state.setPeriod);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(WEIGHT_PERIOD_LABELS).find(
      key => WEIGHT_PERIOD_LABELS[key as WeightPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as WeightPeriod);
  };

  return {
    period,
    activeTabLabel: WEIGHT_PERIOD_LABELS[period],
    tabs: Object.values(WEIGHT_PERIOD_LABELS),
    handleTabChange,
  };
};
