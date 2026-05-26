export type Gender = "female" | "male";
export type GoalType = "lose_weight" | "gain_weight" | "maintain_weight";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type BMIStatus = "underweight" | "normal" | "overweight" | "obese";
export type AuthProvider = "google" | "facebook";

export type OnboardingRouteName =
  | "Nickname"
  | "Gender"
  | "BirthDate"
  | "Height"
  | "GoalType"
  | "CurrentWeight"
  | "TargetWeight"
  | "ActivityLevel"
  | "WeeklyGoal"
  | "ReviewSummary"
  | "Calculating"
  | "PlanResult";

export type UserRole = 'user' | 'admin';

export interface UserInfo {
  id: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  role?: UserRole; // 'user' (default) | 'admin'
}

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
  displayName: string;
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
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  bmrKcal: number;
  tdeeKcal: number;
  targetDateISO: string;
  bmi?: number;
  bmiStatus?: BMIStatus;
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
  type: "meal" | "snack" | "drink";
  imageUrl?: string | null;
  quantityG?: number;
  foodItemId?: string;
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
  source: "ai" | "saved" | "template";
}

export interface Testimonial {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
}

export interface BMISegment {
  key: string;
  min?: number;
  max?: number;
  label: string;
  color: string;
}

export type PlanCalculationState =
  | { status: "idle" }
  | { status: "calculating_profile"; progress: number }
  | { status: "calculating_metabolism"; progress: number }
  | { status: "calculating_target"; progress: number }
  | { status: "success"; plan: NutritionPlan }
  | { status: "error"; message: string };

export type PublicFlowStep = "welcome" | "social-login" | "mascot-intro" | "done";

export type OnboardingRoutePath =
  | "/(public)/welcome"
  | "/(public)/social-login"
  | "/(public)/mascot-intro"
  | "/(onboarding)/nickname"
  | "/(onboarding)/gender"
  | "/(onboarding)/birth-date"
  | "/(onboarding)/height"
  | "/(onboarding)/goal-type"
  | "/(onboarding)/current-weight"
  | "/(onboarding)/target-weight"
  | "/(onboarding)/activity-level"
  | "/(onboarding)/weekly-goal"
  | "/(onboarding)/review-summary"
  | "/(onboarding)/calculating"
  | "/(onboarding)/plan-result"
  | "/(tabs)/home"
  | "/quick-add";

export interface OptionItem<TValue extends string> {
  value: TValue;
  title: string;
  subtitle?: string;
  accent: string;
}

export interface DailyTargetDto {
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  calories_pct: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
}

export interface DailySummaryResponse {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  target: DailyTargetDto | null;
}

export interface WeightLogEntry {
  id: number;
  weight_kg: number;
  log_date: string; // "YYYY-MM-DD"
  note: string | null;
  created_at: string;
}

export interface UserGoalApiResponse {
  id: string;
  userId: string;
  weightKg: number;
  activityLevel: number;
  goalType: number;
  goalWeightKg: number | null;
  bmrKcal: number;
  tdeeKcal: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  isActive: boolean;
  createdAt: string;
}
