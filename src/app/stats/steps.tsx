import React, { useState, useEffect } from "react";
import { useAppColors } from "@/hooks/useAppColors";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  Platform,
  LayoutAnimation,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useStepsStats } from "@/hooks/stats/useStepsStats";
import { BarChart } from "@/components/charts/BarChart";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { useStepsStore } from "@/store/statsStore";
import { pedometerService } from "@/services/pedometerService";
import { StepsPeriod } from "@/constants/stats";
import { getStepsTimeline } from "@/services/stepLogService";
import { StepLogEntry } from "@/types/contracts";
import { formatLocalDate } from "@/utils/date";
import { useTranslation } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";

const { width: screenWidth } = Dimensions.get("window");

// Helper to get calendar aligned dates locally for date navigations
const getPeriodRange = (period: StepsPeriod, offset: number) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (period === StepsPeriod.WEEK) {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    monday.setDate(monday.getDate() + offset * 7);
    startDate = new Date(monday);
    endDate = new Date(monday);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === StepsPeriod.MONTH) {
    const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1, 0, 0, 0, 0);
    startDate = firstDay;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
    endDate = lastDay;
  } else if (period === StepsPeriod.SIX_MONTHS) {
    const endMonth = now.getMonth() + offset * 6;
    const startMonth = endMonth - 5;
    startDate = new Date(now.getFullYear(), startMonth, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), endMonth + 1, 0, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

export default function StepsStatsScreen() {
  const t = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    activeTabLabel,
    tabs,
    handleTabChange,
    isConnected,
    isLoading,
    error,
    connectAndSync,
    todaySteps,
  } = useStepsStats();

  const period = useStepsStore((state) => state.period);
  const offset = useStepsStore((state) => state.offset);
  const setOffset = useStepsStore((state) => state.setOffset);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const setStepGoal = useStepsStore((state) => state.setStepGoal);
  const averageSteps = useStepsStore((state) => state.averageSteps);
  const previousAverageSteps = useStepsStore((state) => state.previousAverageSteps);
  const historyData = useStepsStore((state) => state.historyData);
  const historicalGoals = useStepsStore((state) => state.historicalGoals) || {};

  // States cho Modal điều chỉnh mục tiêu
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState(stepGoal.toString());

  // States cho Modal nhật ký lịch sử
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyList, setHistoryList] = useState<{ dateISO: string; steps: number }[]>([]);
  const [loadingHistoryList, setLoadingHistoryList] = useState(false);

  // Cập nhật giá trị input khi goal thay đổi
  useEffect(() => {
    setGoalInput(stepGoal.toString());
  }, [stepGoal]);

  // Tự động mở modal nếu được điều hướng từ trang tùy chỉnh mục tiêu
  useEffect(() => {
    if (params.openGoal === 'true') {
      setGoalModalVisible(true);
    }
  }, [params.openGoal]);

  // Smoothly animate transitions when switching tabs, paging dates, or updates loading
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [period, offset, isLoading]);

  // Load lịch sử 30 ngày cho Modal nhật ký
  const loadHistoryList = async () => {
    setLoadingHistoryList(true);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 29);
      const rawData = await pedometerService.fetchStepsHistory(thirtyDaysAgo, today);
      
      const records = useStepsStore.getState().stepRecords || {};
      
      let backendData: StepLogEntry[] = [];
      if (process.env.EXPO_PUBLIC_USE_MOCK !== "true") {
        try {
          const fromStr = formatLocalDate(thirtyDaysAgo);
          const toStr = formatLocalDate(today);
          backendData = await getStepsTimeline(fromStr, toStr);
        } catch (err) {
          console.warn("Lỗi tải nhật ký bước chân từ backend trong modal:", err);
        }
      }

      const merged = rawData.map(item => {
        const persisted = records[item.dateISO] || 0;
        const apiDay = backendData.find(h => h.log_date === item.dateISO);
        const apiSteps = apiDay ? apiDay.steps : 0;
        return {
          dateISO: item.dateISO,
          steps: Math.max(item.steps, persisted, apiSteps)
        };
      });

      const sorted = [...merged].sort(
        (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
      );
      setHistoryList(sorted);
    } catch (err) {
      console.warn("Lỗi tải nhật ký bước chân:", err);
    } finally {
      setLoadingHistoryList(false);
    }
  };

  useEffect(() => {
    if (historyModalVisible) {
      loadHistoryList();
    }
  }, [historyModalVisible]);

  // Helper to translate labels from store (CN, T2, Th01 etc.)
  const translatePeriodLabel = (label: string) => {
    if (label.startsWith("Th")) {
      const monthNum = parseInt(label.replace("Th", ""), 10);
      const monthNames = language === "vi"
        ? ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[monthNum - 1] || label;
    }
    const weekdayMap: Record<string, string> = {
      "T2": t.stats.days.mon,
      "T3": t.stats.days.tue,
      "T4": t.stats.days.wed,
      "T5": t.stats.days.thu,
      "T6": t.stats.days.fri,
      "T7": t.stats.days.sat,
      "CN": t.stats.days.sun,
    };
    return weekdayMap[label] || label;
  };

  const translatedHistoryData = React.useMemo(() => {
    return historyData.map(item => ({
      ...item,
      label: translatePeriodLabel(item.label)
    }));
  }, [historyData, language]);

  // Định dạng khoảng thời gian hiển thị đầu trang
  const getFormattedDateRange = () => {
    const { startDate, endDate } = getPeriodRange(period, offset);
    if (period === StepsPeriod.MONTH) {
      const monthNames = language === "vi"
        ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return monthNames[startDate.getMonth()];
    }
    if (period === StepsPeriod.SIX_MONTHS) {
      const formatMonthYear = (date: Date) => {
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${m}/${y}`;
      };
      return `${formatMonthYear(startDate)} - ${formatMonthYear(endDate)}`;
    }
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}`;
    };
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getPeriodLabel = (tab: string) => {
    if (tab === "Tuần" || tab === "Week") return t.stats.periods.thisWeek;
    if (tab === "Tháng" || tab === "Month") return t.stats.periods.thisMonth;
    return t.stats.periods.sixMonthsThis;
  };

  const getPreviousPeriodLabel = (tab: string) => {
    if (tab === "Tuần" || tab === "Week") return t.stats.periods.lastWeek;
    if (tab === "Tháng" || tab === "Month") return t.stats.periods.lastMonth;
    return t.stats.periods.sixMonthsLast;
  };

  // Xử lý lưu mục tiêu mới
  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStepGoal(newGoal);
      setGoalModalVisible(false);
    }
  };

  // Trạng thái chưa kết nối cảm biến
  if (!isConnected) {
    return (
      <ScreenBackground withGlow={false}>
        <View style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.stats.stepsTitleShort}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.connectContainer}>
            <View style={styles.iconCircleLarge}>
              <Ionicons name="footsteps-outline" size={48} color={colors.success} />
            </View>
            <Text style={styles.connectTitle}>{t.stats.connectTitle}</Text>
            <Text style={styles.connectDesc}>
              {t.stats.connectDesc}
            </Text>
            
            <TouchableOpacity 
              style={styles.connectButton}
              activeOpacity={0.8}
              onPress={connectAndSync}
            >
              <Text style={styles.connectButtonText}>{t.stats.connectButtonText}</Text>
            </TouchableOpacity>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        </View>
      </ScreenBackground>
    );
  }

  // Lời khuyên động dưới bảng thống kê tuần
  const getBannerText = () => {
    if (averageSteps >= stepGoal) {
      return t.stats.workoutNoticeBanner.perfect;
    }
    return t.stats.workoutNoticeBanner.steady;
  };

  // Render Calendar Grid for Month view
  const renderMonthCalendarGrid = () => {
    const { startDate } = getPeriodRange(period, offset);
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // First day of month (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Map so Monday is 0, Sunday is 6
    const firstDayIndex = (firstDayOfWeek + 6) % 7;
    
    // Total slots to display (previous month padding + current month days)
    const totalSlots = firstDayIndex + daysInMonth;
    const numRows = Math.ceil(totalSlots / 7);
    
    const gridRows = [];
    for (let row = 0; row < numRows; row++) {
      const rowDays = [];
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        const dayNum = cellIndex - firstDayIndex + 1;
        if (dayNum > 0 && dayNum <= daysInMonth) {
          rowDays.push(dayNum);
        } else {
          rowDays.push(null); // padding
        }
      }
      gridRows.push(rowDays);
    }

    const metDaysCount = historyData.filter((item) => item.value >= item.goal).length;
    const totalDaysInMonth = historyData.length || daysInMonth;

    return (
      <View style={styles.monthCalendarContainer}>
        {/* Weekday headers */}
        <View style={styles.calendarHeaderRow}>
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, idx) => (
            <View key={idx} style={styles.calendarHeaderCol}>
              <Text style={styles.calendarHeaderLabel}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Weeks rows */}
        {gridRows.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.calendarWeekRow}>
            {week.map((dayNum, dayIdx) => {
              if (dayNum === null) {
                return (
                  <View key={dayIdx} style={styles.calendarDayCol}>
                    <View style={[styles.calendarDayBox, styles.calendarDayBoxEmpty]} />
                  </View>
                );
              }
              
              // Get step value for this day (historyData is 0-indexed corresponding to day 1 to end of month)
              const dayData = historyData[dayNum - 1];
              const steps = dayData ? dayData.value : 0;
              const dayGoal = dayData ? dayData.goal : stepGoal;
              const isMet = steps >= dayGoal;
              
              return (
                <View key={dayIdx} style={styles.calendarDayCol}>
                  <View 
                    style={[
                      styles.calendarDayBox, 
                      isMet ? styles.calendarDayBoxMet : styles.calendarDayBoxNotMet
                    ]}
                  />
                </View>
              );
            })}
          </View>
        ))}

        {/* Goal Met Success Rate Pill */}
        <View style={styles.goalSuccessPill}>
          <Ionicons name="checkbox" size={16} color={colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.goalSuccessText}>
            TB số ngày đạt mục tiêu: {metDaysCount}/{totalDaysInMonth} ngày
          </Text>
        </View>
      </View>
    );
  };

  const isSixMonths = period === StepsPeriod.SIX_MONTHS;
  const maxMonthSteps = isSixMonths && historyData.length > 0
    ? Math.max(...historyData.map((h) => h.value))
    : 0;

  const parsedGoalInput = parseInt(goalInput, 10);
  const isGoalValid = !isNaN(parsedGoalInput) && parsedGoalInput > 0;
  const isSaveActive = isGoalValid && parsedGoalInput !== stepGoal;

  // Lấy tháng năng động nhất
  const getMostActiveMonthLabel = () => {
    if (!isSixMonths || historyData.length === 0) return "";
    const mostActive = historyData.reduce((max, item) => item.value > max.value ? item : max, historyData[0]);
    if (mostActive.value === 0) return "";
    const monthNum = parseInt(mostActive.label.replace("Th", ""), 10);
    const monthNames = language === "vi"
      ? ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[monthNum - 1] || "";
  };

  return (
    <ScreenBackground withGlow={true}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.stats.stepsTitleShort}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Today's Step Card */}
        <View style={styles.todayCard}>
          <View style={styles.todayCardLeft}>
            <Text style={styles.todayCardLabel}>{t.stats.today}</Text>
            <Text style={styles.todayStepsValue}>
              {todaySteps.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
              <Text style={styles.todayStepsUnit}> {t.stats.stepsUnit}</Text>
            </Text>
            
            {/* Progress Bar towards goal */}
            <View style={styles.todayProgressBg}>
              <View style={[styles.todayProgressFill, { width: `${Math.min(100, (todaySteps / stepGoal) * 100)}%` }]} />
            </View>
            <Text style={styles.todayGoalText}>
              {t.stats.goal}: {stepGoal.toLocaleString(language === "vi" ? "vi-VN" : "en-US")} {t.stats.stepsUnit} ({Math.round(Math.min(100, (todaySteps / stepGoal) * 100))}%)
            </Text>
          </View>

          {/* Icon Circle or Circular progress indicator */}
          <View style={styles.todayCardRight}>
            <View style={[styles.glowCircle, { borderColor: todaySteps >= stepGoal ? colors.success : colors.primary }]}>
              <Ionicons 
                name={todaySteps >= stepGoal ? "trophy" : "footsteps"} 
                size={32} 
                color={todaySteps >= stepGoal ? colors.success : colors.primary} 
              />
            </View>
          </View>
        </View>

        {/* Small Stats Grid for Today (Distance, Calories, Time) */}
        <View style={styles.todayStatsGrid}>
          <View style={styles.todayStatItem}>
            <MaterialCommunityIcons name="fire" size={20} color={colors.danger} />
            <Text style={styles.todayStatVal}>{Math.round(todaySteps * 0.04)} kcal</Text>
            <Text style={styles.todayStatLbl}>{t.stats.caloriesBurned}</Text>
          </View>
          
          <View style={styles.todayStatItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color={colors.info} />
            <Text style={styles.todayStatVal}>{(todaySteps * 0.00075).toFixed(2)} km</Text>
            <Text style={styles.todayStatLbl}>{t.stats.distance}</Text>
          </View>

          <View style={styles.todayStatItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#10B981" />
            <Text style={styles.todayStatVal}>{Math.round(todaySteps / 120)} {language === "vi" ? "phút" : "mins"}</Text>
            <Text style={styles.todayStatLbl}>{t.stats.walkingTime}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTabLabel === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleTabChange(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Date Navigator */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => setOffset(offset - 1)} style={styles.navArrow}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.dateRangeText}>{getFormattedDateRange()}</Text>
          <TouchableOpacity 
            onPress={() => setOffset(offset + 1)} 
            disabled={offset >= 0}
            style={[styles.navArrow, offset >= 0 && { opacity: 0.3 }]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Chart Area */}
        {isLoading && historyData.length === 0 ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color={colors.success} />
          </View>
        ) : historyData.length === 0 ? (
          <View style={styles.chartEmptyContainer}>
            <Ionicons name="footsteps-outline" size={40} color={colors.borderSoft} />
            <Text style={styles.emptyText}>{t.stats.noDataSteps}</Text>
          </View>
        ) : (
          <View style={styles.chartSection}>
            <BarChart 
              data={translatedHistoryData} 
              averageValue={averageSteps}
              barColor={colors.success} 
              showYAxis={true} 
              showAveragePill={true}
              width={screenWidth - 32}
              height={190}
            />
            {/* Chart Legends */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <Text style={styles.legendDashedLine}>- - -</Text>
                <Text style={styles.legendLabel}>{t.stats.averageSteps}</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendBarIndicator} />
                <Text style={styles.legendLabel}>{t.stats.loggedData}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Thống kê bước chân Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="footsteps" size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.headerTextContainer}>
              <View style={styles.titleWithInfo}>
                <Text style={styles.cardTitle}>{t.stats.stepsTitle}</Text>
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.subHeader}>
                {t.stats.goal}: {stepGoal.toLocaleString(language === "vi" ? "vi-VN" : "en-US")} {t.stats.stepsPerDay}
              </Text>
            </View>
          </View>

          {/* Grid Metrics */}
          <View style={styles.gridMetrics}>
            <View style={styles.metricBox}>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {averageSteps.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                </Text>
                <Text style={styles.metricUnitInline}>{t.stats.stepsPerDay}</Text>
              </View>
              <Text style={styles.metricLabel}>
                {isSixMonths ? t.stats.sixMonthAverage : t.stats.averagePeriod(getPeriodLabel(activeTabLabel))}
              </Text>
            </View>
            
            <View style={styles.metricBox}>
              <View style={styles.metricValueContainer}>
                <Text style={styles.metricValue}>
                  {isSixMonths 
                    ? maxMonthSteps.toLocaleString(language === "vi" ? "vi-VN" : "en-US") 
                    : previousAverageSteps.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}
                </Text>
                <Text style={styles.metricUnitInline}>{t.stats.stepsPerDay}</Text>
              </View>
              <Text style={styles.metricLabel}>
                {isSixMonths ? t.stats.mostActiveMonth : t.stats.averagePeriod(getPreviousPeriodLabel(activeTabLabel))}
              </Text>
            </View>
          </View>

          {/* Week progress row - Only for WEEK period */}
          {period === StepsPeriod.WEEK && historyData.length > 0 && (
            <View style={styles.weekProgressSection}>
              <View style={styles.circlesRow}>
                {historyData.map((item, index) => {
                  const isMet = item.value >= item.goal;
                  return (
                    <View key={index} style={styles.circleCol}>
                      <Text style={styles.circleDayLabel}>{translatePeriodLabel(item.label)}</Text>
                      <View style={[styles.circle, isMet ? styles.circleMet : styles.circleNotMet]} />
                      <Text style={styles.circleStepsVal}>{item.value.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Progress Legend */}
              <View style={styles.progressLegendRow}>
                <View style={styles.legendDotItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.borderSoft }]} />
                  <Text style={styles.legendDotLabel}>{t.stats.notMet}</Text>
                </View>
                <View style={styles.legendDotItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendDotLabel}>{t.stats.goalMet}</Text>
                </View>
              </View>

              {/* Banner */}
              <View style={styles.noticeBanner}>
                <Ionicons name="extension-puzzle-outline" size={18} color={colors.success} style={styles.bannerIcon} />
                <Text style={styles.bannerText}>
                  {getBannerText()}
                </Text>
              </View>
            </View>
          )}

          {/* Month progress calendar - Only for MONTH period */}
          {period === StepsPeriod.MONTH && historyData.length > 0 && renderMonthCalendarGrid()}
        </View>

        {/* Motivational Banner - For MONTH and SIX_MONTHS period */}
        {period === StepsPeriod.MONTH && (
          <View style={styles.motivationalBanner}>
            <Text style={styles.motivationalText}>
              {t.stats.motivationalBanner.habit}
            </Text>
          </View>
        )}

        {period === StepsPeriod.SIX_MONTHS && historyData.length > 0 && (
          <View style={styles.motivationalBanner}>
            <Text style={styles.motivationalText}>
              👉 {getMostActiveMonthLabel() || (language === "vi" ? "Tháng gần đây" : "Recent month")} {language === "vi" ? "là tháng bạn hoạt động tích cực nhất. Thử lấy lại cảm hứng từ tháng đó xem sao!" : "was your most active. Try getting inspired by that progress!"}
            </Text>
          </View>
        )}

        {/* Bước chân & mức độ hoạt động Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{t.stats.stepsActivityLevel}</Text>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </View>
          
          <ActivityLevelRow label={t.stats.activityLevels.sedentary} range="< 3,000" color={colors.danger} iconName="chair" />
          <ActivityLevelRow label={t.stats.activityLevels.light} range="3.000 - 6.499" color={colors.primary === "#A56CFF" ? "#F59E0B" : "#D97706"} iconName="walking" />
          <ActivityLevelRow label={t.stats.activityLevels.moderate} range="6,500 - 9,999" color={colors.info} iconName="walking" />
          <ActivityLevelRow label={t.stats.activityLevels.active} range="10,000 - 12,499" color={colors.success} iconName="running" />
          <ActivityLevelRow label={t.stats.activityLevels.veryActive} range="> 12,500" color={colors.primary} iconName="run-fast" iconFamily="MaterialCommunityIcons" />

          <Text style={styles.activityDisclaimer}>
            {t.stats.activityDisclaimer}
          </Text>
        </View>

        {/* Bottom actions list */}
        <View style={styles.actionCard}>
          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => setGoalModalVisible(true)}
          >
            <Text style={styles.actionLabel}>{t.stats.adjustGoal}</Text>
            <View style={styles.actionRight}>
              <Text style={styles.actionValue}>{stepGoal.toLocaleString(language === "vi" ? "vi-VN" : "en-US")} {t.stats.stepsUnit}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.actionSeparator} />

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => setHistoryModalVisible(true)}
          >
            <Text style={styles.actionLabel}>{t.stats.stepsLog}</Text>
            <View style={styles.actionRight}>
              <Text style={styles.actionValue}>{t.stats.viewHistory}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL: ĐIỀU CHỈNH MỤC TIÊU */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <ScreenBackground withGlow={true}>
          <View style={styles.fullScreenModalHeader}>
            <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={styles.headerBackBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>{t.stats.adjustGoal}</Text>
            <TouchableOpacity 
              onPress={handleSaveGoal} 
              disabled={!isSaveActive}
              style={styles.headerSaveBtn}
            >
              <Text style={[
                styles.headerSaveText,
                isSaveActive ? styles.headerSaveTextActive : styles.headerSaveTextInactive
              ]}>
                {t.stats.save}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fullScreenModalBody}>
            {/* Input Row */}
            <View style={styles.inputRow}>
              <Text style={styles.inputRowLabel}>{t.stats.stepsGoal}</Text>
              <View style={styles.inputRowRight}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.inputRowField}
                    value={goalInput}
                    onChangeText={setGoalInput}
                    keyboardType="number-pad"
                    placeholder="8000"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Text style={styles.inputRowUnit}>{language === "vi" ? "Bước" : "Steps"}</Text>
              </View>
            </View>

            {/* Info Banner */}
            <View style={styles.suggestionInfoBanner}>
              <Ionicons name="information-circle" size={22} color={colors.success} />
              <Text style={styles.suggestionInfoText}>
                {t.stats.suggestionBannerText}
              </Text>
            </View>

            {/* Suggestions Header */}
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsHeaderText}>{t.stats.suggestionTitle}</Text>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
            </View>

            {/* Suggestions List Card */}
            <View style={styles.suggestionsCard}>
              <View style={styles.suggestionsTableHeader}>
                <Text style={styles.suggestionsTableHeaderText}>{t.stats.level}</Text>
                <Text style={styles.suggestionsTableHeaderText}>{t.stats.suggestedSteps}</Text>
              </View>

              <SuggestionRow
                label={language === "vi" ? "Ít vận động" : "Sedentary"}
                value={3000}
                iconName="chair"
                onPress={(val) => setGoalInput(val.toString())}
              />
              <SuggestionRow
                label={language === "vi" ? "Nhẹ nhàng" : "Light"}
                value={5000}
                iconName="walking"
                onPress={(val) => setGoalInput(val.toString())}
              />
              <SuggestionRow
                label={language === "vi" ? "Trung bình" : "Moderate"}
                value={8000}
                iconName="walking"
                onPress={(val) => setGoalInput(val.toString())}
              />
              <SuggestionRow
                label={language === "vi" ? "Rất năng động" : "Very active"}
                value={10000}
                iconName="running"
                onPress={(val) => setGoalInput(val.toString())}
              />
              <SuggestionRow
                label={language === "vi" ? "Cực kỳ năng động" : "Super active"}
                value={12000}
                iconName="run-fast"
                iconFamily="MaterialCommunityIcons"
                isLast
                onPress={(val) => setGoalInput(val.toString())}
              />
            </View>
          </ScrollView>
        </ScreenBackground>
      </Modal>

      {/* MODAL: NHẬT KÝ BƯỚC CHÂN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.historyModalContent]}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.modalTitle}>{t.stats.stepsLog}</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>{t.stats.historyLast30Days}</Text>

            {loadingHistoryList ? (
              <View style={styles.historyLoading}>
                <ActivityIndicator size="large" color={colors.success} />
              </View>
            ) : (
              <FlatList
                data={historyList}
                keyExtractor={(item) => item.dateISO}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => {
                  const dayGoal = historicalGoals[item.dateISO] || stepGoal;
                  const isMet = item.steps >= dayGoal;
                  const dateObj = new Date(item.dateISO);
                  const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1).toString().padStart(2, "0")}/${dateObj.getFullYear()}`;
                  
                  // Lấy thứ trong tuần
                  const weekdayLabels = language === "vi"
                    ? ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
                    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                  const weekday = weekdayLabels[dateObj.getDay()];

                  return (
                    <View style={styles.historyItemRow}>
                      <View style={styles.historyItemLeft}>
                        <View style={[styles.historyStatusDot, isMet ? styles.historyDotMet : styles.historyDotNotMet]} />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.historyItemDate}>{formattedDate}</Text>
                          <Text style={styles.historyItemDay}>{weekday}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.historyItemRight}>
                        <Text style={styles.historyItemSteps}>{item.steps.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}</Text>
                        <Text style={styles.historyItemUnit}>{t.stats.stepsUnit}</Text>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.emptyHistoryText}>{t.stats.emptyHistoryText}</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}

// Hàng hiển thị mức độ hoạt động
const ActivityLevelRow = ({
  iconName,
  iconFamily = "FontAwesome5",
  label,
  range,
  color,
}: {
  iconName: string;
  iconFamily?: "FontAwesome5" | "MaterialCommunityIcons" | "Ionicons";
  label: string;
  range: string;
  color: string;
}) => {
  const IconComponent = 
    iconFamily === "MaterialCommunityIcons" 
      ? MaterialCommunityIcons 
      : iconFamily === "Ionicons"
      ? Ionicons
      : FontAwesome5;
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const theme = colors.primary === "#A56CFF" ? "dark" : "light";

  // Dynamic colors for level badges to maintain high contrast and look beautiful
  const badgeBg = color + (theme === "light" ? "14" : "26"); // 8% opacity in light mode, 15% in dark mode
  const badgeBorder = color + (theme === "light" ? "30" : "40"); // 18% border opacity in light, 25% in dark
  const textColor = color;

  return (
    <View style={styles.levelRow}>
      {/* Pill Badge */}
      <View style={[styles.levelBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
        <IconComponent name={iconName as any} size={11} color={textColor} style={{ marginRight: 6 }} />
        <Text style={[styles.levelLabelText, { color: textColor }]}>{label}</Text>
      </View>
      {/* Range Text */}
      <Text style={styles.levelRangeText}>{range}</Text>
    </View>
  );
};

