export enum ActivityPeriod {
  WEEK = "week",
  MONTH = "month",
  SIX_MONTHS = "6months",
}

export enum NutritionPeriod {
  DAY = "day",
  WEEK = "week",
}

export enum StepsPeriod {
  WEEK = "week",
  MONTH = "month",
  SIX_MONTHS = "6months",
}

export enum WeightPeriod {
  ONE_MONTH = "1month",
  SIX_MONTHS = "6months",
  ONE_YEAR = "1year",
}

export const ACTIVITY_PERIOD_LABELS: Record<ActivityPeriod, string> = {
  [ActivityPeriod.WEEK]: "Tuần",
  [ActivityPeriod.MONTH]: "Tháng",
  [ActivityPeriod.SIX_MONTHS]: "6 Tháng",
};

export const NUTRITION_PERIOD_LABELS: Record<NutritionPeriod, string> = {
  [NutritionPeriod.DAY]: "Ngày",
  [NutritionPeriod.WEEK]: "Tuần",
};

export const STEPS_PERIOD_LABELS: Record<StepsPeriod, string> = {
  [StepsPeriod.WEEK]: "Tuần",
  [StepsPeriod.MONTH]: "Tháng",
  [StepsPeriod.SIX_MONTHS]: "6 Tháng",
};

export const WEIGHT_PERIOD_LABELS: Record<WeightPeriod, string> = {
  [WeightPeriod.ONE_MONTH]: "1 Tháng",
  [WeightPeriod.SIX_MONTHS]: "6 Tháng",
  [WeightPeriod.ONE_YEAR]: "1 Năm",
};
