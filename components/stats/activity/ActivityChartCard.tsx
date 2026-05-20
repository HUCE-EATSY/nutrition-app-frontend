import React from "react";
import { View, StyleSheet } from "react-native";
import { BarChart } from "@/components/charts/BarChart";

interface ActivityChartCardProps {
  data: { label: string; value: number }[];
  averageValue?: number;
}

export const ActivityChartCard = ({ data, averageValue = 200 }: ActivityChartCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        <BarChart 
          data={data} 
          averageValue={averageValue}
          barColor="#EF4444" 
          showYAxis={true} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#1E1B2E", borderRadius: 16, padding: 16, marginBottom: 16 },
  chartContainer: { alignItems: "center", marginVertical: 8 },
});
