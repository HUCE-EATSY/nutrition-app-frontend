import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { t, useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography } from "@/constants";
import { useDiaryStore } from "@/store/diaryStore";

interface MacroItemProps {
  label: string;
  current: number;
  target: number;
  color: string;
  icon: string;
  type: string;
}

function ProgressItem({ label, current, target, color, icon, type }: MacroItemProps) {
  const t = useTranslation();
  const percentage = Math.min((current / target) * 100, 100);
  const router = useRouter();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <Pressable style={styles.item} onPress={() => router.push(`/guide/${type}`)}>
      <View style={styles.itemHeader}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${percentage}%`, backgroundColor: color }]} />
        <View style={[styles.thumb, { left: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.values}>
        <Text style={styles.current}>{current}</Text>
        <Text style={styles.target}>{` / ${target}${t.home.gramSuffix}`}</Text>
      </Text>
    </Pressable>
  );
}

interface MacroProgressRowProps {
  protein?: number;
  targetProtein?: number;
  carbs?: number;
  targetCarbs?: number;
  fat?: number;
  targetFat?: number;
}

export function MacroProgressRow({
  protein,
  targetProtein,
  carbs,
  targetCarbs,
  fat,
  targetFat,
}: MacroProgressRowProps = {}) {
  const { summary } = useDiaryStore();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const proteinCurrent = protein ?? summary?.consumedProteinGram ?? 0;
  const proteinTarget = targetProtein ?? summary?.targetProteinGram ?? 120;

  const carbsCurrent = carbs ?? summary?.consumedCarbGram ?? 0;
  const carbsTarget = targetCarbs ?? summary?.targetCarbGram ?? 250;

  const fatCurrent = fat ?? summary?.consumedFatGram ?? 0;
  const fatTarget = targetFat ?? summary?.targetFatGram ?? 67;

  return (
    <View style={styles.container}>
      <ProgressItem
        color={colors.protein}
        current={proteinCurrent}
        icon="⚡"
        label={t.home.protein}
        target={proteinTarget}
        type="protein"
      />
      <ProgressItem
        color={colors.carbs}
        current={carbsCurrent}
        icon="🍞"
        label={t.home.carbs}
        target={carbsTarget}
        type="carb"
      />
      <ProgressItem
        color={colors.fat}
        current={fatCurrent}
        icon="🥑"
        label={t.home.fat}
        target={fatTarget}
        type="fat"
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  track: {
    height: 6,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    borderRadius: 3,
    overflow: "visible",
    justifyContent: "center",
  },
  progress: {
    height: "100%",
    borderRadius: 3,
  },
  thumb: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  values: {
    ...typography.caption,
    marginTop: 2,
  },
  current: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  target: {
    color: colors.textMuted,
  },
});
