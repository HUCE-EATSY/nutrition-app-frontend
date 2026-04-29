import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, spacing, typography } from "@/constants";
import { t } from "@/constants/i18n";
import { ACTIVITIES } from "@/domain/catalogs/activities";

export function ActivityGrid() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.home.exerciseActivity}</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <TouchableOpacity 
            key={activity.id} 
            style={styles.item}
            onPress={() => router.push({ pathname: '/activity/[id]', params: { id: activity.id, name: activity.label } })}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name={activity.icon} size={20} color={colors.textPrimary} />
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
