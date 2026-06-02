import React from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useDiaryStore } from "@/store/diaryStore";
import { useGetUnreadCount } from "@/hooks/queries/useNotificationQueries";
import { useStreaks } from "@/hooks/useStreaks";

export function HomeHeader() {
  const t = useTranslation();
  const router = useRouter();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  
  const { selectedDate, setDate } = useDiaryStore();
  const { data: unreadCount = 0 } = useGetUnreadCount();
  const { currentStreak } = useStreaks();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;
  
  const getFormattedDate = () => {
    const dateObj = new Date(selectedDate);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    
    if (language === "en") {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const prefix = isToday ? "Today" : days[dateObj.getDay()];
      return `${prefix}, ${months[dateObj.getMonth()]} ${day}`;
    }
    
    const daysVi = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const prefixVi = isToday ? "Hôm nay" : daysVi[dateObj.getDay()];
    return `${prefixVi}, ${day} tháng ${month.toString().padStart(2, '0')}`;
  };
  const formattedDate = getFormattedDate();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.iconRow}>
          <Pressable hitSlop={10} onPress={() => router.push("/streaks")} style={({ pressed }) => [styles.badge, pressed && styles.badgePressed]}>
            <MaterialCommunityIcons name="fire" size={14} color={colors.warning} />
            <Text style={styles.badgeText}>{currentStreak}</Text>
          </Pressable>
          <Pressable hitSlop={10} onPress={() => router.push("/notifications")} style={styles.notifButton}>
            <Ionicons name={unreadCount > 0 ? "notifications" : "notifications-outline"} size={20} color={unreadCount > 0 ? colors.primary : colors.textSecondary} />
            {unreadCount > 0 && <View style={styles.badgeDot} />}
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

const DAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAYS_EN = ["M", "T", "W", "T", "F", "S", "S"];

export function DateScroller() {
  const { selectedDate, setDate } = useDiaryStore();
  const dateObj = new Date(selectedDate);
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  const daysList = language === "en" ? DAYS_EN : DAYS_VI;
  const currentDayIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;

  const handleDayPress = (targetIndex: number) => {
    const diff = targetIndex - currentDayIndex;
    const targetDateObj = new Date(selectedDate);
    targetDateObj.setDate(targetDateObj.getDate() + diff);
    const targetDateStr = targetDateObj.toISOString().split('T')[0];
    
    // Sử dụng setTimeout để Touch animation chạy mượt trước khi render lại trang nặng
    setTimeout(() => {
      setDate(targetDateStr);
    }, 50);
  };

  return (
    <View style={styles.scrollerWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {daysList.map((day, index) => {
          const isActive = index === currentDayIndex;
          return (
            <TouchableOpacity 
              key={`${day}-${index}`} 
              style={[styles.dayCircle, isActive && styles.dayActive]}
              onPress={() => handleDayPress(index)}
            >
              <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
  notifButton: {
    position: "relative",
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    borderWidth: 1.5,
    borderColor: colors.bgBase,
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
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayActive: {
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(165,108,255,0.2)" : "rgba(142,87,245,0.15)",
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
