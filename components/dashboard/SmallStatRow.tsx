import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { t } from "@/constants/i18n";
import { colors, spacing, typography } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";

export function SmallStatRow() {
  return (
    <View style={styles.container}>
      <SurfaceCard style={styles.card}>
        <Text style={styles.label}>{t.home.stepsTitle}</Text>
        <View style={styles.content}>
           <MaterialCommunityIcons name="google-fit" size={24} color={colors.primary} />
           <Text style={styles.hint}>{t.home.connectHealth}</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{t.home.exercise}</Text>
          <View style={styles.plusCircle}>
             <MaterialCommunityIcons name="plus" size={14} color={colors.textPrimary} />
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>{t.home.noData}</Text>
          <View style={styles.burningRow}>
             <MaterialCommunityIcons name="fire" size={16} color={colors.danger} />
             <Text style={styles.statValue}>0</Text>
          </View>
        </View>
      </SurfaceCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  content: {
    marginTop: spacing.sm,
    gap: 4,
  },
  hint: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  burningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statValue: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  plusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
