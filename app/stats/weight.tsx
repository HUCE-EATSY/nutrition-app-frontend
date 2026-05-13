import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWeightStats } from "@/hooks/stats/useWeightStats";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { LineChart } from "@/components/charts/LineChart";

export default function WeightStatsScreen() {
  const router = useRouter();
  const { period, activeTabLabel, tabs, handleTabChange } = useWeightStats();
  const { draft } = useOnboardingStore();

  const currentWeight = draft.currentWeightKg || 53.6;
  const targetWeight = draft.targetWeightKg || 50.0;
  const initialWeight = 52.8;

  const actualData = [
    { label: "01", value: 52.8 },
    { label: "05", value: 53.0 },
    { label: "10", value: 53.2 },
    { label: "15", value: 53.6 },
    { label: "20", value: 53.5 },
    { label: "25", value: 53.6 },
    { label: "31", value: 53.6 },
  ];

  const targetData = [
    { label: "01", value: targetWeight },
    { label: "05", value: targetWeight },
    { label: "10", value: targetWeight },
    { label: "15", value: targetWeight },
    { label: "20", value: targetWeight },
    { label: "25", value: targetWeight },
    { label: "31", value: targetWeight },
  ];

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê cân nặng</Text>
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
          <Text style={styles.dateRangeText}>Tháng 5</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.card}>
          <View style={styles.chartContainer}>
            <LineChart 
              actualData={actualData}
              targetData={targetData}
              minValue={48}
              maxValue={55}
            />
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FFFFFF" }]} />
              <Text style={{color: '#9CA3AF'}}>Đường mục tiêu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
              <Text style={{color: '#9CA3AF'}}>Dữ liệu ghi nhận</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>BAN ĐẦU</Text>
            <Text style={styles.summaryValuePurple}>{initialWeight} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>HIỆN TẠI</Text>
            <Text style={styles.summaryValueWhite}>{currentWeight} kg</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>THAY ĐỔI</Text>
            <Text style={styles.summaryValuePurple}>+{(currentWeight - initialWeight).toFixed(1)} kg</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hình ảnh tiến trình</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <TouchableOpacity style={styles.addPhotoBtn}>
              <Ionicons name="add" size={32} color="#8B5CF6" />
            </TouchableOpacity>
            {/* Empty space for future photos */}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Chia sẻ hành trình</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Chỉ số BMI</Text>
            <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" style={{marginLeft: 8}} />
          </View>
          <View style={styles.bmiHeader}>
            <View style={styles.bmiStatus}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text style={styles.bmiStatusText}>Bình thường</Text>
            </View>
            <Text style={styles.bmiTrend}>Xu hướng: 0</Text>
          </View>
          <View style={styles.bmiChartPlaceholder}>
            <Text style={{color: '#9CA3AF'}}>Biểu đồ BMI (Rút gọn)</Text>
          </View>
        </View>
        
        <View style={styles.footerNav}>
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Nhật ký cân nặng</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Xem lịch sử</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
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
  dateNavigator: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16, gap: 16 },
  dateRangeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  card: { backgroundColor: "#1E1B2E", borderRadius: 16, padding: 16, marginBottom: 16 },
  chartContainer: { alignItems: "center", marginVertical: 8 },
  legendContainer: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: "#1E1B2E", borderRadius: 12, padding: 12, alignItems: "center" },
  summaryLabel: { color: "#9CA3AF", fontSize: 10, fontWeight: "bold", marginBottom: 8 },
  summaryValuePurple: { color: "#A78BFA", fontSize: 16, fontWeight: "bold" },
  summaryValueWhite: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  addPhotoBtn: { width: 80, height: 120, borderRadius: 12, borderWidth: 2, borderColor: "#8B5CF6", borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginRight: 12 },
  actionBtn: { alignSelf: "center", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: "#8B5CF6", marginBottom: 24 },
  actionBtnText: { color: "#8B5CF6", fontSize: 16, fontWeight: "bold" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  bmiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  bmiStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  bmiStatusText: { color: "#22C55E", fontSize: 16, fontWeight: "bold" },
  bmiTrend: { color: "#9CA3AF", fontSize: 14 },
  bmiChartPlaceholder: { height: 100, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  footerNav: { backgroundColor: "#1E1B2E", borderRadius: 16, paddingHorizontal: 16, marginBottom: 32 },
  footerLink: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  footerLinkText: { color: "#FFFFFF", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#374151" },
});
