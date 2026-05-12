import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { getWeeklyGoalBounds } from "@/constants/domain/validators/onboarding";
import { getGoalTypeLabel, t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { getAgeFromBirthDate } from "@/hooks/utils/date";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
  getOnboardingMeta,
  getPreviousOnboardingPath,
} from "@/hooks/utils/onboarding";


export default function ReviewSummaryScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const setHeightCm = useOnboardingStore((state) => state.setHeightCm);
  const setCurrentWeightKg = useOnboardingStore((state) => state.setCurrentWeightKg);
  const setTargetWeightKg = useOnboardingStore((state) => state.setTargetWeightKg);
  const setWeeklyGoalKg = useOnboardingStore((state) => state.setWeeklyGoalKg);
  const meta = getOnboardingMeta("ReviewSummary");
  const resolvedHeightCm = draft.heightCm ?? DEFAULT_HEIGHT_CM;
  const resolvedCurrentWeightKg = draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
  const resolvedTargetWeightKg = draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;
  const resolvedWeeklyGoalKg = draft.weeklyGoalKg ?? getWeeklyGoalBounds(draft.goalType).recommended;
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;
  const resolvedDraft = {
    ...draft,
    heightCm: resolvedHeightCm,
    currentWeightKg: resolvedCurrentWeightKg,
    targetWeightKg: resolvedTargetWeightKg,
    weeklyGoalKg: resolvedWeeklyGoalKg,
  };
  const { isCompact } = useResponsiveLayout();

  return (
    <OnboardingStepScaffold
      continueLabel={t.onboarding.reviewContinue}
      onBack={() => router.replace(getPreviousOnboardingPath("ReviewSummary"))}
      onContinue={() => {
        setHeightCm(resolvedHeightCm);
        setCurrentWeightKg(resolvedCurrentWeightKg);
        setTargetWeightKg(resolvedTargetWeightKg);
        setWeeklyGoalKg(resolvedWeeklyGoalKg);
        markStepCompleted("ReviewSummary");
        router.replace("/(onboarding)/calculating");
      }}
      question={t.onboarding.questions.ReviewSummary}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <SurfaceCard>
        <Text style={styles.cardTitle}>{t.onboarding.reviewInputProfile}</Text>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewNickname} value={draft.nickname ?? t.home.defaultNickname} />
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewAge} value={`${age}`} />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewHeight} value={`${resolvedHeightCm} cm`} />
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewCurrent} value={`${resolvedCurrentWeightKg} kg`} />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewGoal} value={getGoalTypeLabel(draft.goalType)} />
          <SummaryMetric compact={isCompact} label={t.onboarding.reviewTarget} value={`${resolvedTargetWeightKg} kg`} />
        </View>
      </SurfaceCard>


    </OnboardingStepScaffold>
  );
}

function SummaryMetric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <View style={[styles.metric, compact && styles.metricCompact]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  summaryRowCompact: {
    flexWrap: "wrap",
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricCompact: {
    flexBasis: "45%",
    minWidth: "45%",
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  metricValue: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  previewText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
