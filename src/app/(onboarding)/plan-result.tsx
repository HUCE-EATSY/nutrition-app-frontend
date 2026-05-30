import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { MacroDonutChart } from "@/components/dashboard/MacroDonutChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { formatDateForHero } from "@/utils/date";

export default function PlanResultScreen() {
  const t = useTranslation();
  const draft = useOnboardingStore((state) => state.draft);
  const serverPlan = useOnboardingStore((state) => state.serverPlan);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dữ liệu từ server trả về trong OnboardUserAsync
  // { targetCalories, targetProteinG, targetCarbsG, targetFatG, bmrKcal, tdeeKcal, ... }
  const rawPlan = (serverPlan || {}) as any;
  const plan = {
    targetCalories: Number(rawPlan.targetCalories ?? rawPlan.TargetCalories ?? 0),
    bmrKcal: Number(rawPlan.bmrKcal ?? rawPlan.BmrKcal ?? 0),
    tdeeKcal: Number(rawPlan.tdeeKcal ?? rawPlan.TdeeKcal ?? 0),
    targetProteinG: Number(rawPlan.targetProteinG ?? rawPlan.TargetProteinG ?? 0),
    targetCarbsG: Number(rawPlan.targetCarbsG ?? rawPlan.TargetCarbsG ?? 0),
    targetFatG: Number(rawPlan.targetFatG ?? rawPlan.TargetFatG ?? 0),
    targetDateISO: String(rawPlan.targetDate ?? rawPlan.TargetDate ?? rawPlan.targetDateISO ?? rawPlan.TargetDateISO ?? ""),
  };

  const targetDateISO = plan.targetDateISO || "";

  const { isCompact, isNarrowWidth } = useResponsiveLayout();

  const handleStart = async () => {
    setIsSubmitting(true);
    markStepCompleted("PlanResult");
    completeOnboarding();
    router.replace("/(tabs)/home");
    setIsSubmitting(false);
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.onboarding.planResult.title}</Text>

        <SurfaceCard style={styles.heroCard}>
          <Text style={styles.heroKicker}>{t.onboarding.planResult.heroKicker}</Text>
          <Text style={[styles.heroDate, isNarrowWidth && styles.heroDateCompact]}>{formatDateForHero(targetDateISO)}</Text>
          <Text style={styles.heroDescription}>{t.onboarding.planResult.heroDescription}</Text>
        </SurfaceCard>

        <View style={[styles.statRow, isCompact && styles.statRowCompact]}>
          <StatCard
            helper={t.onboarding.planResult.dailyTargetHelper}
            label={t.onboarding.planResult.dailyTarget}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${Math.round(plan.targetCalories)} kcal`}
          />
          <StatCard
            helper={t.onboarding.planResult.weeklyTargetHelper}
            label={t.onboarding.planResult.weeklyTarget}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${Math.round(plan.targetCalories * 7)} kcal`}
          />
        </View>

        <View style={[styles.statRow, isCompact && styles.statRowCompact]}>
          <StatCard
            helper={t.onboarding.planResult.metabolismHelper}
            label={t.onboarding.planResult.metabolism}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${Math.round(plan.bmrKcal)} kcal`}
          />
          <StatCard
            helper={draft.goalType === "gain_weight" ? t.onboarding.planResult.surplusDaily : t.onboarding.planResult.deltaDaily}
            label={t.onboarding.planResult.adjustment}
            style={isCompact ? styles.statCardCompact : undefined}
            value={`${Math.abs(Math.round(plan.targetCalories - plan.tdeeKcal))} kcal`}
          />
        </View>

        <SurfaceCard>
          <Text style={styles.sectionTitle}>{t.onboarding.planResult.macroSplit}</Text>
          <MacroDonutChart
            calories={Math.round(plan.targetCalories)}
            carbGram={Math.round(plan.targetCarbsG)}
            carbPct={plan.targetCalories > 0 ? Math.round((plan.targetCarbsG * 400) / plan.targetCalories) : 0}
            fatGram={Math.round(plan.targetFatG)}
            fatPct={plan.targetCalories > 0 ? Math.round((plan.targetFatG * 900) / plan.targetCalories) : 0}
            proteinGram={Math.round(plan.targetProteinG)}
            proteinPct={plan.targetCalories > 0 ? Math.round((plan.targetProteinG * 400) / plan.targetCalories) : 0}
          />
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.bannerTitle}>{t.onboarding.planResult.roadmapTitle}</Text>
          <Text style={styles.bannerText}>{t.onboarding.planResult.roadmapBody}</Text>
        </SurfaceCard>

        <GradientButton
          loading={isSubmitting}
          label={t.onboarding.planResult.cta}
          onPress={handleStart}
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
    textAlign: "center",
  },
  titleCompact: {
    ...typography.h1,
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "rgba(165,108,255,0.14)",
    alignItems: "center",
  },
  heroKicker: {
    ...typography.caption,
    color: colors.warning,
    textAlign: "center",
  },
  heroDate: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  heroDateCompact: {
    ...typography.h2,
    textAlign: "center",
  },
  heroDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
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
