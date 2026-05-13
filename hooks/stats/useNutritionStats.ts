import { useNutritionStore } from "@/hooks/store/statsStore";
import { NutritionPeriod, NUTRITION_PERIOD_LABELS } from "@/constants/stats";

export const useNutritionStats = () => {
  const period = useNutritionStore((state) => state.period);
  const setPeriod = useNutritionStore((state) => state.setPeriod);

  const handleTabChange = (tab: string) => {
    const selectedKey = Object.keys(NUTRITION_PERIOD_LABELS).find(
      key => NUTRITION_PERIOD_LABELS[key as NutritionPeriod] === tab
    );
    if (selectedKey) setPeriod(selectedKey as NutritionPeriod);
  };

  return {
    period,
    activeTabLabel: NUTRITION_PERIOD_LABELS[period],
    tabs: Object.values(NUTRITION_PERIOD_LABELS),
    handleTabChange,
  };
};
