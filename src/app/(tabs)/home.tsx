import { useEffect } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { colors, theme, spacing, typography } from "@/constants";
import { HomeHeader, DateScroller } from "@/components/dashboard/HomeHeader";
import { CalorieOverview } from "@/components/dashboard/CalorieOverview";
import { MacroProgressRow } from "@/components/dashboard/MacroProgressRow";
import { ActivityGrid } from "@/components/dashboard/ActivityGrid";
import { SmallStatRow } from "@/components/dashboard/SmallStatRow";
import { WaterIntakeCard } from "@/components/dashboard/WaterIntakeCard";
import { WeightChartCard } from "@/components/dashboard/WeightChartCard";
import { useDiaryStore } from "@/store/diaryStore";
import { useStepsStore } from "@/store/statsStore";
import { getTodayDateISO } from "@/utils/date";

export default function HomeScreen() {
  const { summary, rawLogs, exercises, fetchDiary, selectedDate } = useDiaryStore();
  const { todaySteps, isConnected, stepRecords } = useStepsStore();

  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate, fetchDiary]);

  const goal = Math.round(summary?.targetCalories ?? 2000);
  const consumed = Math.round(summary?.consumedCalories ?? 0);
  
  // Calculate exercise calories and step calories for the selected date
  const exerciseBurned = Math.round(exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0));
  const todayStr = getTodayDateISO();
  const stepsForSelectedDate = selectedDate === todayStr ? todaySteps : ((stepRecords || {})[selectedDate] || 0);
  const stepBurned = isConnected ? Math.round(stepsForSelectedDate * 0.04) : 0;

  const burned = exerciseBurned + stepBurned;
  const remaining = Math.round(Math.max(goal - consumed + burned, 0));
  const percentage = Math.round(Math.min((consumed / goal) * 100, 100));

  // Phân phối logs vào các khung giờ để hiển thị
  const mealHourMap: Record<number, number> = {
    1: 7,   // Sáng -> 07:00
    2: 12,  // Trưa -> 12:00
    3: 18,  // Tối -> 18:00
    4: 15,  // Phụ -> 15:00
  };

  const slotMap: Record<number, any[]> = {};
  for (const log of rawLogs) {
    const hour = mealHourMap[log.mealTypeId] ?? 12;
    if (!slotMap[hour]) slotMap[hour] = [];
    slotMap[hour].push({
      id: String(log.id),
      title: log.foodName,
      calories: log.caloriesKcal,
      proteinGram: log.proteinG ?? 0,
      carbGram: log.carbsG ?? 0,
      fatGram: log.fatG ?? 0,
      imageUrl: log.imageUrl,
      quantityG: log.quantityG,
    });
  }

  const activeHours = Object.keys(slotMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <HomeHeader />
        <DateScroller />

        <CalorieOverview 
          remaining={remaining} 
          goal={goal} 
          consumed={consumed} 
          burned={burned} 
          percentage={percentage} 
        />

        <SurfaceCard style={styles.macroCard}>
          <MacroProgressRow 
            protein={summary?.consumedProteinGram ?? 0}
            targetProtein={summary?.targetProteinGram ?? 120}
            carbs={summary?.consumedCarbGram ?? 0}
            targetCarbs={summary?.targetCarbGram ?? 250}
            fat={summary?.consumedFatGram ?? 0}
            targetFat={summary?.targetFatGram ?? 67}
          />
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </SurfaceCard>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.home.recentLog}</Text>
          {rawLogs.length === 0 ? (
            <View style={styles.emptyRecent}>
              <MaterialCommunityIcons name="basket-plus-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t.home.noData}</Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {activeHours.map((hour) => {
                const timeString = `${hour.toString().padStart(2, "0")}:00`;
                const isCurrentHour = hour === new Date().getHours();
                const entries = slotMap[hour];
                const slotTotals = {
                  calories: entries.reduce((sum, e) => sum + e.calories, 0),
                  protein: Math.round(entries.reduce((sum, e) => sum + e.proteinGram, 0) * 10) / 10,
                  carbs: Math.round(entries.reduce((sum, e) => sum + e.carbGram, 0) * 10) / 10,
                  fat: Math.round(entries.reduce((sum, e) => sum + e.fatGram, 0) * 10) / 10,
                };

                return (
                  <View key={hour} style={styles.hourGroup}>
                    {/* Header row of the hour */}
                    <View style={styles.hourHeaderRow}>
                      <Text style={[styles.hourText, isCurrentHour && styles.hourTextActive]}>
                        {timeString}
                      </Text>
                      
                      <View style={styles.hourMacrosRow}>
                        <Ionicons color={theme.colors.primary} name="flame" size={11} />
                        <Text style={styles.hourMacroText}>{Math.round(slotTotals.calories)} cal</Text>
                        
                        <Ionicons color={theme.colors.protein} name="flash" size={11} />
                        <Text style={styles.hourMacroText}>{slotTotals.protein}g</Text>
                        
                        <Ionicons color={theme.colors.carbs} name="leaf" size={11} />
                        <Text style={styles.hourMacroText}>{slotTotals.carbs}g</Text>
                        
                        <Ionicons color={theme.colors.fat} name="water" size={11} />
                        <Text style={styles.hourMacroText}>{slotTotals.fat}g</Text>
                      </View>
                      
                      <View style={styles.hourLineDivider} />
                    </View>

                    {/* Detailed Cards for Entries */}
                    <View style={styles.hourContentList}>
                      {entries.map((entry) => {
                        const servings = Math.round(((entry.quantityG ?? 100) / 100) * 100) / 100;
                        return (
                          <View key={entry.id} style={styles.foodCard}>
                            {entry.imageUrl ? (
                              <Image source={{ uri: entry.imageUrl }} style={styles.foodCardImg} />
                            ) : (
                              <View style={styles.foodCardImgPlaceholder}>
                                <Ionicons color={theme.colors.textMuted} name="restaurant-outline" size={22} />
                              </View>
                            )}
                            
                            <View style={styles.foodCardInfo}>
                              <Text style={styles.foodCardName} numberOfLines={1}>
                                {entry.title}
                              </Text>
                              <Text style={styles.foodCardSub}>
                                {servings} Khẩu phần • {entry.quantityG ?? 100}g • {Math.round(entry.calories)} cal
                              </Text>
                              <View style={styles.foodCardMacros}>
                                <Ionicons color={theme.colors.protein} name="flash" size={11} />
                                <Text style={[styles.foodCardMacroVal, { color: theme.colors.protein }]}>
                                  {entry.proteinGram}g
                                </Text>
                                
                                <Ionicons color={theme.colors.carbs} name="leaf" size={11} />
                                <Text style={[styles.foodCardMacroVal, { color: theme.colors.carbs }]}>
                                  {entry.carbGram}g
                                </Text>
                                
                                <Ionicons color={theme.colors.fat} name="water" size={11} />
                                <Text style={[styles.foodCardMacroVal, { color: theme.colors.fat }]}>
                                  {entry.fatGram}g
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <ActivityGrid />
        
        <SmallStatRow />

        <WaterIntakeCard />

        <WeightChartCard />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  macroCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emptyRecent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timelineContainer: {
    gap: spacing.md,
  },
  hourGroup: {
    marginBottom: spacing.xs,
  },
  hourHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
    gap: spacing.sm,
  },
  hourText: {
    ...typography.bodyStrong,
    color: colors.textMuted,
    fontSize: 13,
    width: 44,
  },
  hourTextActive: {
    color: colors.primary,
  },
  hourMacrosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hourMacroText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginRight: 4,
  },
  hourLineDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  hourContentList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  foodCardImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  foodCardImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  foodCardInfo: {
    flex: 1,
    gap: 2,
  },
  foodCardName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 14,
  },
  foodCardSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  foodCardMacros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  foodCardMacroVal: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
});
