import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStepsStats } from "@/hooks/stats/useStepsStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { BarChart } from "@/components/charts/BarChart";
import { ScreenBackground } from "@/components/layout/ScreenBackground";

export default function StepsStatsScreen() {
  const router = useRouter();
  const {
    activeTabLabel,
    tabs,
    handleTabChange,
    isConnected,
    isLoading,
    error,
    todaySteps,
    stepGoal,
    averageSteps,
    previousAverageSteps,
    historyData,
    dateRangeText,
    connectAndSync,
  } = useStepsStats();

  // Định dạng nhãn khoảng thời gian (Tuần / Tháng / 6 Tháng)
  const getPeriodLabel = (tab: string) => {
    if (tab === "Tuần") return "tuần này";
    if (tab === "Tháng") return "tháng này";
    return "6 tháng này";
  };

  const getPreviousPeriodLabel = (tab: string) => {
    if (tab === "Tuần") return "tuần trước";
    if (tab === "Tháng") return "tháng trước";
    return "6 tháng trước";
  };

  // Trạng thái chưa kết nối Health Connect
  if (!isConnected) {
    return (
      <ScreenBackground withGlow={false}>
        <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bước chân</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.connectContainer}>
            <View style={styles.iconCircleLarge}>
              <Ionicons name="footsteps-outline" size={48} color="#22C55E" />
            </View>
            <Text style={styles.connectTitle}>Tự động tính bước chân</Text>
            <Text style={styles.connectDesc}>
              Kết nối với Google Health Connect để tự động ghi nhận số bước chân của bạn mỗi ngày từ các thiết bị thông minh.
            </Text>
            
            <TouchableOpacity 
              style={styles.connectButton}
              activeOpacity={0.8}
              onPress={connectAndSync}
            >
              <Text style={styles.connectButtonText}>Kết nối Google Health</Text>
            </TouchableOpacity>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground withGlow={false}>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bước chân</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <FilterTabs 
            tabs={tabs} 
            activeTab={activeTabLabel} 
            onChange={handleTabChange} 
          />
          
          <View style={styles.dateNavigator}>
            <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
            <Text style={styles.dateRangeText}>{dateRangeText}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>

          {isLoading && historyData.length === 0 ? (
            <View style={[styles.card, { paddingVertical: 60, alignItems: "center" }]}>
              <ActivityIndicator size="large" color="#22C55E" />
            </View>
          ) : historyData.length === 0 ? (
            <View style={[styles.card, { paddingVertical: 48, alignItems: "center" }]}>
              <Ionicons name="footsteps-outline" size={40} color="#374151" />
              <Text style={{ color: "#9CA3AF", marginTop: 12 }}>Chưa có dữ liệu bước chân</Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <View style={styles.chartContainer}>
                  <BarChart 
                    data={historyData} 
                    averageValue={averageSteps}
                    barColor="#22C55E" 
                    showYAxis={false} 
                  />
                </View>
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <Text style={{color: '#9CA3AF'}}>--- Trung bình: {averageSteps.toLocaleString("vi-VN")} bước</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="footsteps" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>Thống kê bước chân</Text>
                    <Text style={styles.subHeader}>
                      Mục tiêu: {stepGoal.toLocaleString("vi-VN")} bước/ngày
                    </Text>
                  </View>
                </View>
                <View style={styles.gridMetrics}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>
                      {averageSteps.toLocaleString("vi-VN")}{" "}
                      <Text style={styles.metricUnit}>bước/ngày</Text>
                    </Text>
                    <Text style={styles.metricLabel}>Trung bình {getPeriodLabel(activeTabLabel)}</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>
                      {previousAverageSteps.toLocaleString("vi-VN")}{" "}
                      <Text style={styles.metricUnit}>bước/ngày</Text>
                    </Text>
                    <Text style={styles.metricLabel}>Trung bình {getPreviousPeriodLabel(activeTabLabel)}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Bước chân & mức độ hoạt động</Text>
              <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" style={{marginLeft: 8}} />
            </View>
            
            <ActivityLevelRow label="ÍT VẬN ĐỘNG" range="< 3,000" color="#EF4444" />
            <ActivityLevelRow label="NHẸ NHÀNG" range="3,000 - 6,499" color="#F59E0B" />
            <ActivityLevelRow label="TRUNG BÌNH" range="6,500 - 9,999" color="#3B82F6" />
            <ActivityLevelRow label="RẤT NĂNG ĐỘNG" range="10,000 - 12,499" color="#22C55E" />
            <ActivityLevelRow label="CỰC KỲ NĂNG ĐỘNG" range="> 12,500" color="#A78BFA" />
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const ActivityLevelRow = ({ label, range, color }: { label: string, range: string, color: string }) => (
  <View style={styles.levelRow}>
    <View style={[styles.colorDot, { backgroundColor: color }]} />
    <Text style={[styles.levelLabel, { color }]}>{label}</Text>
    <Text style={styles.levelRange}>{range}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 60 },
  backBtn: { padding: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  dateNavigator: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16, gap: 16 },
  dateRangeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  card: { backgroundColor: "#1E1B2E", borderRadius: 16, padding: 16, marginBottom: 16 },
  chartContainer: { alignItems: "center", marginVertical: 8 },
  legendContainer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#22C55E", alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  subHeader: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
  gridMetrics: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  metricBox: { flex: 1 },
  metricValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  metricUnit: { fontSize: 12, fontWeight: "normal", color: "#9CA3AF" },
  metricLabel: { color: "#9CA3AF", fontSize: 12 },
  levelRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#374151" },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  levelLabel: { flex: 1, fontSize: 14, fontWeight: "bold" },
  levelRange: { color: "#FFFFFF", fontSize: 14 },
  
  // Các style của phần xin quyền kết nối
  connectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 450,
  },
  iconCircleLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  connectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  connectDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  errorText: {
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
  },
});
