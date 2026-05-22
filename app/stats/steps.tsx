import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useStepsStats } from "@/hooks/stats/useStepsStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { BarChart } from "@/components/charts/BarChart";

export default function StepsStatsScreen() {
  const router = useRouter();
  const { activeTabLabel, tabs, handleTabChange } = useStepsStats();

  const barData = [
    { label: "T2", value: 3000 },
    { label: "T3", value: 4500 },
    { label: "T4", value: 6000 },
    { label: "T5", value: 2000 },
    { label: "T6", value: 8000 },
    { label: "T7", value: 10000 },
    { label: "CN", value: 5000 },
  ];

  return (
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
          <Text style={styles.dateRangeText}>04/05 - 10/05</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.card}>
          <View style={styles.chartContainer}>
            <BarChart 
              data={barData} 
              averageValue={5500}
              barColor="#22C55E" 
              showYAxis={false} 
            />
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <Text style={{color: '#9CA3AF'}}>--- Bước trung bình</Text>
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
              <Text style={styles.subHeader}>Mục tiêu: 5,000 bước/ngày</Text>
            </View>
          </View>
          <View style={styles.gridMetrics}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>5,500 <Text style={styles.metricUnit}>bước/ngày</Text></Text>
              <Text style={styles.metricLabel}>Trung bình tuần này</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>4,200 <Text style={styles.metricUnit}>bước/ngày</Text></Text>
              <Text style={styles.metricLabel}>Trung bình tuần trước</Text>
            </View>
          </View>
        </View>

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
  container: { flex: 1, backgroundColor: "#12101F" },
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
});
