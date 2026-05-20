import { useStepsStore } from "@/hooks/store/statsStore";
import { StepsPeriod, STEPS_PERIOD_LABELS } from "@/constants/stats";

export const useStepsStats = () => {
  const period = useStepsStore((state) => state.period);
  const setPeriod = useStepsStore((state) => state.setPeriod);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(STEPS_PERIOD_LABELS).find(
      key => STEPS_PERIOD_LABELS[key as StepsPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as StepsPeriod);
  };

  return {
    period,
    activeTabLabel: STEPS_PERIOD_LABELS[period],
    tabs: Object.values(STEPS_PERIOD_LABELS),
    handleTabChange,
  };
};
