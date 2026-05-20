import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
  getOnboardingMeta,
  getPreviousOnboardingPath,
} from "@/domain/onboarding";
import { getGoalTypeLabel, t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { getAgeFromBirthDate } from "@/hooks/utils/date";



export default function ReviewSummaryScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("ReviewSummary");
  const resolvedHeightCm = draft.heightCm ?? DEFAULT_HEIGHT_CM;
  const resolvedCurrentWeightKg = draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
  const resolvedTargetWeightKg = draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;
  const { isCompact } = useResponsiveLayout();

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
            onPress={() => router.replace("/(onboarding)/nickname")}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewAge}
            value={`${age}`}
            onPress={() => router.replace("/(onboarding)/birth-date")}
          />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewHeight}
            value={`${resolvedHeightCm} cm`}
            onPress={() => router.replace("/(onboarding)/height")}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewCurrent}
            value={`${resolvedCurrentWeightKg} kg`}
            onPress={() => router.replace("/(onboarding)/current-weight")}
          />
        </View>
        <View style={[styles.summaryRow, isCompact && styles.summaryRowCompact]}>
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewGoal}
            value={getGoalTypeLabel(draft.goalType)}
            onPress={() => router.replace("/(onboarding)/goal-type")}
          />
          <SummaryMetric
            compact={isCompact}
            label={t.onboarding.reviewTarget}
            value={`${resolvedTargetWeightKg} kg`}
            onPress={() => {
              if (draft.goalType === "maintain_weight") {
                router.replace("/(onboarding)/current-weight");
              } else {
                router.replace("/(onboarding)/target-weight");
              }
            }}
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
  onPress,
}: {
  label: string;
  value: string;
  compact?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.metric,
        compact && styles.metricCompact,
        pressed && styles.metricPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.metricContent}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <View style={styles.editIconWrapper}>
        <Ionicons name="pencil" size={12} color={colors.primary} />
      </View>
    </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  metricPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: colors.primary,
  },
  metricCompact: {
    flexBasis: "45%",
    minWidth: "45%",
  },
  metricContent: {
    flex: 1,
    gap: 4,
  },
  editIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165, 108, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
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
