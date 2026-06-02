import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useActivityStats } from "@/hooks/stats/useActivityStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { BarChart } from "@/components/charts/BarChart";
import { exerciseService } from "@/services/exerciseService";
import { userService } from "@/services/userService";
import { colors } from "@/constants";

export default function ActivityStatsScreen() {
  const router = useRouter();
  const { activeTabLabel, tabs, handleTabChange } = useActivityStats();
  
  const [loading, setLoading] = useState(false);
  const [weekData, setWeekData] = useState<{ label: string; value: number }[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState(0);
  const [daysStatus, setDaysStatus] = useState<{ day: string; hasData: boolean }[]>([]);
  const [weeklyTargetCalories, setWeeklyTargetCalories] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [offsetWeeks, setOffsetWeeks] = useState(0);

  // State cho tab Tháng
  const [monthData, setMonthData] = useState<{ label: string; value: number }[]>([]);
  const [monthTracker, setMonthTracker] = useState<boolean[]>(Array(35).fill(false));
  const [monthTotalCalories, setMonthTotalCalories] = useState(0);
  const [monthAverageCalories, setMonthAverageCalories] = useState(0);

  // === DỮ LIỆU GIẢ LẬP CHO TAB 6 THÁNG ===
  const mock6MonthData = [
    { label: "Th01", value: 0 }, 
    { label: "Th02", value: 0 }, 
    { label: "Th03", value: 0 }, 
    { label: "Th04", value: 0 }, 
    { label: "Th05", value: 880 }, 
    { label: "Th06", value: 10 }
  ];

  useFocusEffect(
    useCallback(() => {
      if (activeTabLabel === "Tuần") {
        loadWeeklyData(offsetWeeks);
      } else if (activeTabLabel === "Tháng") {
        loadMonthData();
      }
    }, [offsetWeeks, activeTabLabel])
  );

  async function loadWeeklyData(offset: number) {
    try {
      setLoading(true);
      
      // Tính toán mốc thời gian (Thứ 2 đến Chủ nhật) dựa trên offset
      const now = new Date();
      // Tìm ngày Thứ 2 của tuần hiện tại (Lưu ý: getDay() Chủ nhật = 0, Thứ 2 = 1)
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      const diffToMonday = now.getDate() - dayOfWeek + 1;
      
      // Khởi tạo ngày Thứ 2 của tuần đang xét
      const startDate = new Date(now.setDate(diffToMonday));
      startDate.setDate(startDate.getDate() + (offset * 7)); // Lùi/tiến số tuần
      const startDateISO = startDate.toISOString().split('T')[0];
      
      // Khởi tạo ngày Chủ nhật của tuần đang xét
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const endDateISO = endDate.toISOString().split('T')[0];
      
      // Format date range cho display (VD: 01/06 - 07/06)
      const formatDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      };
      setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);

      // Gọi song song cả 2 API
      const [logs, caloriesData] = await Promise.all([
        exerciseService.getLogs(startDateISO, endDateISO),
        userService.getCalories().catch(() => null),
      ]);

      // Cập nhật mục tiêu calo tuần
      if (caloriesData) {
        setWeeklyTargetCalories(Math.round(caloriesData.weeklyTdee));
      }

      // Tạo map calo đốt cháy theo ngày
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
      let totalCals = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateISO = date.toISOString().split('T')[0];
        
        const currentDayOfWeek = date.getDay();
        const label = dayLabels[currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1];
        
        const calories = Math.round(caloriesByDate[dateISO] || 0);
        chartData.push({ label, value: calories });
        statusData.push({ day: label, hasData: calories > 0 });
        totalCals += calories;
      }

      setWeekData(chartData);
      setDaysStatus(statusData);
      setWeeklyAverage(Math.round(totalCals / 7));
    } catch (error) {
      console.error("Failed to load weekly exercise data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthData() {
    try {
      setLoading(true);
      
      // Lấy tháng hiện tại
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-11
      
      // Ngày đầu tháng
      const startDate = new Date(year, month, 1);
      const startDateISO = startDate.toISOString().split('T')[0];
      
      // Ngày cuối tháng
      const endDate = new Date(year, month + 1, 0);
      const endDateISO = endDate.toISOString().split('T')[0];
      const daysInMonth = endDate.getDate();
      
      // Gọi API lấy logs của tháng
      const logs = await exerciseService.getLogs(startDateISO, endDateISO);
      
      // Tạo map calo theo ngày
      const caloriesByDate: Record<string, number> = {};
      logs.forEach(log => {
        if (!caloriesByDate[log.logDate]) {
          caloriesByDate[log.logDate] = 0;
        }
        caloriesByDate[log.logDate] += log.caloriesBurned;
      });
      
      // Tạo data chart theo tuần (5 nhóm)
      const chartData: { label: string; value: number }[] = [];
      let weekCalories = 0;
      let weekStart = 1;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateISO = date.toISOString().split('T')[0];
        weekCalories += caloriesByDate[dateISO] || 0;
        
        // Kết thúc tuần (mỗi 7 ngày hoặc ngày cuối tháng)
        if (day % 7 === 0 || day === daysInMonth) {
          const weekEnd = day;
          chartData.push({
            label: `${weekStart}-${weekEnd}`,
            value: Math.round(weekCalories)
          });
          weekCalories = 0;
          weekStart = day + 1;
        }
      }
      
      // Tạo tracker grid (35 ô = 5 tuần × 7 ngày)
      // Tìm thứ mấy của ngày 1
      const firstDayOfWeek = startDate.getDay(); // 0 = CN, 1 = T2, ...
      const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Chuyển về T2 = 0
      
      const trackerData = Array(35).fill(false);
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateISO = date.toISOString().split('T')[0];
        const hasData = (caloriesByDate[dateISO] || 0) > 0;
        trackerData[offset + day - 1] = hasData;
      }
      
      // Tính tổng và trung bình
      const total = Object.values(caloriesByDate).reduce((sum, cal) => sum + cal, 0);
      const average = Math.round(total / daysInMonth);
      
      setMonthData(chartData);
      setMonthTracker(trackerData);
      setMonthTotalCalories(Math.round(total));
      setMonthAverageCalories(average);
    } catch (error) {
      console.error("Failed to load month exercise data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePrev = () => { 
    if (activeTabLabel === "Tuần") setOffsetWeeks(prev => prev - 1); 
  };
  const handleNext = () => { 
    if (activeTabLabel === "Tuần") setOffsetWeeks(prev => prev + 1); 
  };

  const totalCalories = weekData.reduce((sum, d) => sum + d.value, 0);

  // Xử lý text hiển thị của Date Navigator dựa vào Tab
  const getDateNavigatorText = () => {
    if (activeTabLabel === "Tháng") return "Tháng 6";
    if (activeTabLabel === "6 Tháng") return "01/01 - 30/06";
    return dateRange || "Đang tải...";
  };

  // Chọn data chart dựa vào Tab
  const currentChartData = 
    activeTabLabel === "Tháng" ? monthData :
    activeTabLabel === "6 Tháng" ? mock6MonthData :
    weekData;

  // FIX 1: Gán giá trị trung bình chính xác cho từng Tab để luôn hiện đường nét đứt
  const currentAverage = 
    activeTabLabel === "Tháng" ? monthAverageCalories : // Dùng giá trị tính từ data thật
    activeTabLabel === "6 Tháng" ? 0 : // 6 Tháng không có đường trung bình
    weeklyAverage;

  // FIX 3: Tính toán trục Y tự động co giãn theo số calo lớn nhất hoặc mức trung bình
  const currentMaxValue = Math.max(
    activeTabLabel === "6 Tháng" ? 1000 : 8, // Mức tối thiểu mặc định để biểu đồ không bị rỗng
    ...currentChartData.map(d => d.value), // Lấy cột có số calo cao nhất
    currentAverage // Đảm bảo đường trung bình luôn nằm trong khung hình
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê hoạt động</Text>
        <TouchableOpacity 
          style={styles.headerSideBtn}
          onPress={() => router.push("/add-exercise")}
        >
          <Ionicons name="add" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* TABS */}
        <FilterTabs 
          tabs={tabs} 
          activeTab={activeTabLabel} 
          onChange={handleTabChange} 
        />
        
        {/* DATE NAVIGATOR */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrev}>
            <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.dateRange}>{getDateNavigatorText()}</Text>
          <TouchableOpacity 
            style={[styles.navButton, activeTabLabel === "Tuần" && offsetWeeks >= 0 && { opacity: 0.3 }]}
            onPress={handleNext}
            disabled={activeTabLabel === "Tuần" && offsetWeeks >= 0}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Giữ nguyên layout để tránh layout shift, chỉ làm mờ khi loading */}
        <View style={{ position: "relative" }}>
          <View style={[loading && { opacity: 0.3 }]}>
            {/* CHART CARD */}
            <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <BarChart 
                  data={currentChartData} 
                  averageValue={currentAverage} // Đã truyền biến fix vào đây
                  barColor={colors.danger} 
                  showYAxis={true}
                  maxValue={currentMaxValue}
                />
              </View>

              {/* LEGEND */}
              <View style={styles.legendContainer}>
                {/* Ẩn dòng Trung bình nếu ở tab 6 Tháng */}
                {activeTabLabel !== "6 Tháng" && (
                  <View style={styles.legendItem}>
                    <View style={styles.legendLineDashed} />
                    <Text style={styles.legendText}>Trung bình mỗi ngày</Text>
                  </View>
                )}
                <View style={styles.legendItem}>
                  <View style={styles.legendBar} />
                  <Text style={styles.legendText}>Dữ liệu ghi nhận</Text>
                </View>
              </View>
            </View>

            {/* APPLE HEALTH BANNER */}
            <TouchableOpacity style={styles.healthBanner} activeOpacity={0.8}>
              <View style={styles.healthIconBox}>
                <Text style={styles.healthIcon}>❤️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthText}>
                  Kết nối Apple Health để tự động cập nhật.{" "}
                  <Text style={styles.healthLink}>Kết nối ngay</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* CALORIE STATS SECTION */}
            <View style={styles.calorieSection}>
              <View style={styles.calorieSectionHeader}>
                <View style={styles.flameIconBox}>
                  <Ionicons name="flame" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.calorieSectionTitle}>Thống kê calo tập luyện</Text>
                <TouchableOpacity>
                  <Ionicons name="information-circle" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* ===== UI RENDER THEO TAB ===== */}
              
              {/* TAB TUẦN */}
              {activeTabLabel === "Tuần" && (
                <>
                  <View style={styles.calorieMetrics}>
                    <View style={styles.calorieMetricBox}>
                      <View style={styles.calorieValueRow}>
                        <Text style={styles.calorieValue}>{weeklyTargetCalories}</Text>
                        <Text style={styles.calorieUnit}>calo</Text>
                      </View>
                      <Text style={styles.calorieLabel}>Mục tiêu/tuần</Text>
                    </View>
                    <View style={styles.calorieMetricBox}>
                      <View style={styles.calorieValueRow}>
                        <Text style={styles.calorieValue}>{totalCalories}</Text>
                        <Text style={styles.calorieUnit}>calo</Text>
                      </View>
                      <Text style={styles.calorieLabel}>Tổng calo tập luyện</Text>
                    </View>
                  </View>

                  <View style={styles.weeklyTracker}>
                    {daysStatus.map((status, idx) => (
                      <View key={idx} style={styles.trackerDayItem}>
                        <Text style={styles.trackerDayLabel}>{status.day}</Text>
                        <View style={[
                          styles.trackerDayCircle, 
                          status.hasData && styles.trackerDayCircleActive
                        ]}>
                          {status.hasData && (
                            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* TAB THÁNG */}
              {activeTabLabel === "Tháng" && (
                <>
                  <View style={styles.calorieMetrics}>
                    <View style={styles.calorieMetricBox}>
                      <View style={styles.calorieValueRow}>
                        <Text style={styles.calorieValue}>{monthTotalCalories}</Text>
                        <Text style={styles.calorieUnit}>calo</Text>
                      </View>
                      <Text style={styles.calorieLabel}>Tổng calo tháng này</Text>
                    </View>
                    <View style={styles.calorieMetricBox}>
                      <View style={styles.calorieValueRow}>
                        <Text style={styles.calorieValue}>{monthAverageCalories}</Text>
                        <Text style={styles.calorieUnit}>calo</Text>
                      </View>
                      <Text style={styles.calorieLabel}>Trung bình mỗi ngày</Text>
                    </View>
                  </View>

                  {/* Lưới lịch tháng (Grid Squares) đã được fix cứng hàng cột */}
                  <View style={styles.monthTrackerContainer}>
                    <View style={styles.monthTrackerHeader}>
                      {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(day => (
                        <Text key={day} style={styles.trackerDayLabel}>{day}</Text>
                      ))}
                    </View>
                    {/* FIX 2: Bọc các ô thành 5 hàng riêng biệt để không bao giờ bị lệch */}
                    <View style={styles.monthTrackerGrid}>
                      {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <View key={rowIndex} style={styles.monthTrackerRow}>
                          {monthTracker.slice(rowIndex * 7, rowIndex * 7 + 7).map((isActive, colIndex) => (
                            <View 
                              key={colIndex} 
                              style={[
                                styles.trackerSquare, 
                                isActive && styles.trackerSquareActive
                              ]} 
                            />
                          ))}
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {/* TAB 6 THÁNG */}
              {activeTabLabel === "6 Tháng" && (
                <View style={styles.insightBanner}>
                  <Text style={styles.insightText}>
                    🔥 Bạn từng làm được nhiều hơn trong tháng 5. Giờ là lúc thử lại nhé!
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Loading overlay - hiển thị ở giữa màn hình */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.danger} />
              <Text style={styles.loadingText}>Đang xử lý dữ liệu...</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
    width: 44, // Giữ width cố định để Title luôn nằm căn giữa
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
    padding: 16 
  },

  // Date Navigator
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dateRange: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Chart
  chartCard: {
    marginBottom: 20,
  },
  chartContainer: {
    position: "relative",
    marginVertical: 8,
  },
  chartGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderRadius: 16,
  },

  // Legend
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendLineDashed: {
    width: 16,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  legendBar: {
    width: 6,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Health Banner
  healthBanner: {
    backgroundColor: "#2a1a5e",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  healthIconBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  healthIcon: {
    fontSize: 18,
  },
  healthText: {
    color: "#E5E5EA",
    fontSize: 13,
    lineHeight: 20,
  },
  healthLink: {
    color: "#A78BFA",
    fontWeight: "600",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: 24,
  },

  // Calorie Section
  calorieSection: {
    marginBottom: 32,
  },
  calorieSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  flameIconBox: {
    backgroundColor: colors.danger,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieSectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },

  // Calorie Metrics
  calorieMetrics: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 36, // Tăng khoảng cách
  },
  calorieMetricBox: {
    flex: 1,
  },
  calorieValueRow: {
    flexDirection: "row", 
    alignItems: "baseline", 
    gap: 4 
  },
  calorieValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "bold",
  },
  calorieUnit: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  calorieLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },

  // Weekly Tracker
  weeklyTracker: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackerDayItem: {
    alignItems: "center",
    gap: 12,
  },
  trackerDayLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  trackerDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#302c42",
    alignItems: "center",
    justifyContent: "center",
  },
  trackerDayCircleActive: {
    backgroundColor: colors.danger,
  },

  // === STYLES CHO TAB THÁNG VÀ 6 THÁNG ===
  
  // Styles cho Tracker Tháng (Hình vuông)
  monthTrackerContainer: { 
    marginTop: 8 
  },
  monthTrackerHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 6, 
    marginBottom: 12 
  },
  // FIX 2: Sửa lại cách chia Grid
  monthTrackerGrid: { 
    flexDirection: "column", 
    gap: 10 // Tạo khoảng cách giữa các hàng ngang
  },
  monthTrackerRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Dàn đều 7 ô trên 1 hàng
  },
  trackerSquare: { 
    width: "12%", 
    aspectRatio: 1, 
    backgroundColor: "#302c42", 
    borderRadius: 6 
  },
  trackerSquareActive: { 
    backgroundColor: colors.danger 
  },

  // Styles cho tab 6 Tháng
  insightBanner: {
    backgroundColor: "#162345", // Màu xanh dương tối giống thiết kế
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  insightText: {
    color: "#E5E5EA",
    fontSize: 14,
    lineHeight: 22,
  },

  // Loading
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20, 18, 28, 0.7)",
    borderRadius: 16,
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
