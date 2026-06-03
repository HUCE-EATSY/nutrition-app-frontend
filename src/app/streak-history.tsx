import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { StreakMilestoneCard } from "@/components/streaks/StreakMilestoneCard";
import { StreakDetailStats } from "@/components/streaks/StreakDetailStats";
import { WeeklyProgressCard } from "@/components/streaks/WeeklyProgressCard";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useStreaks } from "@/hooks/useStreaks";
import { useAppColors } from "@/hooks/useAppColors";

export default function StreakHistoryScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const {
    currentStreak,
    shieldCount,
    weeklyProgress,
    freezeStreak,
    isFreezing,
    simLogStreak,
    isSimulating,
    isLoggedToday,
    isLoading,
  } = useStreaks();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const triggerToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const daysLogged = weeklyProgress.filter(Boolean).length;

  const handleShareStreak = async () => {
    try {
      await Share.share({
        message: `🔥 Tôi đang duy trì chuỗi ${currentStreak} ngày trên WAO Health! Bạn có thể duy trì được không? 💪`,
        title: "WAO Streak",
      });
    } catch (e) {
      triggerToast("Không thể chia sẻ lúc này.", "error");
    }
  };

  const handleFreeze = async () => {
    try {
      triggerToast("Đang đóng băng...", "info");
      await freezeStreak();
      triggerToast("Đóng băng hôm qua thành công! 🛡️", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể đóng băng!";
      triggerToast(msg, "error");
    }
  };

  const handleSimLog = async () => {
    try {
      triggerToast("Đang ghi nhận...", "info");
      await simLogStreak();
      triggerToast("Ghi nhận hôm nay thành công! +1 Streak 🔥", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ghi nhận thất bại!";
      triggerToast(msg, "error");
    }
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Lịch Sử Streak</Text>
          <TouchableOpacity onPress={handleShareStreak} style={styles.shareBtn}>
            <MaterialCommunityIcons name="share-variant" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Streak Badge */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="fire" size={52} color="#FFD700" />
          <Text style={styles.heroStreakNum}>{currentStreak}</Text>
          <Text style={styles.heroStreakLabel}>Ngày liên tiếp</Text>
          <Text style={styles.heroNote}>
            {daysLogged}/7 ngày trong tuần này ✅
          </Text>
        </View>

        {/* This week progress */}
        <WeeklyProgressCard
          daysOfWeek={daysOfWeek}
          weeklyProgress={weeklyProgress}
          onPressDay={(idx, dayName, isCompleted) => {
            triggerToast(
              isCompleted
                ? `${dayName}: Hoàn thành mục tiêu 🌟`
                : `${dayName}: Chưa đạt mục tiêu`,
              isCompleted ? "success" : "warning"
            );
          }}
        />

        {/* Stats */}
        <StreakDetailStats
          currentStreak={currentStreak}
          longestStreak={currentStreak}
          shieldCount={shieldCount}
        />

        {/* Milestones */}
        <StreakMilestoneCard currentStreak={currentStreak} />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleSimLog}
            disabled={isSimulating || isLoggedToday}
            style={[
              styles.actionBtn,
              { backgroundColor: isLoggedToday ? colors.surface : "#FF9500" },
            ]}
            activeOpacity={0.8}
          >
            {isSimulating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isLoggedToday ? "check-circle" : "food-apple"}
                  size={20}
                  color={isLoggedToday ? colors.textSecondary : "#fff"}
                />
                <Text style={[
                  styles.actionBtnText,
                  { color: isLoggedToday ? colors.textSecondary : "#fff" }
                ]}>
                  {isLoggedToday ? "Đã ghi hôm nay ✓" : "Ghi dinh dưỡng hôm nay"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFreeze}
            disabled={isFreezing || shieldCount <= 0}
            style={[
              styles.actionBtn,
              { backgroundColor: shieldCount > 0 ? colors.primary : colors.surface },
            ]}
            activeOpacity={0.8}
          >
            {isFreezing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="shield-alert"
                  size={20}
                  color={shieldCount > 0 ? "#fff" : colors.textSecondary}
                />
                <Text style={[
                  styles.actionBtnText,
                  { color: shieldCount > 0 ? "#fff" : colors.textSecondary }
                ]}>
                  Đóng băng hôm qua ({shieldCount})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Leaderboard shortcut */}
        <TouchableOpacity
          onPress={() => router.push("/leaderboard")}
          style={[styles.leaderboardBtn, { backgroundColor: colors.surface }]}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="podium" size={20} color="#FFD700" />
          <Text style={[styles.leaderboardBtnText, { color: colors.textPrimary }]}>
            Xem bảng xếp hạng Streak
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={2500}
        onHide={() => setShowToast(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: spacing.xs },
  shareBtn: { padding: spacing.xs },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: radius.lg,
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroStreakNum: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFD700",
    lineHeight: 72,
  },
  heroStreakLabel: {
    ...typography.bodyStrong,
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
  heroNote: {
    ...typography.caption,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: spacing.xs,
  },
  actionRow: {
    gap: spacing.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 50,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    ...typography.bodyStrong,
    fontSize: 15,
    fontWeight: "700",
  },
  leaderboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  leaderboardBtnText: {
    ...typography.bodyStrong,
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
});
