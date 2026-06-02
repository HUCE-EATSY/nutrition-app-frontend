import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, typography, shadows } from "@/constants";
import { getBmiStatusLabel, useTranslation } from "@/constants/i18n";
import { calculateBmi, getBmiStatus, getBmiStatusColors, getTargetBmiDesc } from "@/utils/onboarding";
import { useAppColors } from "@/hooks/useAppColors";

interface BmiCardProps {
  weightKg: number;
  heightCm: number;
  type: "current" | "target";
  error?: string;
}

export function BmiCard({ weightKg, heightCm, type, error }: BmiCardProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

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
  const statusColors = getBmiStatusColors(bmiStatus, colors);

  const statusDesc =
    type === "current"
      ? t.nutrition.bmiDescriptions[bmiStatus]
      : getTargetBmiDesc(bmiStatus);

  const titleText = type === "current" ? t.nutrition.yourBmi : t.nutrition.targetBmi;

  return (
    <View style={styles.bmiCard}>
      <View style={styles.bmiTitleRow}>
        <Text style={styles.bmiTitleText}>{titleText}</Text>
        <Text style={[styles.bmiValueText, { color: statusColors?.valueColor }]}>
          {bmiValue}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColors?.badgeBg }]}>
          <Text style={[styles.badgeText, { color: statusColors?.badgeText }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text style={styles.bmiDescText}>{statusDesc}</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  bmiCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.lg,
    width: "100%",
    ...shadows.card,
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
