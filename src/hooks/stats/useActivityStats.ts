import { useActivityStore } from "@/store/statsStore";
import { ActivityPeriod, ACTIVITY_PERIOD_LABELS } from "@/constants/stats";

export const useActivityStats = () => {
  const period = useActivityStore((state) => state.period);
  const setPeriod = useActivityStore((state) => state.setPeriod);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(ACTIVITY_PERIOD_LABELS).find(
      key => ACTIVITY_PERIOD_LABELS[key as ActivityPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as ActivityPeriod);
  };

  return {
    period,
    activeTabLabel: ACTIVITY_PERIOD_LABELS[period],
    tabs: Object.values(ACTIVITY_PERIOD_LABELS),
    handleTabChange,
  };
};
