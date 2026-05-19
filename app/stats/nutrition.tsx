import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNutritionStats } from "@/hooks/stats/useNutritionStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { DateSlider } from "@/components/stats/DateSlider";
import { PieChart } from "@/components/charts/PieChart";

export default function NutritionStatsScreen() {
  const router = useRouter();
  const { 
    period, activeTabLabel, tabs, handleTabChange,
    dates, selectedDate, handleSelectDate,
    summary, isLoading, error
  } = useNutritionStats();
  
  const targetCal = summary?.target?.target_calories ?? 0;
  const consumedCal = summary?.total_calories ?? 0;
  
  const proteinG = summary?.total_protein_g ?? 0;
  const carbG = summary?.total_carbs_g ?? 0;
  const fatG = summary?.total_fat_g ?? 0;

  const targetProteinG = summary?.target?.target_protein_g ?? 0;
  const targetCarbG = summary?.target?.target_carbs_g ?? 0;
  const targetFatG = summary?.target?.target_fat_g ?? 0;

  const proteinPct = summary?.target?.protein_pct ?? 0;
  const carbPct = summary?.target?.carbs_pct ?? 0;
  const fatPct = summary?.target?.fat_pct ?? 0;

  const centerLabelPct = summary?.target?.calories_pct ? Math.round(summary.target.calories_pct) : 0;

  const macroData = [
    { label: "Chất đạm", value: proteinG, color: "#EF4444" },
    { label: "Đường bột", value: carbG, color: "#3B82F6" },
    { label: "Chất béo", value: fatG, color: "#F59E0B" },
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
          <DateSlider dates={dates} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        )}

        {activeTabLabel === "Tuần" && (
           <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
             <Text style={{ color: '#9CA3AF' }}>Đang phát triển</Text>
           </View>
        )}

        {isLoading ? (
          <View style={[styles.card, { paddingVertical: 40, alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : activeTabLabel === "Ngày" ? (
          <>
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
                <Text style={styles.greyValue}>{consumedCal} cal</Text>
              </View>
            </View>

            {/* Macro Statistics Card */}
            <View style={styles.card}>
              <View style={styles.chartContainer}>
                <PieChart 
                  data={macroData} 
                />
              </View>
              <View style={styles.legendContainer}>
                <Text style={styles.legendText}>⚡ Chất đạm ({proteinG}g) | {proteinPct}% | 20%</Text>
                <Text style={styles.legendText}>🍚 Đường bột ({carbG}g) | {carbPct}% | 50%</Text>
                <Text style={styles.legendText}>🥑 Chất béo ({fatG}g) | {fatPct}% | 30%</Text>
              </View>
            </View>
            
            {/* Detailed Nutrients List */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Giá trị dinh dưỡng</Text>
              <NutrientRow label="Đường bột (carb)" current={`${carbG} g`} target={`${targetCarbG} g`} />
              <NutrientRow label="Chất xơ" current="-" target="-" />
              <NutrientRow label="Đường" current="-" target="-" />
              <NutrientRow label="Chất béo (fat)" current={`${fatG} g`} target={`${targetFatG} g`} />
              <NutrientRow label="Chất đạm (protein)" current={`${proteinG} g`} target={`${targetProteinG} g`} />
              
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Khoáng chất</Text>
              <NutrientRow label="Canxi" current="-" target="-" />
              <NutrientRow label="Kali" current="-" target="-" />
              <NutrientRow label="Sắt" current="-" target="-" isLast />
            </View>
          </>
        ) : null}
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