// Hàng gợi ý mục tiêu bước chân
const SuggestionRow = ({
  label,
  value,
  iconName,
  iconFamily = "FontAwesome5",
  isLast = false,
  onPress,
}: {
  label: string;
  value: number;
  iconName: string;
  iconFamily?: "FontAwesome5" | "MaterialCommunityIcons";
  isLast?: boolean;
  onPress: (val: number) => void;
}) => {
  const IconComponent = iconFamily === "MaterialCommunityIcons" ? MaterialCommunityIcons : FontAwesome5;
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <TouchableOpacity 
      style={[styles.suggestionRow, isLast && { borderBottomWidth: 0 }]}
      activeOpacity={0.7}
      onPress={() => onPress(value)}
    >
      <View style={styles.suggestionRowLeft}>
        <View style={styles.suggestionIconWrapper}>
          <IconComponent name={iconName as any} size={14} color={colors.textSecondary} />
        </View>
        <Text style={styles.suggestionRowLabel}>{label}</Text>
      </View>
      <Text style={styles.suggestionRowValue}>
        {value.toLocaleString("vi-VN")}{" "}
        <Text style={styles.suggestionRowUnit}>bước/ngày</Text>
      </Text>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, paddingTop: Platform.OS === "ios" ? 60 : 44 },
  backBtn: { padding: 8 },
  headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "bold" },
  
  // Custom tabs selector
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabItemActive: {
    backgroundColor: colors.borderSoft,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },

  // Date Navigator
  dateNavigator: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginHorizontal: 16,
    marginBottom: 20,
  },
  navArrow: {
    padding: 8,
  },
  dateRangeText: { color: colors.textPrimary, fontSize: 16, fontWeight: "600" },

  // Chart Section
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  chartLoadingContainer: {
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  chartEmptyContainer: {
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  emptyText: { color: colors.textSecondary, marginTop: 12 },

  // Legends dưới chart
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDashedLine: {
    color: colors.textMuted,
    fontWeight: "bold",
    marginRight: 6,
  },
  legendBarIndicator: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },
  legendLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Card general
  card: { 
    backgroundColor: colors.bgElevated, 
    borderRadius: 20, 
    padding: 16, 
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  headerTextContainer: { marginLeft: 12 },
  titleWithInfo: { flexDirection: "row", alignItems: "center" },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "bold" },
  subHeader: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  
  // Grid metrics
  gridMetrics: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  metricBox: { flex: 1, alignItems: "flex-start" },
  metricValue: { color: colors.textPrimary, fontSize: 20, fontWeight: "bold", marginBottom: 2 },
  metricUnit: { fontSize: 11, fontWeight: "normal", color: colors.textSecondary },
  metricLabel: { color: colors.textSecondary, fontSize: 12 },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    marginHorizontal: 12,
  },

  // Week progress circles
  weekProgressSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    paddingTop: 16,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleCol: {
    alignItems: "center",
  },
  circleDayLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 6,
  },
  circleMet: {
    backgroundColor: colors.success,
  },
  circleNotMet: {
    backgroundColor: colors.borderSoft,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  circleStepsVal: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  // Progress Legend
  progressLegendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  legendDotItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendDotLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  // Notice Banner
  noticeBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
    alignItems: "center",
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerText: {
    flex: 1,
    color: colors.primary === "#A56CFF" ? "#D1FAE5" : "#065F46",
    fontSize: 12,
    lineHeight: 18,
  },

  // Activity Level Row
  levelRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" 
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelLabelText: { 
    fontSize: 10.5, 
    fontWeight: "bold",
  },
  levelRangeText: { color: colors.textPrimary, fontSize: 13, fontWeight: "500" },
  activityDisclaimer: {
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 16,
  },

  // Action card (bottom menu list)
  actionCard: {
    backgroundColor: colors.bgElevated, 
    borderRadius: 20, 
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  actionRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionValue: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  actionSeparator: {
    height: 1,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    marginHorizontal: 20,
  },

  // Connect sensors UI
  connectContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    minHeight: 450,
  },
  iconCircleLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  connectTitle: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary, marginBottom: 12 },
  connectDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 22, paddingHorizontal: 24, marginBottom: 32 },
  connectButton: { backgroundColor: colors.success, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 24, alignItems: "center", justifyContent: "center", width: "80%" },
  connectButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  errorText: { color: colors.danger, marginTop: 16, textAlign: "center" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    padding: 12,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  modalButtonCancel: {
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Lịch sử Modal specific styles
  historyModalContent: {
    width: "90%",
    height: "70%",
    paddingBottom: 16,
  },
  historyModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  historyLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyHistoryText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  historyItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyDotMet: {
    backgroundColor: colors.success,
  },
  historyDotNotMet: {
    backgroundColor: colors.danger,
  },
  historyItemDate: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  historyItemDay: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  historyItemRight: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  historyItemSteps: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  historyItemUnit: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  // Stats layout updates
  metricValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  metricUnitInline: {
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 4,
  },

  // Calendar styles
  monthCalendarContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  calendarHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calendarHeaderCol: {
    flex: 1,
    alignItems: "center",
  },
  calendarHeaderLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  calendarDayCol: {
    flex: 1,
    alignItems: "center",
  },
  calendarDayBox: {
    width: 24,
    height: 18,
    borderRadius: 4,
  },
  calendarDayBoxMet: {
    backgroundColor: colors.success,
  },
  calendarDayBoxNotMet: {
    backgroundColor: colors.borderSoft,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },
  calendarDayBoxEmpty: {
    backgroundColor: "transparent",
  },

  // Goal success rate pill
  goalSuccessPill: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    marginTop: 16,
  },
  goalSuccessText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "500",
  },

  // Motivational banner
  motivationalBanner: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  motivationalText: {
    color: colors.primary === "#A56CFF" ? "#E0F2FE" : "#1E40AF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },

  // Full-screen Adjust Goal Modal Styles
  fullScreenModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  headerBackBtn: {
    padding: 4,
  },
  fullScreenModalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerSaveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSaveTextActive: {
    color: colors.primary,
  },
  headerSaveTextInactive: {
    color: colors.textMuted,
  },
  fullScreenModalBody: {
    flex: 1,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  },
  inputRowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  inputRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRowField: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 0,
    width: "100%",
  },
  inputRowUnit: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  suggestionInfoBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(22, 101, 52, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  suggestionInfoText: {
    color: colors.primary === "#A56CFF" ? "#4ADE80" : "#166534",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  suggestionsHeaderText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  suggestionsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    marginBottom: 40,
  },
  suggestionsTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    marginBottom: 6,
  },
  suggestionsTableHeaderText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },
  suggestionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionIconWrapper: {
    width: 24,
    alignItems: "center",
  },
  suggestionRowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  suggestionRowValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  suggestionRowUnit: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "normal",
  },
  
  // Today's prominent step card
  todayCard: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todayCardLeft: {
    flex: 1,
    marginRight: 16,
  },
  todayCardLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  todayStepsValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },
  todayStepsUnit: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "normal",
  },
  todayProgressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    width: "100%",
    marginVertical: 10,
    overflow: "hidden",
  },
  todayProgressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  todayGoalText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  todayCardRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },

  // Today small stats grid
  todayStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  todayStatItem: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },
  todayStatVal: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 2,
  },
  todayStatLbl: {
    color: colors.textSecondary,
    fontSize: 10,
  },
});
