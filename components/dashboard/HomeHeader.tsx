import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { t } from "@/constants/i18n";
import { colors, spacing, typography } from "@/constants";

export function HomeHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.dateText}>{t.home.kicker}</Text>
        <View style={styles.iconRow}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="fire" size={14} color={colors.warning} />
            <Text style={styles.badgeText}>0</Text>
          </View>
          <MaterialCommunityIcons name="calendar-blank-outline" size={20} color={colors.textSecondary} />
        </View>
      </View>
      <Text style={styles.title}>{t.home.title}</Text>
    </View>
  );
}

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function DateScroller() {
  return (
    <View style={styles.scrollerWrap}>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {DAYS.map((day, index) => {
            const isActive = day === "T3"; // Mocking T3 as selected like in the image
            return (
              <TouchableOpacity key={day} style={[styles.dayCircle, isActive && styles.dayActive]}>
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                 {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
       </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  scrollerWrap: {
    marginVertical: spacing.md,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: {
    backgroundColor: "rgba(165,108,255,0.2)",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  dayTextActive: {
    color: colors.primary,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 6,
  },
});
