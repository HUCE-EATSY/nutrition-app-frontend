import React, { useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, AppState } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";
import { useDiaryStore } from "@/store/diaryStore";
import { useStepsStore } from "@/store/statsStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

export function SmallStatRow() {
  const t = useTranslation();
  const router = useRouter();
  const language = useSettingsStore((state) => state.language);
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const { exercises } = useDiaryStore();
  const burned = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    hydrated,
    isConnected,
    todaySteps,
    stepGoal,
    checkConnection,
  } = useStepsStore();

  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated) {
      // Kiểm tra kết nối khi mở ứng dụng hoặc khi đăng nhập thành công
      checkConnection();
    }

    // Tự động làm mới khi quay lại ứng dụng
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        const state = useStepsStore.getState();
        if (state.isConnected && useAuthStore.getState().isAuthenticated) {
          state.fetchTodaySteps();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [hydrated, isAuthenticated, checkConnection]);

  const handlePressSteps = () => {
    router.push("/stats/steps");
  };

  const progress = Math.min(1, todaySteps / stepGoal);

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={handlePressSteps}
          style={styles.touchableCard}
        >
          <SurfaceCard style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.label}>{t.home.stepsTitle}</Text>
              {isConnected && (
                <Ionicons name="footsteps" size={14} color={colors.primary} />
              )}
            </View>
            {isConnected ? (
              <View style={styles.stepsContent}>
                <Text style={styles.stepsValue}>
                  {todaySteps.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}{" "}
                  <Text style={styles.stepsValueUnit}>{t.stats.stepsUnit}</Text>
                </Text>
                
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                
                <Text style={styles.stepsGoalText}>
                  {t.stats.goal}: {stepGoal.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                </Text>
              </View>
            ) : (
              <View style={styles.content}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="footsteps" size={20} color={colors.primary} />
                </View>
                <Text style={styles.hint}>{t.home.connectHealth}</Text>
              </View>
            )}
          </SurfaceCard>
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push("/exercise-stats")}
          style={styles.touchableCard}
        >
          <SurfaceCard style={styles.card}>
            <View style={styles.titleRow}>
              <Text style={styles.label}>{t.home.exercise}</Text>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  router.push("/add-exercise");
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.plusCircle}>
                   <MaterialCommunityIcons name="plus" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              {exercises.length > 0 ? (
                <>
                  <Text style={styles.emptyText}>{t.exercise.workoutCountSuffix(exercises.length)}</Text>
                  <View style={styles.burningRow}>
                    <MaterialCommunityIcons name="fire" size={16} color={colors.danger} />
                    <Text style={styles.statValue}>{burned} kcal</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons name="fire" size={20} color={colors.danger} />
                  </View>
                  <Text style={styles.emptyText}>{t.home.noData}</Text>
                </>
              )}
            </View>
          </SurfaceCard>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cardWrapper: {
    flex: 1, // Mỗi wrapper chiếm đúng 50%
  },
  touchableCard: {
    flex: 1, // TouchableOpacity cũng chiếm 100% wrapper
  },
  card: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "space-between",
    minHeight: 110,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
    height: 20,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  content: {
    gap: 6,
    alignItems: "flex-start",
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    ...typography.caption,
    fontSize: 11,
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
  stepsContent: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
    width: "100%",
  },
  stepsValue: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  stepsValueUnit: {
    fontSize: 11,
    fontWeight: "normal",
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
    width: "100%",
    marginVertical: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  stepsGoalText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
});
