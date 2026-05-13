import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNutritionStats } from "@/hooks/stats/useNutritionStats";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { DateSlider } from "@/components/stats/DateSlider";
import { DonutChart } from "@/components/charts/DonutChart";
import { getTodayISO } from "@/hooks/utils/date";

export default function NutritionStatsScreen() {
  const router = useRouter();
  const { period, activeTabLabel, tabs, handleTabChange } = useNutritionStats();
  const { draft } = useOnboardingStore();
  
  // Mock DateSlider data
  const mockDates = [
    { dayOfWeek: "T2", date: 1, fullDateStr: "2026-05-01" },
    { dayOfWeek: "T3", date: 2, fullDateStr: "2026-05-02" },
    { dayOfWeek: "T4", date: 3, fullDateStr: "2026-05-03" },
    { dayOfWeek: "T5", date: 4, fullDateStr: "2026-05-04" },
    { dayOfWeek: "T6", date: 5, fullDateStr: "2026-05-05" },
    { dayOfWeek: "T7", date: 6, fullDateStr: getTodayISO() },
    { dayOfWeek: "CN", date: 7, fullDateStr: "2026-05-07" },
  ];
  
  const [selectedDate, setSelectedDate] = React.useState(getTodayISO());

  const targetCal = 2225;
  const consumedCal = 0;
  
  const macroData = [
    { label: "Chất đạm", value: 0, color: "#EF4444" },
    { label: "Đường bột", value: 0, color: "#3B82F6" },
    { label: "Chất béo", value: 0, color: "#F59E0B" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê dinh dưỡng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <FilterTabs 
          tabs={tabs} 
          activeTab={activeTabLabel} 
          onChange={handleTabChange} 
        />
        
        {activeTabLabel === "Ngày" && (
          <DateSlider dates={mockDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        )}

        {/* Calorie Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thống kê lượng calo trong ngày</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Calo mục tiêu</Text>
            <Text style={styles.targetValue}>{targetCal} cal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Calo thực phẩm nạp vào</Text>
            <Text style={styles.greyValue}>- cal</Text>
          </View>
        </View>

        {/* Macro Statistics Card */}
        <View style={styles.card}>
          <View style={styles.chartContainer}>
            <DonutChart 
              data={macroData} 
              centerLabel="0%"
            />
          </View>
          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>⚡ Chất đạm (0g) | 0% | 20%</Text>
            <Text style={styles.legendText}>🍚 Đường bột (0g) | 0% | 50%</Text>
            <Text style={styles.legendText}>🥑 Chất béo (0g) | 0% | 30%</Text>
          </View>
        </View>
        
        {/* Detailed Nutrients List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Giá trị dinh dưỡng</Text>
          <NutrientRow label="Đường bột (carb)" current="-" target="278 g" />
          <NutrientRow label="Chất xơ" current="-" target="25 g" />
          <NutrientRow label="Đường" current="-" target="50 g" />
          <NutrientRow label="Chất béo (fat)" current="-" target="74 g" />
          <NutrientRow label="Chất đạm (protein)" current="-" target="111 g" />
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Khoáng chất</Text>
          <NutrientRow label="Canxi" current="-" target="1.000 mg" />
          <NutrientRow label="Kali" current="-" target="3.500 mg" />
          <NutrientRow label="Sắt" current="-" target="18 mg" isLast />
        </View>
      </View>
    </ScrollView>
  );
}

const NutrientRow = ({ label, current, target, isLast = false }: any) => (
  <View style={[styles.nutrientRow, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.nutrientLabel}>{label}</Text>
    <Text style={styles.nutrientCurrent}>{current}</Text>
    <Text style={styles.nutrientTarget}>{target}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#12101F" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 60 },
  backBtn: { padding: 8 },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  card: { backgroundColor: "#1E1B2E", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 8 },
  rowLabel: { color: "#9CA3AF", fontSize: 16 },
  targetValue: { color: "#A78BFA", fontSize: 16, fontWeight: "bold" },
  greyValue: { color: "#9CA3AF", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#374151", marginVertical: 8 },
  chartContainer: { alignItems: "center", marginVertical: 16 },
  legendContainer: { marginTop: 16, gap: 8 },
  legendText: { color: "#9CA3AF", fontSize: 14 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  nutrientRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#374151" },
  nutrientLabel: { flex: 2, color: "#FFFFFF" },
  nutrientCurrent: { flex: 1, color: "#9CA3AF", textAlign: "center" },
  nutrientTarget: { flex: 1, color: "#A78BFA", textAlign: "right" },
});
