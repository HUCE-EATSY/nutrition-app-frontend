import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { getTodayDateISO, formatLocalDateISO } from "@/hooks/utils/date";

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
      const startDateISO = formatLocalDateISO(startDate);
      
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

  // Format date to show "Hôm nay", "Hôm qua", or dd/MM/yyyy
  function formatDateLabel(dateStr: string): string {
    const today = getTodayDateISO();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatLocalDateISO(yesterday);

    if (dateStr === today) return "Hôm nay";
    if (dateStr === yesterdayISO) return "Hôm qua";
    
    // Hiển thị ngày theo format dd/MM
    const [year, month, day] = dateStr.split('-');
    const currentYear = new Date().getFullYear().toString();
    return year === currentYear ? `${day}/${month}` : `${day}/${month}/${year}`;
  }

  // Format month header
  function formatMonthHeader(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
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
        <View style={styles.headerActions}>
          <Pressable hitSlop={12} onPress={() => router.push("/stats/activity")} style={{ marginRight: spacing.md }}>
            <Ionicons color={colors.textSecondary} name="stats-chart-outline" size={22} />
          </Pressable>
          <Pressable hitSlop={12} onPress={() => router.push("/add-exercise")}>
            <Ionicons color={colors.primary} name="add-circle-outline" size={28} />
          </Pressable>
        </View>
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
                
                return (
                  <View key={date} style={styles.dateGroup}>
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateLabel}>{formatDateLabel(date)}</Text>
                      <Text style={styles.dateSubtitle}>
                        ⏱ {dateLogs.reduce((sum, log) => sum + log.durationMinutes, 0)} phút
                      </Text>
                    </View>
                    
                    {dateLogs.map((log) => (
                      <View key={log.id} style={styles.logCard}>
                        <Pressable 
                          style={styles.logPressableContent}
                          onPress={() => router.push(`/edit-exercise-log?logId=${log.id}`)}
                        >
                          {/* Exercise Icon */}
                          {log.exerciseIconUrl ? (
                            <Image
                              source={{ uri: log.exerciseIconUrl }}
                              style={styles.logIcon}
                            />
                          ) : (
                            <View style={styles.logIconPlaceholder}>
                              <Ionicons name="fitness-outline" size={20} color={colors.textMuted} />
                            </View>
                          )}
                          
                          <View style={styles.logContent}>
                            <Text style={styles.logTitle}>{log.exerciseNameVi}</Text>
                            <View style={styles.logDetails}>
                              <View style={styles.logDetailItem}>
                                <Ionicons color={colors.textMuted} name="time-outline" size={14} />
                                <Text style={styles.logDetailText}>{log.durationMinutes} phút</Text>
                              </View>
                              <View style={[styles.intensityBadge,
                                log.intensity === 1 ? styles.intensityLight :
                                log.intensity === 3 ? styles.intensityHard :
                                styles.intensityMed
                              ]}>
                                <Text style={styles.intensityBadgeText}>
                                  {log.intensity === 1 ? 'Nhẹ' : log.intensity === 3 ? 'Nặng' : 'TB'}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                        
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2,
    gap: spacing.lg,
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
  logPressableContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.bgBase,
  },
  logIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityLight: {
    backgroundColor: "rgba(59,130,246,0.15)",
  },
  intensityMed: {
    backgroundColor: "rgba(245,158,11,0.15)",
  },
  intensityHard: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  intensityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
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
