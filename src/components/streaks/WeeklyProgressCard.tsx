import React, { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { radius, spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";

type WeeklyProgressCardProps = {
  daysOfWeek: string[]; // length = 7
  weeklyProgress: boolean[]; // length = 7
  onPressDay?: (idx: number, dayName: string, isCompleted: boolean) => void;
};

export function WeeklyProgressCard({ daysOfWeek, weeklyProgress, onPressDay }: WeeklyProgressCardProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleDayPress = (idx: number) => {
    const isCompleted = weeklyProgress[idx];
    const dayName = daysOfWeek[idx];
    if (onPressDay) {
      onPressDay(idx, dayName, isCompleted);
      return;
    }
    if (isCompleted) {
      Alert.alert("Hoàn thành", `${dayName}: Bạn đã hoàn thành xuất sắc mục tiêu dinh dưỡng ngày này! 🌟`);
    } else {
      Alert.alert("Chưa đạt mục tiêu", `${dayName}: Bạn chưa tích đủ calo hoặc chưa được xử lý đóng băng cho ngày này.`);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t.streaks.weeklyGoal}</Text>
      <SurfaceCard style={styles.weeklyCard}>
        {weeklyProgress.map((isCompleted, idx) => (
          <Pressable 
            key={`${daysOfWeek[idx] ?? idx}`} 
            onPress={() => handleDayPress(idx)}
            style={({ pressed }) => [
              styles.dayCircle, 
              isCompleted && styles.dayCircleActive,
              pressed && styles.pressed
            ]}
          >
            <Text style={[styles.dayText, isCompleted && styles.dayTextActive]}>{daysOfWeek[idx] ?? ""}</Text>
          </Pressable>
        ))}
      </SurfaceCard>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  weeklyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: {
    backgroundColor: colors.warning,
  },
  dayText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  dayTextActive: {
    color: colors.bgElevated,
  },
});
