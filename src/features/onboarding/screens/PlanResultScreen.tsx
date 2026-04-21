import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/src/components/buttons/GradientButton";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { MacroDonutChart } from "@/src/components/dashboard/MacroDonutChart";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { calculateNutritionPlan } from "@/src/domain/calculators/nutrition";
import { getWeeklyGoalBounds } from "@/src/domain/validators/onboarding";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { colors, spacing, typography } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";
import { formatDateForHero, getAgeFromBirthDate } from "@/src/utils/date";
import { DEFAULT_CURRENT_WEIGHT_KG, DEFAULT_HEIGHT_CM, DEFAULT_TARGET_WEIGHT_KG } from "@/src/utils/onboarding";

export function PlanResultScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;
  const plan = calculateNutritionPlan(
    {
      ...draft,
      heightCm: draft.heightCm ?? DEFAULT_HEIGHT_CM,
      currentWeightKg: draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG,
      targetWeightKg: draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG,
      weeklyGoalKg: draft.weeklyGoalKg ?? getWeeklyGoalBounds(draft.goalType).recommended,
    },
    age,
  );
  const { isCompact, isNarrowWidth } = useResponsiveLayout();

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.onboarding.planResult.title}</Text>

        <SurfaceCard style={styles.heroCard}>
          <Text style={styles.heroKicker}>{t.onboarding.planResult.heroKicker}</Text>
          <Text style={[styles.heroDate, isNarrowWidth && styles.heroDateCompact]}>{formatDateForHero(plan.targetDateISO)}</Text>
          <Text style={styles.heroDescription}>{t.onboarding.planResult.heroDescription}</Text>
        </SurfaceCard>

        <View style={[styles.statRow, isCompact && styles.statRowCompact]}>
          <StatCard
            helper={t.onboarding.planResult.dailyTargetHelper}
            label={t.onboarding.planResult.dailyTarget}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${plan.dailyTargetKcal} kcal`}
          />
          <StatCard
            helper={t.onboarding.planResult.weeklyTargetHelper}
            label={t.onboarding.planResult.weeklyTarget}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${plan.weeklyTargetKcal} kcal`}
          />
        </View>

        <View style={[styles.statRow, isCompact && styles.statRowCompact]}>
          <StatCard
            helper={t.onboarding.planResult.metabolismHelper}
            label={t.onboarding.planResult.metabolism}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${plan.bmrKcal} kcal`}
          />
          <StatCard
            helper={draft.goalType === "gain_weight" ? t.onboarding.planResult.surplusDaily : t.onboarding.planResult.deltaDaily}
            label={t.onboarding.planResult.adjustment}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${plan.dailyDeficitOrSurplusKcal} kcal`}
          />
        </View>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t.onboarding.planResult.macroSplit}</Text>
          <MacroDonutChart
            calories={plan.dailyTargetKcal}
            carbGram={plan.macroSplit.carbGram}
            carbPct={plan.macroSplit.carbPct}
            fatGram={plan.macroSplit.fatGram}
            fatPct={plan.macroSplit.fatPct}
            proteinGram={plan.macroSplit.proteinGram}
            proteinPct={plan.macroSplit.proteinPct}
          />
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.bannerTitle}>{t.onboarding.planResult.roadmapTitle}</Text>
          <Text style={styles.bannerText}>{t.onboarding.planResult.roadmapBody}</Text>
        </SurfaceCard>

        <GradientButton
          label={t.onboarding.planResult.cta}
          onPress={() => {
            markStepCompleted("PlanResult");
            completeOnboarding();
            router.replace("/(tabs)/home");
          }}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  titleCompact: {
    ...typography.h1,
  },
  heroCard: {
    backgroundColor: "rgba(165,108,255,0.14)",
  },
  heroKicker: {
    ...typography.caption,
    color: colors.warning,
  },
  heroDate: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  heroDateCompact: {
    ...typography.h2,
  },
  heroDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statRowCompact: {
    flexWrap: "wrap",
  },
  statCardCompact: {
    flexBasis: "100%",
    width: "100%",
    minHeight: 116,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  bannerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
