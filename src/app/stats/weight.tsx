import React from "react";
import { useAppColors } from "@/hooks/useAppColors";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWeightStats } from "@/hooks/stats/useWeightStats";
import { FilterTabs } from "@/components/stats/FilterTabs";
import { LineChart } from "@/components/charts/LineChart";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { useWeightStore } from "@/store/statsStore";
import { Image } from "react-native";

export default function WeightStatsScreen() {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const {
    activeTabLabel, tabs, handleTabChange,
    actualChartData, targetChartData, resolvedTarget,
    bmiData,
    initialWeight, currentWeight, weightChange,
    currentBmi, bmiChange, bmiStatus, bmiStatusColor,
    isLoading,
  } = useWeightStats();
  const { weightLogs } = useWeightStore();

  const hasData = actualChartData.length > 0;

  // Lấy những log có ảnh, tối đa 5 ảnh gần nhất
  const imageLogs = React.useMemo(() => {
    return weightLogs
      .filter((log) => log.photo_url || log.photoUrl)
      .slice(0, 5);
  }, [weightLogs]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return dateString;
    }
  };

  return (
    <ScreenBackground withGlow={false}>
      <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê cân nặng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <FilterTabs
          tabs={tabs}
          activeTab={activeTabLabel}
          onChange={handleTabChange}
        />

        {isLoading ? (
          <View style={[styles.card, { paddingVertical: 60, alignItems: "center" }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !hasData ? (
          <View style={[styles.card, { paddingVertical: 48, alignItems: "center" }]}>
            <Ionicons name="scale-outline" size={40} color={colors.borderSoft} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Chưa có dữ liệu cân nặng</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
              Hãy ghi nhận cân nặng để xem biểu đồ
            </Text>
          </View>
        ) : (
          <>
            {/* Weight Chart Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Biểu đồ cân nặng</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  actualData={actualChartData}
                  targetData={targetChartData}
                  yUnit="kg"
                />
              </View>
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.textPrimary }]} />
                  <Text style={{ color: colors.textSecondary }}>
                    Mục tiêu {resolvedTarget ? `(${resolvedTarget} kg)` : ""}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={{ color: colors.textSecondary }}>Dữ liệu ghi nhận</Text>
                </View>
              </View>
            </View>

            {/* Summary Row */}
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
                <Text style={[styles.summaryValuePurple, { color: weightChange >= 0 ? colors.danger : colors.success }]}>
                  {weightChange >= 0 ? "+" : ""}{weightChange} kg
                </Text>
              </View>
            </View>

            {/* Progress Image Section */}
            <View style={styles.imageSectionContainer}>
              <View style={styles.imageSectionHeader}>
                <Text style={styles.imageSectionTitle}>Hình ảnh tiến trình</Text>
                <TouchableOpacity onPress={() => router.push("/weight-history")} hitSlop={10}>
                  <Text style={styles.viewAllText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageScrollContent}
              >
                {/* Data Cards */}
                {imageLogs.map((log, index) => {
                  const imageUrl = log.photoUrl || log.photo_url;
                  return (
                    <View key={log.id || index} style={styles.dataItemContainer}>
                      <Image source={{ uri: imageUrl! }} style={styles.imageBox} resizeMode="cover" />
                      <Text style={styles.weightText}>{log.weight_kg} kg</Text>
                      <Text style={styles.dateText}>{formatDate(log.log_date)}</Text>
                    </View>
                  );
                })}

                {/* Add Button Item (Bên phải) */}
                <TouchableOpacity style={styles.addItemContainer} onPress={() => router.push("/log-weight")}>
                  <View style={styles.addIconBox}>
                    <Ionicons name="add" size={32} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* BMI Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Chỉ số BMI</Text>
                <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
              </View>
              <View style={styles.bmiHeader}>
                <View style={styles.bmiStatus}>
                  <Ionicons
                    name={currentBmi < 25 ? "checkmark-circle" : "warning"}
                    size={20}
                    color={bmiStatusColor}
                  />
                  <Text style={[styles.bmiStatusText, { color: bmiStatusColor }]}>
                    {bmiStatus} ({currentBmi})
                  </Text>
                </View>
                <Text style={styles.bmiTrend}>
                  Xu hướng: {bmiChange >= 0 ? "+" : ""}{bmiChange}
                </Text>
              </View>

              {bmiData.length > 0 && (
                <View style={styles.chartContainer}>
                  <LineChart
                    actualData={bmiData}
                    actualColor={colors.success}
                    yUnit="BMI"
                  />
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer nav */}
        <View style={styles.footerNav}>
          <TouchableOpacity style={styles.footerLink} onPress={() => router.push("/weight-history")}>
            <Text style={styles.footerLinkText}>Nhật ký & Lịch sử cân nặng</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
  card: { backgroundColor: colors.bgElevated, borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  chartContainer: { alignItems: "center", marginVertical: 8 },
  legendContainer: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: 12, padding: 12, alignItems: "center" },
  summaryLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: "bold", marginBottom: 8 },
  summaryValuePurple: { color: colors.primary, fontSize: 16, fontWeight: "bold" },
  summaryValueWhite: { color: colors.textPrimary, fontSize: 16, fontWeight: "bold" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  bmiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  bmiStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  bmiStatusText: { fontSize: 16, fontWeight: "bold" },
  bmiTrend: { color: colors.textSecondary, fontSize: 14 },
  footerNav: { backgroundColor: colors.bgElevated, borderRadius: 16, paddingHorizontal: 16, marginBottom: 32 },
  footerLink: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  footerLinkText: { color: colors.textPrimary, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.borderSoft },

  // Styles cho Progress Image Section
  imageSectionContainer: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  imageSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  imageSectionTitle: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
  },
  imageScrollContent: {
    flexDirection: "row",
    gap: 12,
  },
  addItemContainer: {
    // Không cần marginRight nếu ở cuối, nhưng giữ cho an toàn
  },
  addIconBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  dataItemContainer: {
    alignItems: "center",
    marginRight: 12,
    width: 80,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  weightText: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});
