import React, { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { radius, spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

type StreakChallengeSectionProps = {
  progress: number; // 0..1
  onPressSeeMore?: () => void;
};

export function StreakChallengeSection({ progress, onPressSeeMore }: StreakChallengeSectionProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const pct = `${Math.max(0, Math.min(1, progress)) * 100}%` as const;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.streaks.cleanEatingChallenge}</Text>
        <Pressable onPress={onPressSeeMore} style={({ pressed }) => [styles.seeMoreWrap, pressed && styles.pressed]}>
          <Text style={styles.seeMore}>{t.streaks.seeMore}</Text>
        </Pressable>
      </View>

      <SurfaceCard style={styles.challengeCard}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: pct }]} />
        </View>

        <View style={styles.milestones}>
          <Milestone label="3" styles={styles} />
          <Milestone label="7" styles={styles} />
          <View style={styles.milestone}>
            <MaterialCommunityIcons name="trophy" size={18} color={colors.textMuted} />
          </View>
        </View>
      </SurfaceCard>
    </View>
  );
}

function Milestone({ label, styles }: { label: string; styles: any }) {
  return (
    <View style={styles.milestone}>
      <Text style={styles.milestoneDay}>{label}</Text>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeMoreWrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  seeMore: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  challengeCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: colors.bgBase,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.warning,
    borderRadius: radius.pill,
  },
  milestones: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  milestone: {
    alignItems: "center",
  },
  milestoneDay: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
});
