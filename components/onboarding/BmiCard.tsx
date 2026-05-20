import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/constants";
import { getBmiStatusLabel, t } from "@/constants/i18n";
import { calculateBmi, getBmiStatus, getBmiStatusColors, getTargetBmiDesc } from "@/domain/onboarding";

interface BmiCardProps {
  weightKg: number;
  heightCm: number;
  type: "current" | "target";
  error?: string;
}

export function BmiCard({ weightKg, heightCm, type, error }: BmiCardProps) {
  if (error) {
    return (
      <View style={[styles.bmiCard, styles.errorCard]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const bmiValue = calculateBmi(weightKg, heightCm);
  const bmiStatus = getBmiStatus(bmiValue);
  const statusLabel = getBmiStatusLabel(bmiStatus);
  const statusColors = getBmiStatusColors(bmiStatus);

  const statusDesc =
    type === "current"
      ? t.nutrition.bmiDescriptions[bmiStatus]
      : getTargetBmiDesc(bmiStatus);

  const titleText = type === "current" ? "BMI của bạn: " : "BMI mục tiêu: ";

  return (
    <View style={styles.bmiCard}>
      <View style={styles.bmiTitleRow}>
        <Text style={styles.bmiTitleText}>{titleText}</Text>
        <Text style={[styles.bmiValueText, { color: statusColors.valueColor }]}>
          {bmiValue}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColors.badgeBg }]}>
          <Text style={[styles.badgeText, { color: statusColors.badgeText }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.bmiDescText}>{statusDesc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bmiCard: {
    backgroundColor: "rgba(28, 26, 44, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
    width: "100%",
  },
  errorCard: {
    borderColor: "rgba(255, 90, 95, 0.4)",
    backgroundColor: "rgba(255, 90, 95, 0.08)",
  },
  bmiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  bmiTitleText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  bmiValueText: {
    ...typography.h3,
    fontWeight: "bold",
    fontSize: 18,
    marginRight: spacing.sm,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    ...typography.caption,
    fontWeight: "bold",
    fontSize: 12,
  },
  bmiDescText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
