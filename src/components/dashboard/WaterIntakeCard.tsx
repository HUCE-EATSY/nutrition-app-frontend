import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";
import { useWaterStore } from "@/store/waterStore";
import { useDiaryStore } from "@/store/diaryStore";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_WATER_DATA = {
  waterLogs: {} as Record<string, number>,
  waterGoal: 2000,
  defaultStep: 250,
};

export function WaterIntakeCard() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  
  const selectedDate = useDiaryStore((state) => state.selectedDate);
  const userId = useAuthStore((state) => state.userInfo?.id) || "guest";
  
  const userWater = useWaterStore((state) => state.userWaterData[userId] || DEFAULT_WATER_DATA);

  const { addWater, subtractWater } = useWaterStore();

  const intake = userWater.waterLogs[selectedDate] || 0;
  const step = userWater.defaultStep ?? 250;

  const handlePressCard = () => {
    router.navigate("/log-water");
  };

  return (
    <SurfaceCard style={styles.container}>
      <Pressable style={styles.left} onPress={handlePressCard}>
        <MaterialCommunityIcons name="water" size={26} color={colors.carbs} />
        <View style={styles.textContainer}>
           <Text style={styles.label}>{t.home.waterTitle}</Text>
           <Text style={styles.value}>{intake} / {userWater.waterGoal} {t.home.mlSuffix}</Text>
        </View>
      </Pressable>
      
      <View style={styles.controls}>
         <TouchableOpacity 
           style={styles.btn} 
           onPress={() => subtractWater(userId, selectedDate, step)}
           activeOpacity={0.7}
         >
            <MaterialCommunityIcons name="minus" size={18} color={colors.textSecondary} />
         </TouchableOpacity>
         <View style={styles.divider} />
         <TouchableOpacity 
           style={[styles.btn, styles.btnActive]} 
           onPress={() => {
             if (intake + step > 10000) {
               Alert.alert("Lỗi giới hạn", "Tổng lượng nước uống trong ngày không được vượt quá 10,000 ml.");
             } else {
               addWater(userId, selectedDate, step);
             }
           }}
           activeOpacity={0.7}
         >
            <MaterialCommunityIcons name="plus" size={18} color={colors.carbs} />
         </TouchableOpacity>
      </View>
    </SurfaceCard>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  textContainer: {
    gap: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  value: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  controls: {
    flexDirection: "row",
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    borderRadius: radius.sm,
    padding: 4,
    alignItems: "center",
  },
  btn: {
    padding: 8,
    borderRadius: radius.sm - 4,
  },
  btnActive: {
    backgroundColor: "rgba(61, 139, 255, 0.15)",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    marginHorizontal: 4,
  },
});
