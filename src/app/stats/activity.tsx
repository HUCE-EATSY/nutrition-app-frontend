import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useActivityStats } from "@/hooks/stats/useActivityStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { DateNavigator } from "@/components/stats/DateNavigator";
import { ActivityChartCard } from "@/components/stats/activity/ActivityChartCard";
import { HealthConnectBanner } from "@/components/stats/activity/HealthConnectBanner";
import { CalorieStatsCard } from "@/components/stats/activity/CalorieStatsCard";
import { InsightBox } from "@/components/stats/InsightBox";
import { exerciseService } from "@/services/exerciseService";
import { getTodayDateISO } from "@/hooks/utils/date";

export default function ActivityStatsScreen() {
  const router = useRouter();
  const { activeTabLabel, tabs, handleTabChange } = useActivityStats();
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<{ label: string; value: number }[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [daysStatus, setDaysStatus] = useState<{ day: string; hasData: boolean }[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  async function loadWeeklyData() {
    try {
      setLoading(true);
      const today = new Date();
      const endDate = getTodayDateISO();
      
      // Lấy 7 ngày gần nhất
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      const startDateISO = startDate.toISOString().split('T')[0];

      const logs = await exerciseService.getLogs(startDateISO, endDate);

      // Tạo map calories theo ngày
      const caloriesByDate: Record<string, number> = {};
      logs.forEach(log => {
        if (!caloriesByDate[log.logDate]) {
          caloriesByDate[log.logDate] = 0;
        }
        caloriesByDate[log.logDate] += log.caloriesBurned;
      });

      // Tạo data cho 7 ngày
      const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      const chartData: { label: string; value: number }[] = [];
      const statusData: { day: string; hasData: boolean }[] = [];
      let totalCalories = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateISO = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const label = dayLabels[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
        
        const calories = Math.round(caloriesByDate[dateISO] || 0);
        chartData.push({ label, value: calories });
        statusData.push({ day: label, hasData: calories > 0 });
        totalCalories += calories;
      }

      setWeekData(chartData);
      setDaysStatus(statusData);
      setWeeklyAverage(Math.round(totalCalories / 7));
    } catch (error) {
      console.error("Failed to load weekly exercise data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê hoạt động</Text>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => router.push("/add-exercise")}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FilterTabs 
          tabs={tabs} 
          activeTab={activeTabLabel} 
          onChange={handleTabChange} 
        />
        
        <DateNavigator label="7 ngày gần nhất" />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A56CFF" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            <ActivityChartCard data={weekData} averageValue={weeklyAverage} />

            <HealthConnectBanner />

            <CalorieStatsCard 
              targetCalories={weeklyAverage} 
              consumedCalories={weekData.reduce((sum, d) => sum + d.value, 0)} 
              daysStatus={daysStatus} 
            />
            
            {weekData.every(d => d.value === 0) ? (
              <InsightBox message="Hãy bắt đầu ghi nhận các bài tập để theo dõi tiến độ của bạn nhé!" />
            ) : (
              <InsightBox message={`Bạn đã đốt cháy trung bình ${weeklyAverage} kcal/ngày trong tuần này!`} />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#12101F" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 60 },
  backBtn: { padding: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: "#8E8E93",
    fontSize: 14,
  },
});
