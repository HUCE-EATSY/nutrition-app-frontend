/**
 * DNT React Native technical contracts
 * Spec companion file
 */

export type Gender = 'female' | 'male';
export type GoalType = 'lose_weight' | 'gain_weight' | 'maintain_weight';
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type BMIStatus =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese';

export type AuthProvider = 'google' | 'facebook';

export type OnboardingRouteName =
  | 'Nickname'
  | 'Gender'
  | 'BirthDate'
  | 'Height'
  | 'GoalType'
  | 'CurrentWeight'
  | 'TargetWeight'
  | 'ActivityLevel'
  | 'WeeklyGoal'
  | 'ReviewSummary'
  | 'Calculating'
  | 'PlanResult';

export type RootStackParamList = {
  Welcome: undefined;
  SocialLogin: undefined;
  MascotIntro: undefined;
  OnboardingStack: undefined;
  MainTabs: undefined;
  QuickAddModal: { selectedDate?: string; hour?: number } | undefined;
  GlobalWebView: { title: string; url: string };
};

export type OnboardingStackParamList = {
  Nickname: undefined;
  Gender: undefined;
  BirthDate: undefined;
  Height: undefined;
  GoalType: undefined;
  CurrentWeight: undefined;
  TargetWeight: undefined;
  ActivityLevel: undefined;
  WeeklyGoal: undefined;
  ReviewSummary: undefined;
  Calculating: undefined;
  PlanResult: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Diary: undefined;
  QuickAddAction: undefined;
  MealPlan: undefined;
  Account: undefined;
};

export interface OnboardingDraft {
  nickname: string | null;
  gender: Gender | null;
  birthDateISO: string | null;
  heightCm: number | null;
  goalType: GoalType | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel | null;
  weeklyGoalKg: number | null;
  completedSteps: OnboardingRouteName[];
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  gender: Gender;
  birthDateISO: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  avatarUrl?: string;
  joinedAtISO?: string;
}

export interface BMIResult {
  value: number;
  status: BMIStatus;
  description: string;
  sourceLabel?: string;
}

export interface MacroSplit {
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
}

export interface NutritionPlan {
  bmi: number;
  bmiStatus: BMIStatus;
  bmrKcal: number;
  tdeeKcal: number;
  dailyTargetKcal: number;
  weeklyTargetKcal: number;
  dailyDeficitOrSurplusKcal: number;
  targetDateISO: string;
  macroSplit: MacroSplit;
}

export interface DiaryEntry {
  id: string;
  dateISO: string;
  hour: number;
  title: string;
  calories: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
  type: 'meal' | 'snack' | 'drink';
}

export interface DiaryHourSlot {
  hour: number;
  entries: DiaryEntry[];
}

export interface DiaryDaySummary {
  dateISO: string;
  targetCalories: number;
  consumedCalories: number;
  targetProteinGram: number;
  consumedProteinGram: number;
  targetCarbGram: number;
  consumedCarbGram: number;
  targetFatGram: number;
  consumedFatGram: number;
  slots: DiaryHourSlot[];
}

export interface MealPlanMeal {
  id: string;
  name: string;
  timeLabel: string;
  calories: number;
}

export interface MealPlan {
  id: string;
  title: string;
  dateISO?: string;
  meals: MealPlanMeal[];
  totalCalories: number;
  source: 'ai' | 'saved' | 'template';
}

export interface Testimonial {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
}

export interface ScreenBackgroundProps {
  withGlow?: boolean;
  children: unknown;
}

export interface SafeScreenProps {
  children: unknown;
  scrollable?: boolean;
  withBackgroundGlow?: boolean;
}

export interface GradientButtonProps {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: unknown;
  onPress: () => void;
  testID?: string;
}

export interface SocialAuthButtonProps {
  provider: AuthProvider;
  label: string;
  loading?: boolean;
  onPress: () => void;
}

export interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  onBack?: () => void;
  showDivider?: boolean;
}

export interface MascotQuestionBubbleProps {
  text: string;
  avatarUri?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface OptionCardProps {
  title: string;
  subtitle?: string;
  icon?: unknown;
  selected?: boolean;
  onPress: () => void;
}

export interface HorizontalRulerPickerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  majorTickEvery: number;
  decimalPlaces?: number;
  onChange: (value: number) => void;
}

export interface WheelDatePickerProps {
  day: number;
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  onChange: (next: { day: number; month: number; year: number }) => void;
}

export interface WeeklyGoalSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  recommendedValue?: number;
  estimatedDailyCalories?: number;
  onChange: (value: number) => void;
}

export interface BMISegment {
  key: string;
  min?: number;
  max?: number;
  label: string;
  color: string;
}

export interface BMIScaleBarProps {
  value: number;
  segments: BMISegment[];
  markerVisible?: boolean;
  showLabels?: boolean;
}

export interface BMIInfoCardProps {
  bmi: number;
  statusLabel: string;
  description: string;
  sourceLabel?: string;
}

export interface LoadingStepRowProps {
  label: string;
  progress: number;
  status: 'idle' | 'loading' | 'done';
}

export interface MacroDonutChartProps {
  calories: number;
  proteinPct: number;
  carbPct: number;
  fatPct: number;
  proteinGram: number;
  carbGram: number;
  fatGram: number;
}

export interface TimelineHourRowProps {
  hourLabel: string;
  entriesCount: number;
  isCurrentHour?: boolean;
  onAdd: () => void;
  onPress?: () => void;
}

export interface SegmentedTabItem {
  key: string;
  label: string;
}

export interface SegmentedPillTabsProps {
  items: SegmentedTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export interface TrialBannerProps {
  title: string;
  ctaLabel: string;
  onPress: () => void;
}

export type OnboardingStoreState = {
  draft: OnboardingDraft;
  setNickname: (nickname: string) => void;
  setGender: (gender: Gender) => void;
  setBirthDateISO: (birthDateISO: string) => void;
  setHeightCm: (heightCm: number) => void;
  setGoalType: (goalType: GoalType) => void;
  setCurrentWeightKg: (currentWeightKg: number) => void;
  setTargetWeightKg: (targetWeightKg: number) => void;
  setActivityLevel: (activityLevel: ActivityLevel) => void;
  setWeeklyGoalKg: (weeklyGoalKg: number) => void;
  markStepCompleted: (step: OnboardingRouteName) => void;
  reset: () => void;
};

export type PlanCalculationState =
  | { status: 'idle' }
  | { status: 'calculating_profile'; progress: number }
  | { status: 'calculating_metabolism'; progress: number }
  | { status: 'calculating_target'; progress: number }
  | { status: 'success'; plan: NutritionPlan }
  | { status: 'error'; message: string };
