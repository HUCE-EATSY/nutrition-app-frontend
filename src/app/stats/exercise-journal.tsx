import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { exerciseService } from "@/services/exerciseService";
import { colors } from "@/constants";

interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseNameVi: string;
  exerciseNameEn: string;
  exerciseIconUrl: string | null;
  logDate: string;
  durationMinutes: number;
  intensity: number;
  caloriesBurned: number;
  notes: string | null;
  createdAt: string;
}

interface GroupedLogs {
  date: string;
  dateDisplay: string;
  timeLabel: string; // "Hôm nay", "Hôm qua", hoặc ngày cụ thể
  totalCalories: number;
  totalDuration: number;
  logs: ExerciseLog[];
}

export default function ExerciseJournalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Lấy params từ navigation (period: "week" | "month" | "6months")
  const period = (params.period as string) || "week";
  const startDate = params.startDate as string;
  const endDate = params.endDate as string;
  
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    loadExerciseLogs();
  }, [startDate, endDate]);

  async function loadExerciseLogs() {
    try {
      setLoading(true);
      const logs = await exerciseService.getLogs(startDate, endDate);
      
      // Nhóm logs theo ngày
      const grouped = groupLogsByDate(logs);
      
      // Tính tổng
      const totalCals = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
      const totalMins = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
      
      setGroupedLogs(grouped);
      setTotalCalories(Math.round(totalCals));
      setTotalDuration(totalMins);
    } catch (error) {
      console.error("Failed to load exercise logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function groupLogsByDate(logs: ExerciseLog[]): GroupedLogs[] {
    // Tạo map theo ngày
    const dateMap = new Map<string, ExerciseLog[]>();
    
    logs.forEach(log => {
      const date = log.logDate;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(log);
    });

    // Convert sang mảng và sắp xếp
    const grouped: GroupedLogs[] = [];
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    
    dateMap.forEach((logs, date) => {
      const dateObj = new Date(date + "T00:00:00");
      
      // Xác định label: "Hôm nay", "Hôm qua", hoặc ngày cụ thể
      let timeLabel = "";
      if (date === todayISO) {
        timeLabel = "Hôm nay";
      } else if (date === yesterdayISO) {
        timeLabel = "Hôm qua";
      } else {
        timeLabel = formatDateShort(dateObj); // "Hôm qua" style
      }
      
      const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
      const totalDuration = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
      
      grouped.push({
        date,
        dateDisplay: formatDate(dateObj),
        timeLabel,
        totalCalories: Math.round(totalCalories),
        totalDuration,
        logs: logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      });
    });

    // Sắp xếp theo ngày giảm dần (mới nhất trước)
    return grouped.sort((a, b) => b.date.localeCompare(a.date));
  }

  function formatDateShort(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return formatDate(date);
  }

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}:${String(mins).padStart(2, '0')} phút` : `${hours}:00 phút`;
  }

  function getPeriodTitle(): string {
    if (period === "week") return "Tuần này";
    if (period === "month") return "Tháng này";
    if (period === "6months") return "6 tháng qua";
    return "Nhật ký luyện tập";
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nhật ký luyện tập</Text>
          <View style={styles.headerSideBtn} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.danger} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhật ký luyên tập</Text>
        <View style={styles.headerSideBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* MOTIVATION BANNER - Đặt lên đầu */}
        <View style={styles.motivationBanner}>
          <Text style={styles.motivationIcon}>💪 ⚠️</Text>
          <Text style={styles.motivationText}>
            Lượng calo bạn đốt qua tập luyện sẽ không ảnh hưởng vào lượng calo mà bạn đã ăn. 💯
          </Text>
        </View>

        {/* EXERCISE LOGS GROUPED BY DATE */}
        {groupedLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Chưa có dữ liệu tập luyện</Text>
            <Text style={styles.emptySubtext}>
              Hãy bắt đầu ghi lại các bài tập của bạn
            </Text>
          </View>
        ) : (
          <View style={styles.logsContainer}>
            {/* SECTION TITLE - May 2026 */}
            <Text style={styles.sectionTitle}>May 2026</Text>
            
            {groupedLogs.map((group) => (
              <View key={group.date} style={styles.dayGroup}>
                {/* EXERCISE LOGS */}
                {group.logs.map((log) => (
                  <View key={log.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logExerciseName}>{log.exerciseNameVi}</Text>
                      <Text style={styles.logTimeLabel}>{group.timeLabel}</Text>
                    </View>
                    
                    <View style={styles.logStats}>
                      <View style={styles.logStatItem}>
                        <Ionicons name="flame" size={16} color={colors.danger} />
                        <Text style={styles.logStatText}>{Math.round(log.caloriesBurned)} cal</Text>
                      </View>
                      <View style={styles.logStatItem}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.logStatText}>{formatTime(log.durationMinutes)}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14121c"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16
  },
  headerSideBtn: {
    padding: 8,
    width: 44,
    alignItems: "center"
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center"
  },
  content: {
    flex: 1,
    padding: 16
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14
  },

  // Motivation Banner - Giống ảnh (màu xanh lá đậm)
  motivationBanner: {
    backgroundColor: "#1a4d2e", // Xanh lá đậm
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24
  },
  motivationIcon: {
    fontSize: 20
  },
  motivationText: {
    flex: 1,
    color: "#E5E5EA",
    fontSize: 13,
    lineHeight: 20
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8
  },

  // Logs Container
  logsContainer: {
    marginBottom: 32
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16
  },

  // Day Group - Không có header riêng nữa
  dayGroup: {
    marginBottom: 12 // Giảm khoảng cách giữa các card
  },

  // Log Card - Giống ảnh
  logCard: {
    backgroundColor: "#1e1b2e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  logExerciseName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    flex: 1
  },
  logTimeLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  logStats: {
    flexDirection: "row",
    gap: 20
  },
  logStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  logStatText: {
    color: colors.textSecondary,
    fontSize: 14
  }
});
