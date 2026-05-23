import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Toast } from "@/components/common/Toast";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { FoodSelectorModal } from "@/components/meal/FoodSelectorModal";
import { FoodDetailModal } from "@/components/meal/FoodDetailModal";
import { spacing, theme, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { useDiaryStore } from "@/store/diaryStore";
import { formatShortDate } from "@/utils/date";

const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 → 23:00

type MacroInfo = {
  label: string;
  value: number;
  target: number;
  color: string;
  icon: "flame" | "flash" | "leaf" | "water";
};

export default function DiaryTimelineScreen() {
  const { horizontalPadding } = useResponsiveLayout();
  const currentHour = new Date().getHours();

  const {
    selectedDate,
    goToPrevDay,
    goToNextDay,
    fetchDiary,
    deleteFoodLog,
    updateMealEntry,
    summary,
    exercises = [],
    isLoading,
    addMealEntry,
  } = useDiaryStore();

  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate, fetchDiary]);

  // Modal state
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedHourForMeal, setSelectedHourForMeal] = useState<number>(currentHour);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [grams, setGrams] = useState("100");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const macros: MacroInfo[] = [
    {
      label: "Calo",
      value: Math.round(summary?.consumedCalories ?? 0),
      target: Math.round(summary?.targetCalories ?? 2000),
      icon: "flame",
      color: theme.colors.primary,
    },
    {
      label: "Protein",
      value: Math.round(summary?.consumedProteinGram ?? 0),
      target: Math.round(summary?.targetProteinGram ?? 120),
      icon: "flash",
      color: theme.colors.protein,
    },
    {
      label: "Carbs",
      value: Math.round(summary?.consumedCarbGram ?? 0),
      target: Math.round(summary?.targetCarbGram ?? 150),
      icon: "leaf",
      color: theme.colors.carbs,
    },
    {
      label: "Fat",
      value: Math.round(summary?.consumedFatGram ?? 0),
      target: Math.round(summary?.targetFatGram ?? 55),
      icon: "water",
      color: theme.colors.fat,
    },
  ];

  // Tổng calo đốt từ bài tập trong ngày
  const totalBurned = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);

  // Xử lý khi click nút + để thêm bữa ăn
  function handleAddMeal(hour: number) {
    setSelectedHourForMeal(hour);
    setShowFoodSelector(true);
  }

  // Xử lý khi chọn món ăn từ modal
  function handleSelectFood(food: any) {
    setSelectedFood(food);
    setShowFoodSelector(false);
    setEditingLogId(null);
    setGrams("100"); // Reset gram về 100
  }

  // Xử lý khi chỉnh sửa log cũ
  function handleEditLog(entry: any) {
    setEditingLogId(Number(entry.id));
    setSelectedHourForMeal(entry.hour);
    setGrams(String(entry.quantityG ?? 100));

    const qty = entry.quantityG ?? 100;
    const ratio = qty > 0 ? (100 / qty) : 1;
    setSelectedFood({
      id: entry.foodItemId || "",
      name: entry.title,
      servingSize: 100,
      calories: entry.calories * ratio,
      protein: entry.proteinGram * ratio,
      carbs: entry.carbGram * ratio,
      fat: entry.fatGram * ratio,
      imageUrl: entry.imageUrl,
    });
  }

  function handleCancelMeal() {
    setSelectedFood(null);
    setEditingLogId(null);
    setGrams("100");
  }



  // Lưu bữa ăn
  async function handleSaveMeal(gramNum: number) {
    if (!selectedFood) return;

    if (gramNum <= 0) {
      setToastMessage("Vui lòng nhập số gram hợp lệ");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      if (editingLogId !== null) {
        await updateMealEntry(editingLogId, gramNum);
        setToastMessage(`Đã cập nhật ${selectedFood.name} (${gramNum}g)`);
      } else {
        // Chuyển giờ → mealTypeId: 1=Sáng, 2=Trưa, 3=Tối, 4=Phụ
        const mealTypeId =
          selectedHourForMeal >= 5 && selectedHourForMeal <= 10 ? 1 :
            selectedHourForMeal >= 11 && selectedHourForMeal <= 14 ? 2 :
              selectedHourForMeal >= 18 && selectedHourForMeal <= 22 ? 3 : 4;

        await addMealEntry({
          foodItemId: selectedFood.id,   // UUID string
          mealTypeId,
          dateISO: selectedDate,
          quantityG: gramNum,
        });

        setToastMessage(`Đã lưu ${selectedFood.name} (${gramNum}g)`);
      }

      setToastType("success");
      setShowToast(true);

      // Reset state
      setSelectedFood(null);
      setEditingLogId(null);
      setGrams("100");
    } catch {
      setToastMessage("Không thể lưu bữa ăn. Vui lòng thử lại.");
      setToastType("error");
      setShowToast(true);
    }
  }

  async function handleDeleteLog(logId: number) {
    try {
      await deleteFoodLog(logId);
      setToastMessage("Đã xóa món ăn khỏi nhật ký");
      setToastType("success");
      setShowToast(true);
      await fetchDiary(selectedDate);
    } catch {
      setToastMessage("Không thể xóa. Vui lòng thử lại.");
      setToastType("error");
      setShowToast(true);
    }
  }

  const formattedHour = `${selectedHourForMeal.toString().padStart(2, "0")}:00`;
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const dateStr = isToday ? "Hôm nay" : formatShortDate(selectedDate);
  const detailHeaderTitle = `${dateStr} • ${formattedHour}`;

  return (
    <ScreenBackground withGlow={true}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <StatusBar style="light" />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Pressable hitSlop={12}>
          <Ionicons color={theme.colors.textPrimary} name="menu-outline" size={26} />
        </Pressable>

        <View style={styles.dateSelector}>
          <Pressable hitSlop={12} onPress={goToPrevDay}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={20} />
          </Pressable>
          <Pressable hitSlop={10} onPress={() => router.push("/calendar")}>
            <Text style={styles.dateText}>{formatShortDate(selectedDate)}</Text>
          </Pressable>
          <Pressable hitSlop={12} onPress={goToNextDay}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-forward" size={20} />
          </Pressable>
        </View>

        <View style={{ width: 26 }} />
      </View>

      {/* ── Macro bars ── */}
      <View style={[styles.macrosRow, { paddingHorizontal: horizontalPadding }]}>
        {macros.map((macro) => {
          const progress = Math.min((macro.value / macro.target) * 100, 100);
          return (
            <View key={macro.label} style={styles.macroItem}>
              <View style={styles.macroTop}>
                <Ionicons color={macro.color} name={macro.icon} size={14} />
                <Text style={styles.macroValue}>
                  {macro.value} / {macro.target}
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: macro.color, width: `${progress}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Calo đốt từ bài tập ── */}
      {totalBurned > 0 && (
        <View style={[styles.burnedRow, { paddingHorizontal: horizontalPadding }]}>
          <Ionicons color={theme.colors.success} name="flame" size={14} />
          <Text style={styles.burnedText}>Đốt {totalBurned} kcal từ bài tập</Text>
        </View>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <ActivityIndicator
          color={theme.colors.primary}
          size="small"
          style={{ marginVertical: spacing.md }}
        />
      )}

      {/* ── Timeline ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineContainer}>
          {hours.map((hour) => {
            const isCurrentHour = hour === currentHour;
            const timeString = `${hour.toString().padStart(2, "0")}:00`;
            const slot = summary?.slots?.find((s) => s.hour === hour);
            const hasEntries = !!(slot && slot.entries && slot.entries.length > 0);

            // Bài tập trong giờ này
            const hourExercises = exercises.filter((ex) => ex.hour === hour);

            const slotTotals = hasEntries ? {
              calories: slot!.entries.reduce((sum, e) => sum + e.calories, 0),
              protein: Math.round(slot!.entries.reduce((sum, e) => sum + e.proteinGram, 0) * 10) / 10,
              carbs: Math.round(slot!.entries.reduce((sum, e) => sum + e.carbGram, 0) * 10) / 10,
              fat: Math.round(slot!.entries.reduce((sum, e) => sum + e.fatGram, 0) * 10) / 10,
            } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

            return (
              <View key={hour} style={styles.hourGroup}>
                {/* Header row of the hour */}
                <View style={styles.hourHeaderRow}>
                  <Text style={[styles.hourText, isCurrentHour && styles.hourTextActive]}>
                    {timeString}
                  </Text>
                  
                  {hasEntries && (
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
                  )}
                  
                  <View style={styles.hourLineDivider} />
                  
                  <Pressable
                    hitSlop={8}
                    onPress={() => handleAddMeal(hour)}
                    style={styles.hourAddBtn}
                  >
                    <Ionicons color={theme.colors.textMuted} name="add" size={20} />
                  </Pressable>
                </View>

                {/* Detailed Cards for Entries */}
                {(hasEntries || hourExercises.length > 0) && (
                  <View style={styles.hourContentList}>
                    {/* Meal Entries */}
                    {hasEntries && slot!.entries.map((entry) => {
                      const servings = Math.round(((entry.quantityG ?? 100) / 100) * 100) / 100;
                      return (
                        <Pressable
                          key={entry.id}
                          onPress={() => handleEditLog(entry)}
                          onLongPress={() => {
                            const numId = Number(entry.id);
                            if (!isNaN(numId)) {
                              handleDeleteLog(numId);
                            }
                          }}
                          style={styles.foodCard}
                        >
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
                        </Pressable>
                      );
                    })}

                    {/* Exercise Entries */}
                    {hourExercises.map((ex) => (
                      <View key={ex.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseCardIconBg}>
                          <Ionicons color={theme.colors.success} name="barbell-outline" size={16} />
                        </View>
                        <View style={styles.exerciseCardInfo}>
                          <Text style={styles.exerciseCardName} numberOfLines={1}>
                            {ex.activityLabel}
                          </Text>
                          <Text style={styles.exerciseCardSub}>
                            {ex.durationMinutes} phút • Đốt {ex.caloriesBurned} kcal
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Nút ghi bài tập ── */}
        <Pressable
          style={styles.exerciseButton}
          onPress={() => router.push(`/add-exercise?date=${selectedDate}`)}
        >
          <Ionicons color={theme.colors.success} name="barbell-outline" size={20} />
          <Text style={styles.exerciseButtonText}>Ghi hoạt động thể dục</Text>
        </Pressable>
      </ScrollView>

      {/* Food Selector Modal */}
      <FoodSelectorModal
        visible={showFoodSelector}
        onClose={() => setShowFoodSelector(false)}
        onSelectFood={handleSelectFood}
      />

      {/* Food Detail Modal - Tái sử dụng để xem chi tiết / nhập khẩu phần */}
      <FoodDetailModal
        visible={!!selectedFood}
        food={selectedFood}
        onClose={handleCancelMeal}
        onAdd={(food, adjustedGrams) => {
          handleSaveMeal(adjustedGrams);
        }}
        initialGrams={editingLogId !== null ? parseFloat(grams) : undefined}
        submitButtonText={editingLogId !== null ? "Lưu thay đổi" : "Thêm vào nhật ký"}
        headerTitle={detailHeaderTitle}
      />

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={2000}
        onHide={() => setShowToast(false)}
      />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dateText: {
    ...typography.h3,
    color: theme.colors.textPrimary,
    fontSize: 17,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  macroItem: { flex: 1, gap: 8 },
  macroTop: { flexDirection: "row", alignItems: "center", gap: 4 },
  macroValue: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 1.5 },
  burnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.xs,
  },
  burnedText: {
    ...typography.caption,
    color: theme.colors.success,
  },
  scrollContent: { paddingTop: spacing.lg },
  timelineContainer: { gap: spacing.md },
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
    color: theme.colors.textMuted,
    fontSize: 13,
    width: 44,
  },
  hourTextActive: {
    color: theme.colors.primary,
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
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginRight: 4,
  },
  hourLineDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  hourAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  hourContentList: {
    paddingLeft: 44,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  foodCardImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceAlt,
  },
  foodCardImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  foodCardInfo: {
    flex: 1,
    gap: 2,
  },
  foodCardName: {
    ...typography.bodyStrong,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  foodCardSub: {
    ...typography.caption,
    color: theme.colors.textSecondary,
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
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(92,214,122,0.06)",
    borderWidth: 1,
    borderColor: "rgba(92,214,122,0.15)",
    padding: spacing.sm,
    borderRadius: 10,
    gap: spacing.sm,
  },
  exerciseCardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "rgba(92,214,122,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseCardInfo: {
    flex: 1,
    gap: 1,
  },
  exerciseCardName: {
    ...typography.bodyStrong,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  exerciseCardSub: {
    ...typography.caption,
    color: theme.colors.success,
    fontSize: 11,
  },
  exerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(92,214,122,0.3)",
    backgroundColor: "rgba(92,214,122,0.08)",
  },
  exerciseButtonText: {
    ...typography.bodyStrong,
    color: theme.colors.success,
    fontSize: 15,
  },
  mealPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgBase,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  mealPanelContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});
