import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CalorieStatsCardProps {
  targetCalories: number;
  consumedCalories: number;
  daysStatus: { day: string; hasData: boolean }[];
}

export const CalorieStatsCard = ({ targetCalories, consumedCalories, daysStatus }: CalorieStatsCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Ionicons name="flame" size={20} color="#EF4444" />
        <Text style={styles.cardTitle}> Thống kê calo tập luyện</Text>
      </View>
      
      <View style={styles.gridMetrics}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{targetCalories} calo</Text>
          <Text style={styles.metricLabel}>Mục tiêu/tuần</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{consumedCalories} calo</Text>
          <Text style={styles.metricLabel}>Tổng calo tập luyện</Text>
        </View>
      </View>

      <View style={styles.dailyStatus}>
        {daysStatus.map((status, idx) => (
          <View key={idx} style={styles.statusDotWrapper}>
            <View style={[styles.statusDot, status.hasData && { backgroundColor: "#EF4444" }]} />
            <Text style={styles.statusDay}>{status.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#1E1B2E", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  gridMetrics: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  metricBox: { flex: 1, alignItems: "center" },
  metricValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  metricLabel: { color: "#9CA3AF", fontSize: 12 },
  dailyStatus: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  statusDotWrapper: { alignItems: "center", gap: 4 },
  statusDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#374151" },
  statusDay: { color: "#9CA3AF", fontSize: 12 },
});
