import React from "react";
import { useAppColors } from "@/hooks/useAppColors";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useActivityStats } from "@/hooks/stats/useActivityStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { DateNavigator } from "@/components/stats/DateNavigator";
import { ActivityChartCard } from "@/components/stats/activity/ActivityChartCard";
import { HealthConnectBanner } from "@/components/stats/activity/HealthConnectBanner";
import { CalorieStatsCard } from "@/components/stats/activity/CalorieStatsCard";
import { InsightBox } from "@/components/stats/InsightBox";
import { ScreenBackground } from "@/components/layout/ScreenBackground";

export default function ActivityStatsScreen() {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const { activeTabLabel, tabs, handleTabChange } = useActivityStats();

  const barData = [
    { label: "T2", value: 0 },
    { label: "T3", value: 0 },
    { label: "T4", value: 0 },
    { label: "T5", value: 0 },
    { label: "T6", value: 0 },
    { label: "T7", value: 0 },
    { label: "CN", value: 0 },
  ];

  const daysStatus = [
    { day: "T2", hasData: false },
    { day: "T3", hasData: false },
    { day: "T4", hasData: false },
    { day: "T5", hasData: false },
    { day: "T6", hasData: false },
    { day: "T7", hasData: false },
    { day: "CN", hasData: false },
  ];

  return (
    <ScreenBackground withGlow={false}>
      <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê hoạt động</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="add" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FilterTabs 
          tabs={tabs} 
          activeTab={activeTabLabel} 
          onChange={handleTabChange} 
        />
        
        <DateNavigator label="04/05 - 10/05" />

        <ActivityChartCard data={barData} averageValue={200} />

        <HealthConnectBanner />

        <CalorieStatsCard 
          targetCalories={763} 
          consumedCalories={0} 
          daysStatus={daysStatus} 
        />
        
        <InsightBox message="Hãy bắt đầu ghi nhận các bài tập để theo dõi tiến độ của bạn nhé!" />
      </View>
    </ScrollView>
    </ScreenBackground>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: 60 },
  backBtn: { padding: 8 },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
});
