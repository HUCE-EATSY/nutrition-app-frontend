import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";

const ACTIVITIES = [
  { id: "running", label: "Chạy bộ", icon: "run" },
  { id: "cycling", label: "Đạp xe", icon: "bike" },
  { id: "badminton", label: "Cầu lông", icon: "badminton" },
  { id: "pickleball", label: "Pickleball", icon: "tennis-ball" },
  { id: "yoga", label: "Yoga", icon: "yoga" },
  { id: "other", label: "Khác", icon: "dots-horizontal-circle-outline" },
] as const;

export function ActivityGrid() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.home.exerciseActivity}</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity key={activity.id} style={styles.item}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={activity.icon as any} size={20} color={colors.textPrimary} />
            </View>
            <Text style={styles.label}>{activity.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  item: {
    width: "30%",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
