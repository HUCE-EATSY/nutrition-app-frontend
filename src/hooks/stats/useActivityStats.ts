import { useActivityStore } from "@/store/statsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { ActivityPeriod, ACTIVITY_PERIOD_LABELS } from "@/constants/stats";

export const useActivityStats = () => {
  const period = useActivityStore((state) => state.period);
  const setPeriod = useActivityStore((state) => state.setPeriod);
  const language = useSettingsStore((state) => state.language);

  const getPeriodLabel = (p: ActivityPeriod) => {
    if (language === "en") {
      if (p === ActivityPeriod.WEEK) return "Week";
      if (p === ActivityPeriod.MONTH) return "Month";
      if (p === ActivityPeriod.SIX_MONTHS) return "6 Months";
    }
    return ACTIVITY_PERIOD_LABELS[p];
  };

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.values(ActivityPeriod).find(
      (p) => getPeriodLabel(p) === tab
    );
    if (selectedKey) setPeriod(selectedKey);
  };

  return {
    period,
    activeTabLabel: getPeriodLabel(period),
    tabs: Object.values(ActivityPeriod).map(getPeriodLabel),
    handleTabChange,
  };
};
