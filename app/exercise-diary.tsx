import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { exerciseService, ExerciseLog } from "@/services/exerciseService";
import { getTodayDateISO } from "@/hooks/utils/date";

export default function ExerciseDiaryScreen() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload logs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  async function loadLogs() {
    try {
      setLoading(true);
      // Lấy logs trong vòng 90 ngày gần nhất
      const endDate = getTodayDateISO();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      const startDateISO = startDate.toISOString().split("T")[0];
      
      const data = await exerciseService.getLogs(startDateISO, endDate);
      setLogs(data);
    } catch (error) {
      console.error("Load logs error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }

  async function handleDelete(id: string) {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa nhật ký này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await exerciseService.deleteLog(id);
              setLogs(prev => prev.filter(log => log.id !== id));
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa nhật ký");
            }
          },
        },
      ]
    );
  }

  // Format date to show "Hôm nay", "Hôm qua", or date
  function formatDateLabel(dateStr: string): string {
    const today = getTodayDateISO();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return "Hôm nay";
    if (dateStr === yesterdayISO) return "Hôm qua";
    
    return dateStr;
  }

  // Format month header
  function formatMonthHeader(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Nhóm logs theo tháng và ngày
  const logsByMonth: Record<string, Record<string, ExerciseLog[]>> = {};
  logs.forEach(log => {
    const monthKey = log.logDate.substring(0, 7); // "2026-05"
    const dateKey = log.logDate;
    
    if (!logsByMonth[monthKey]) {
      logsByMonth[monthKey] = {};
    }
    if (!logsByMonth[monthKey][dateKey]) {
      logsByMonth[monthKey][dateKey] = [];
    }
    logsByMonth[monthKey][dateKey].push(log);
  });

  const months = Object.keys(logsByMonth).sort((a, b) => b.localeCompare(a));

  // Tính tổng calories
  const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải nhật ký...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Nhật ký luyện tập</Text>
        <Pressable hitSlop={12} onPress={() => router.push("/add-exercise")}>
          <Ionicons color={colors.primary} name="add-circle-outline" size={28} />
        </Pressable>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Warning Banner */}
        {totalCalories > 0 && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>💪⚠️</Text>
            <Text style={styles.warningText}>
              Lượng calo bạn đốt qua tập luyện sẽ không ảnh hưởng vào lượng calo mà bạn đã ăn. 👉
            </Text>
          </View>
        )}

        {/* Empty State */}
        {logs.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons color={colors.textMuted} name="dumbbell" size={64} />
            <Text style={styles.emptyText}>Chưa có nhật ký tập luyện</Text>
            <Pressable
              onPress={() => router.push("/add-exercise")}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Ghi hoạt động</Text>
            </Pressable>
          </View>
        )}

        {/* Logs by Month */}
        {months.map((month) => {
          const dates = Object.keys(logsByMonth[month]).sort((a, b) => b.localeCompare(a));
          const firstDate = dates[0];
          
          return (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthHeader}>{formatMonthHeader(firstDate)}</Text>
              
              {dates.map((date) => {
                const dateLogs = logsByMonth[month][date];
                const dayTotal = dateLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
                
                return (
                  <View key={date} style={styles.dateGroup}>
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
                      <Text style={styles.dateSubtitle}>
                        🔥 {Math.round(dayTotal)} cal   ⏱ {dateLogs.reduce((sum, log) => sum + log.durationMinutes, 0).toString().padStart(2, '0')}:{(0).toString().padStart(2, '0')} phút
                      </Text>
                    </View>
                    
                    {dateLogs.map((log) => (
                      <View key={log.id} style={styles.logCard}>
                        <View style={styles.logContent}>
                          <Text style={styles.logTitle}>{log.exerciseNameVi}</Text>
                          <View style={styles.logDetails}>
                            <View style={styles.logDetailItem}>
                              <Ionicons color={colors.textMuted} name="flame" size={14} />
                              <Text style={styles.logDetailText}>{Math.round(log.caloriesBurned)} cal</Text>
                            </View>
                            <View style={styles.logDetailItem}>
                              <Ionicons color={colors.textMuted} name="time-outline" size={14} />
                              <Text style={styles.logDetailText}>{log.durationMinutes.toString().padStart(2, '0')}:{(0).toString().padStart(2, '0')} phút</Text>
                            </View>
                          </View>
                        </View>
                        
                        <Pressable hitSlop={8} onPress={() => handleDelete(log.id)}>
                          <Ionicons color={colors.textMuted} name="trash-outline" size={20} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Action Button */}
      {logs.length > 0 && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/add-exercise")}
        >
          <Ionicons color="#fff" name="add" size={28} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { 
    ...typography.h3, 
    color: colors.textPrimary,
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(52, 168, 83, 0.15)",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(52, 168, 83, 0.3)",
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emptyButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  emptyButtonText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
  monthSection: {
    gap: spacing.md,
  },
  monthHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  dateGroup: {
    gap: spacing.sm,
  },
  dateHeader: {
    marginBottom: spacing.xs,
  },
  dateLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  dateSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 13,
  },
  logCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  logContent: {
    flex: 1,
    gap: spacing.xs,
  },
  logTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  logDetails: {
    flexDirection: "row",
    gap: spacing.md,
  },
  logDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logDetailText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
