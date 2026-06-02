import React from "react";
import { useAppColors } from "@/hooks/useAppColors";
import { View, StyleSheet } from "react-native";
import { BarChart } from "@/components/charts/BarChart";

interface ActivityChartCardProps {
  data: { label: string; value: number }[];
  averageValue?: number;
}

export const ActivityChartCard = ({ data, averageValue = 200 }: ActivityChartCardProps) => {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        <BarChart 
          data={data} 
          averageValue={averageValue}
          barColor={colors.danger} 
          showYAxis={true} 
        />
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  card: { backgroundColor: colors.bgElevated, borderRadius: 16, padding: 16, marginBottom: 16 },
  chartContainer: { alignItems: "center", marginVertical: 8 },
});
