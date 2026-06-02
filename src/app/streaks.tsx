import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { StreakActionCard } from "@/components/streaks/StreakActionCard";
import { StreakChallengeSection } from "@/components/streaks/StreakChallengeSection";
import { StreakHeader } from "@/components/streaks/StreakHeader";
import { StreakStatsRow } from "@/components/streaks/StreakStatsRow";
import { WeeklyProgressCard } from "@/components/streaks/WeeklyProgressCard";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useStreaks } from "@/hooks/useStreaks";
import { useAppColors } from "@/hooks/useAppColors";

export default function StreaksScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { 
    streakDays, 
    currentStreak, 
    shieldCount, 
    weeklyProgress, 
    challengeProgress, 
    freezeStreak, 
    isFreezing,
    simLogStreak,
    isSimulating,
    isLoggedToday
  } = useStreaks();

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const triggerToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleFreeze = async () => {
    try {
      triggerToast("Đang xử lý đóng băng...", "info");
      await freezeStreak();
      triggerToast("Đóng băng chuỗi ngày hôm qua thành công! 🛡️", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không đủ điều kiện để đóng băng!";
      triggerToast(msg, "error");
    }
  };

  const handleSimLog = async () => {
    try {
      triggerToast("Đang xử lý ghi nhận món ăn...", "info");
      await simLogStreak();
      triggerToast("Ghi nhận dinh dưỡng thành công! Chuỗi Streak tăng +1! 🔥", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Ghi nhận dinh dưỡng thất bại!";
      triggerToast(msg, "error");
    }
  };

  const handleSeeMore = () => {
    triggerToast("Thử thách Ăn Sạch: Duy trì Streak để nhận quà và Cúp! 🏆", "info");
  };

  const handlePressDay = (idx: number, dayName: string, isCompleted: boolean) => {
    if (isCompleted) {
      triggerToast(`${dayName}: Bạn đã hoàn thành xuất sắc mục tiêu dinh dưỡng! 🌟`, "success");
    } else {
      triggerToast(`${dayName}: Chưa đạt mục tiêu hoặc chưa được xử lý đóng băng.`, "warning");
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        <StreakHeader streakDays={streakDays} onBack={() => router.back()} />
        
        <StreakActionCard onPressAdd={handleSimLog} isLoading={isSimulating} isLogged={isLoggedToday} />
        
        <TouchableOpacity
          onPress={handleFreeze}
          disabled={isFreezing}
          activeOpacity={0.8}
          style={[
            styles.freezeBtn,
            { backgroundColor: colors.primary }
          ]}
        >
          {isFreezing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.freezeBtnContent}>
              <MaterialCommunityIcons name="shield-alert" size={20} color="#fff" />
              <Text style={styles.freezeBtnText}>Đóng Băng Chuỗi Ngày Hôm Qua</Text>
            </View>
          )}
        </TouchableOpacity>

        <StreakChallengeSection progress={challengeProgress} onPressSeeMore={handleSeeMore} />
        
        <WeeklyProgressCard daysOfWeek={daysOfWeek} weeklyProgress={weeklyProgress} onPressDay={handlePressDay} />
        
        <StreakStatsRow currentStreak={currentStreak} shieldCount={shieldCount} />
      </View>

      {/* Floating Toast Notification */}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  freezeBtn: {
    height: 52,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  freezeBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  freezeBtnText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontWeight: "700",
  },
});
