import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { adminDashboard, DashboardStats, UserGrowthPoint } from '../../services/adminApiMock';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle, Text as SvgText } from 'react-native-svg';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/utils/useToast';

const COLORS = {
  primary: '#10B981',       // Emerald 500
  primaryLight: '#D1FAE5',  // Emerald 100
  bg: '#F8FAFC',           // Slate 50
  white: '#FFFFFF',
  text: '#1E293B',         // Slate 800
  textMuted: '#64748B',    // Slate 500
  border: '#E2E8F0',       // Slate 200
  activeBg: '#ECFDF5',     // Emerald 50
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
};

export default function AdminDashboard() {
  const { toast, showToast, hideToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(600);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, growthRes] = await Promise.all([
        adminDashboard.getStats(),
        adminDashboard.getUserGrowth(),
      ]);
      setStats(statsRes);
      setGrowthData(growthRes);
    } catch (error: any) {
      showToast(error.message || 'Không thể tải dữ liệu dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (n: number) => {
    return n.toLocaleString('vi-VN') + ' đ';
  };

  const calculateRevenueGrowth = () => {
    if (!stats) return 0;
    const { revenueThisMonth, revenueLastMonth } = stats;
    if (revenueLastMonth === 0) return revenueThisMonth > 0 ? 100 : 0;
    return Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);
  };

  if (loading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu dashboard...</Text>
      </View>
    );
  }

  // Chart computations
  const counts = growthData.map((d) => d.count);
  const minY = Math.min(...counts, 0);
  const maxY = Math.max(...counts, 10) * 1.1; // Add 10% padding on top
  const H = 240; // SVG height
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingLeft = 45;
  const paddingRight = 20;
  const chartHeight = H - paddingTop - paddingBottom;
  const chartInnerWidth = chartWidth - paddingLeft - paddingRight;

  const points = growthData.map((d, index) => {
    const x = paddingLeft + (index / (growthData.length - 1 || 1)) * chartInnerWidth;
    const y = H - paddingBottom - ((d.count - minY) / (maxY - minY || 1)) * chartHeight;
    return { x, y, date: d.date, count: d.count };
  });

  // SVG Line path
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  // SVG Gradient Area path
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${H - paddingBottom} L ${points[0].x} ${H - paddingBottom} Z`
    : '';

  const revGrowth = calculateRevenueGrowth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chào mừng trở lại 👋</Text>
          <Text style={styles.subtitle}>Dưới đây là thông số hoạt động của hệ thống DNT Nutrition hôm nay</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Grid Stats */}
      <View style={styles.statsGrid}>
        {/* Total Users */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.infoLight }]}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <Text style={styles.statCardTitle}>Tổng người dùng</Text>
          </View>
          <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statSub}>Tài khoản đã đăng ký</Text>
        </View>

        {/* New 7 Days */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.statIcon}>📈</Text>
            </View>
            <Text style={styles.statCardTitle}>Mới (7 ngày)</Text>
          </View>
          <Text style={styles.statValue}>+{stats.newUsers7Days}</Text>
          <Text style={styles.statSub}>Người dùng mới đăng ký</Text>
        </View>

        {/* New 30 Days */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.warningLight }]}>
              <Text style={styles.statIcon}>🗓️</Text>
            </View>
            <Text style={styles.statCardTitle}>Mới (30 ngày)</Text>
          </View>
          <Text style={styles.statValue}>+{stats.newUsers30Days}</Text>
          <Text style={styles.statSub}>Người dùng mới đăng ký</Text>
        </View>

        {/* Active VIP */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
              <Text style={styles.statIcon}>💎</Text>
            </View>
            <Text style={styles.statCardTitle}>Gói VIP đang chạy</Text>
          </View>
          <Text style={styles.statValue}>{stats.activeVipUsers}</Text>
          <Text style={styles.statSub}>Người dùng Premium</Text>
        </View>

        {/* Revenue This Month */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={styles.statIcon}>💰</Text>
            </View>
            <Text style={styles.statCardTitle}>Doanh thu tháng này</Text>
          </View>
          <Text style={styles.statValue}>{formatVND(stats.revenueThisMonth)}</Text>
          <View style={styles.revenueComparison}>
            <Text style={[styles.growthBadge, revGrowth >= 0 ? styles.growthUp : styles.growthDown]}>
              {revGrowth >= 0 ? '▲' : '▼'} {Math.abs(revGrowth)}%
            </Text>
            <Text style={styles.revenueComparisonText}>so với tháng trước</Text>
          </View>
        </View>
      </View>

      {/* Chart Section */}
      <View
        style={styles.chartCard}
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        <Text style={styles.chartTitle}>Tăng trưởng người dùng (30 ngày qua)</Text>
        <Text style={styles.chartSubtitle}>Biểu đồ lũy kế số lượng người dùng hệ thống</Text>

        <View style={styles.chartWrapper}>
          {chartWidth > 100 && (
            <Svg height={H} width={chartWidth}>
              <Defs>
                <LinearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.25" />
                  <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingBottom + ratio * chartHeight;
                const valueVal = Math.round(maxY - ratio * (maxY - minY));
                return (
                  <React.Fragment key={index}>
                    <Line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke={COLORS.border}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <SvgText
                      x={paddingLeft - 10}
                      y={y + 4}
                      fill={COLORS.textMuted}
                      fontSize="10"
                      textAnchor="end"
                    >
                      {valueVal}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Gradient Area */}
              {areaPath !== '' && <Path d={areaPath} fill="url(#gradientArea)" />}

              {/* Chart Line */}
              {linePath !== '' && (
                <Path d={linePath} fill="none" stroke={COLORS.primary} strokeWidth="3" />
              )}

              {/* First, middle, and last date tags */}
              {points.length > 1 && (
                <>
                  {/* First point label */}
                  <SvgText
                    x={points[0].x}
                    y={H - 12}
                    fill={COLORS.textMuted}
                    fontSize="10"
                    textAnchor="start"
                  >
                    {points[0].date.split('-').slice(1).join('/')}
                  </SvgText>
                  {/* Middle point label */}
                  <SvgText
                    x={points[Math.floor(points.length / 2)].x}
                    y={H - 12}
                    fill={COLORS.textMuted}
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {points[Math.floor(points.length / 2)].date.split('-').slice(1).join('/')}
                  </SvgText>
                  {/* Last point label */}
                  <SvgText
                    x={points[points.length - 1].x}
                    y={H - 12}
                    fill={COLORS.textMuted}
                    fontSize="10"
                    textAnchor="end"
                  >
                    {points[points.length - 1].date.split('-').slice(1).join('/')}
                  </SvgText>
                </>
              )}

              {/* Circles on key points (First, Mid, Last for cleanliness) */}
              {points.length > 0 &&
                [0, Math.floor(points.length / 2), points.length - 1].map((ptIdx) => {
                  const pt = points[ptIdx];
                  if (!pt) return null;
                  return (
                    <React.Fragment key={ptIdx}>
                      <Circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill={COLORS.primary}
                        stroke={COLORS.white}
                        strokeWidth="2"
                      />
                      {/* Tooltip on chart */}
                      <SvgText
                        x={pt.x}
                        y={pt.y - 10}
                        fill={COLORS.text}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pt.count}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
            </Svg>
          )}
        </View>
      </View>

      {/* Row: Quick Info / Database Status */}
      <View style={styles.dbRow}>
        <View style={styles.dbCard}>
          <Text style={styles.dbCardTitle}>Cơ sở dữ liệu Thực đơn</Text>
          <View style={styles.dbStats}>
            <View style={styles.dbStatItem}>
              <Text style={styles.dbStatVal}>{stats.totalFoods}</Text>
              <Text style={styles.dbStatLabel}>Món ăn hiện tại</Text>
            </View>
            <View style={styles.dbCardIcon}>🍎</View>
          </View>
        </View>

        <View style={styles.dbCard}>
          <Text style={styles.dbCardTitle}>Cơ sở dữ liệu Tập luyện</Text>
          <View style={styles.dbStats}>
            <View style={styles.dbStatItem}>
              <Text style={styles.dbStatVal}>{stats.totalExercises}</Text>
              <Text style={styles.dbStatLabel}>Bài tập hiện tại</Text>
            </View>
            <View style={styles.dbCardIcon}>💪</View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  header: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.activeBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    minWidth: Platform.OS === 'web' ? 240 : '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 18,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  revenueComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  growthBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  growthUp: {
    color: '#059669',
    backgroundColor: '#D1FAE5',
  },
  growthDown: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  revenueComparisonText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  dbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dbCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 300 : '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  dbCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  dbStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dbStatItem: {
    gap: 4,
  },
  dbStatVal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dbStatLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  dbCardIcon: {
    fontSize: 40,
    opacity: 0.8,
  },
});
