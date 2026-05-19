import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { exerciseService, ExerciseLog } from "@/services/exerciseService";
import { getTodayDateISO, formatShortDate } from "@/hooks/utils/date";

export default function ExerciseDiaryScreen() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateISO());

  useEffect(() => {
    loadLogs();
  }, [selectedDate]);

  async function loadLogs() {
    try {
      setLoading(true);
      // Lấy logs trong vòng 30 ngày gần nhất
      const endDate = selectedDate;
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 30);
      const startDateISO = startDate.toISOString().split("T")[0];
      
      const data = await exerciseService.getLogs(startDateISO, endDate);
      setLogs(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải nhật ký tập luyện");
      console.error(error);
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
              Alert.alert("Thành công", "Đã xóa nhật ký");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa nhật ký");
            }
          },
        },
      ]
    );
  }

  function goToPrevDay() {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  }

  function goToNextDay() {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  }

  // Nhóm logs theo ngày
  const logsByDate = logs.reduce((acc, log) => {
    const date = log.logDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ExerciseLog[]>);

  const dates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a));

  // Tính tổng calo và thời gian
  const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);

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
        <Text style={styles.headerTitle}>Nhật ký tập luyện</Text>
        <Pressable hitSlop={12} onPress={() => router.push("/add-exercise")}>
          <Ionicons color={colors.primary} name="add-circle-outline" size={28} />
        </Pressable>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <Pressable hitSlop={12} onPress={goToPrevDay}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={20} />
        </Pressable>
        <Text style={styles.dateText}>{formatShortDate(selectedDate)}</Text>
        <Pressable hitSlop={12} onPress={goToNextDay}>
          <Ionicons color={colors.textPrimary} name="chevron-forward" size={20} />
        </Pressable>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "rgba(255,107,107,0.15)" }]}>
          <Ionicons color="#FF6B6B" name="flame" size={24} />
          <Text style={styles.summaryValue}>{totalCalories}</Text>
          <Text style={styles.summaryLabel}>Calo đốt</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "rgba(92,214,122,0.15)" }]}>
          <Ionicons color={colors.success} name="time-outline" size={24} />
          <Text style={styles.summaryValue}>{totalMinutes}</Text>
          <Text style={styles.summaryLabel}>Phút</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "rgba(165,108,255,0.15)" }]}>
          <MaterialCommunityIcons color={colors.primary} name="dumbbell" size={24} />
          <Text style={styles.summaryValue}>{logs.length}</Text>
          <Text style={styles.summaryLabel}>Bài tập</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={dates}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
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
        }
        renderItem={({ item: date }) => {
          const dateLogs = logsByDate[date];
          const dayTotal = dateLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
          
          return (
            <View style={styles.dateSection}>
              <View style={styles.dateSectionHeader}>
                <Text style={styles.dateSectionTitle}>{formatShortDate(date)}</Text>
                <Text style={styles.dateSectionSubtitle}>
                  {dayTotal} kcal • {dateLogs.length} bài tập
                </Text>
              </View>
              
              {dateLogs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logIcon}>
                    <MaterialCommunityIcons
                      color={colors.success}
                      name="dumbbell"
                      size={20}
                    />
                  </View>
                  
                  <View style={styles.logContent}>
                    <Text style={styles.logTitle}>{log.exerciseNameVi}</Text>
                    <View style={styles.logDetails}>
                      <View style={styles.logDetailItem}>
                        <Ionicons color={colors.textMuted} name="time-outline" size={14} />
                        <Text style={styles.logDetailText}>{log.durationMinutes} phút</Text>
                      </View>
                      <View style={styles.logDetailItem}>
                        <Ionicons color={colors.textMuted} name="flame" size={14} />
                        <Text style={styles.logDetailText}>{log.caloriesBurned} kcal</Text>
                      </View>
                      <View style={styles.logDetailItem}>
                        <Ionicons color={colors.textMuted} name="speedometer-outline" size={14} />
                        <Text style={styles.logDetailText}>
                          {log.intensity === 1 ? "Nhẹ" : log.intensity === 3 ? "Nặng" : "TB"}
                        </Text>
                      </View>
                    </View>
                    {log.notes && (
                      <Text style={styles.logNotes} numberOfLines={2}>
                        {log.notes}
                      </Text>
                    )}
                  </View>
                  
                  <Pressable hitSlop={8} onPress={() => handleDelete(log.id)}>
                    <Ionicons color={colors.danger} name="trash-outline" size={20} />
                  </Pressable>
                </View>
              ))}
            </View>
          );
        }}
      />

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/add-exercise")}
      >
        <Ionicons color="#fff" name="add" size={28} />
      </Pressable>
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
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  dateText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  summaryValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontSize: 24,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: spacing.lg,
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
  dateSection: {
    gap: spacing.sm,
  },
  dateSectionHeader: {
    marginBottom: spacing.xs,
  },
  dateSectionTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  dateSectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: "rgba(92,214,122,0.15)",
    alignItems: "center",
    justifyContent: "center",
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
  logNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
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
