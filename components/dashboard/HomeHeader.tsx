import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, spacing, typography } from "@/constants";
import { t } from "@/constants/i18n";

export function HomeHeader() {
  const router = useRouter();
  
  const today = new Date();
  const formattedDate = `Hôm nay, ${today.getDate()} tháng ${(today.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.iconRow}>
          <Pressable hitSlop={10} onPress={() => router.push("/streaks")} style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}>
            <MaterialCommunityIcons name="fire" size={14} color={colors.warning} />
            <Text style={styles.badgeText}>0</Text>
          </Pressable>
          <Pressable hitSlop={10} onPress={() => router.push("/calendar")}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.title}>{t.home.title}</Text>
    </View>
  );
}

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function DateScroller() {
  const today = new Date();
  const currentDayName = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][today.getDay()];

  return (
    <View style={styles.scrollerWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {DAYS.map((day, index) => {
          const isActive = day === currentDayName;
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
  badgePressed: {
    opacity: 0.9,
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
