import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
} from "@/constants/onboarding";
import {
  getOnboardingMeta,
  getPreviousOnboardingPath,
} from "@/utils/onboarding";
import { getGoalTypeLabel, useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { radius, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { getAgeFromBirthDate } from "@/utils/date";
import { useAppColors } from "@/hooks/useAppColors";

export default function ReviewSummaryScreen() {
  const t = useTranslation();
  const draft = useOnboardingStore((state) => state.draft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("ReviewSummary");
  const resolvedHeightCm = draft.heightCm ?? DEFAULT_HEIGHT_CM;
  const resolvedCurrentWeightKg = draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
  const resolvedTargetWeightKg = draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;
  const { isCompact } = useResponsiveLayout();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <OnboardingStepScaffold
      continueLabel={t.onboarding.reviewContinue}
      onBack={() => router.replace(getPreviousOnboardingPath("ReviewSummary"))}
      onContinue={() => {
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
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewNickname}
            value={draft.nickname ?? t.home.defaultNickname}
            styles={styles}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewAge}
            value={`${age}`}
            styles={styles}
          />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewHeight}
            value={`${resolvedHeightCm} cm`}
            styles={styles}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewCurrent}
            value={`${resolvedCurrentWeightKg} kg`}
            styles={styles}
          />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewGoal}
            value={getGoalTypeLabel(draft.goalType)}
            styles={styles}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewTarget}
            value={`${resolvedTargetWeightKg} kg`}
            styles={styles}
          />
        </View>
      </SurfaceCard>
    </OnboardingStepScaffold>
  );
}

function SummaryMetric({
  label,
  value,
  compact = false,
  styles,
}: {
  label: string;
  value: string;
  compact?: boolean;
  styles: any;
}) {
  return (
    <View
      style={[
        styles.metric,
        compact && styles.metricCompact,
      ]}
    >
      <View style={styles.metricContent}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.bgBase,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  metricCompact: {
    flexBasis: "45%",
    minWidth: "45%",
  },
  metricContent: {
    flex: 1,
    gap: 4,
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
