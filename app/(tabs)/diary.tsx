import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { theme, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { useDiaryStore } from "@/hooks/store/diaryStore";
import { formatShortDate } from "@/hooks/utils/date";
import { FoodSelectorModal } from "@/components/meal/FoodSelectorModal";
import { Toast } from "@/components/common/Toast";

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
    summary,
    exercises,
    isLoading,
    goToPrevDay,
    goToNextDay,
    fetchDiary,
    addMealEntry,
  } = useDiaryStore();

  // Modal state
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedHourForMeal, setSelectedHourForMeal] = useState<number>(currentHour);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState("100");
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Load dữ liệu khi màn hình mount hoặc ngày thay đổi
  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate, fetchDiary]);

  const macros: MacroInfo[] = [
    {
      label: "Calo",
      value: summary?.consumedCalories ?? 0,
      target: summary?.targetCalories ?? 2000,
      icon: "flame",
      color: theme.colors.primary,
    },
    {
      label: "Protein",
      value: summary?.consumedProteinGram ?? 0,
      target: summary?.targetProteinGram ?? 120,
      icon: "flash",
      color: theme.colors.protein,
    },
    {
      label: "Carbs",
      value: summary?.consumedCarbGram ?? 0,
      target: summary?.targetCarbGram ?? 150,
      icon: "leaf",
      color: theme.colors.carbs,
    },
    {
      label: "Fat",
      value: summary?.consumedFatGram ?? 0,
      target: summary?.targetFatGram ?? 55,
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
    setGrams("100"); // Reset gram về 100
  }

  // Tính dinh dưỡng theo gram
  function calcNutrition(food: any, g: number) {
    const ratio = g / food.servingSize;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carb: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
    };
  }

  // Lưu bữa ăn
  async function handleSaveMeal() {
    if (!selectedFood) return;

    const gramNum = parseFloat(grams) || 0;
    if (gramNum <= 0) {
      setToastMessage("Vui lòng nhập số gram hợp lệ");
      setToastType("error");
      setShowToast(true);
      return;
    }

    const nutrition = calcNutrition(selectedFood, gramNum);

    setIsSaving(true);
    try {
      await addMealEntry({
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        dateISO: selectedDate,
        hour: selectedHourForMeal,
        quantityG: gramNum,
        totalCalories: nutrition.calories,
        proteinGram: nutrition.protein,
        carbGram: nutrition.carb,
        fatGram: nutrition.fat,
      });

      // Hiện toast thành công
      setToastMessage(
        `Đã lưu ${selectedFood.name} (${gramNum}g) vào ${selectedHourForMeal
          .toString()
          .padStart(2, "0")}:00`
      );
      setToastType("success");
      setShowToast(true);

      // Reset state
      setSelectedFood(null);
      setGrams("100");

      // Refresh diary
      await fetchDiary(selectedDate);
    } catch {
      setToastMessage("Không thể ghi bữa ăn. Vui lòng thử lại.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
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
            const slot = summary?.slots.find((s) => s.hour === hour);
            const hasEntries = !!(slot && slot.entries.length > 0);

            // Bài tập trong giờ này
            const hourExercises = exercises.filter((ex) => ex.hour === hour);

            return (
              <View key={hour} style={styles.timelineRow}>
                {/* Giờ */}
                <View style={styles.timeWrapper}>
                  <Text
                    style={[styles.timeText, isCurrentHour && styles.timeTextActive]}
                  >
                    {timeString}
                  </Text>
                </View>

                {/* Nội dung */}
                <View style={styles.lineContentWrapper}>
                  <View
                    style={[
                      styles.timelineLine,
                      isCurrentHour && styles.timelineLineActive,
                    ]}
                  />

                  <View style={styles.entriesColumn}>
                    {/* Bữa ăn */}
                    {hasEntries && (
                      <View style={styles.entryChip}>
                        <Ionicons
                          color={theme.colors.warning}
                          name="restaurant-outline"
                          size={12}
                        />
                        <Text numberOfLines={1} style={styles.entryText}>
                          {slot!.entries.map((e) => e.title).join(", ")}
                        </Text>
                        <Text style={styles.entryCalText}>
                          {slot!.entries.reduce((s, e) => s + e.calories, 0)} kcal
                        </Text>
                      </View>
                    )}

                    {/* Bài tập */}
                    {hourExercises.map((ex) => (
                      <View key={ex.id} style={[styles.entryChip, styles.exerciseChip]}>
                        <Ionicons
                          color={theme.colors.success}
                          name="barbell-outline"
                          size={12}
                        />
                        <Text numberOfLines={1} style={styles.entryText}>
                          {ex.activityLabel} {ex.durationMinutes} phút
                        </Text>
                        <Text style={[styles.entryCalText, { color: theme.colors.success }]}>
                          -{ex.caloriesBurned} kcal
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Nút thêm bữa ăn */}
                <Pressable
                  hitSlop={8}
                  onPress={() => handleAddMeal(hour)}
                  style={styles.addButton}
                >
                  <Ionicons color={theme.colors.textMuted} name="add" size={24} />
                </Pressable>
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

      {/* Meal Entry Panel - Hiện khi đã chọn món */}
      {selectedFood && (
        <View style={styles.mealPanel}>
          <View style={styles.mealPanelContent}>
            {/* Món đã chọn */}
            <View style={styles.selectedFoodRow}>
              <Ionicons color={theme.colors.warning} name="restaurant-outline" size={20} />
              <Text style={styles.selectedFoodName} numberOfLines={1}>
                {selectedFood.name}
              </Text>
              <Pressable hitSlop={8} onPress={() => setSelectedFood(null)}>
                <Ionicons color={theme.colors.textMuted} name="close" size={20} />
              </Pressable>
            </View>

            {/* Giờ */}
            <View style={styles.mealInfoRow}>
              <Ionicons color={theme.colors.warning} name="time-outline" size={16} />
              <Text style={styles.mealInfoText}>
                {selectedHourForMeal.toString().padStart(2, "0")}:00
              </Text>
            </View>

            {/* Input gram */}
            <View style={styles.gramRow}>
              <Text style={styles.gramLabel}>Số gram</Text>
              <View style={styles.gramInputWrap}>
                <Pressable
                  onPress={() => setGrams((g) => String(Math.max(1, parseFloat(g) - 10)))}
                  style={styles.stepBtn}
                >
                  <Ionicons color={theme.colors.textPrimary} name="remove" size={18} />
                </Pressable>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setGrams}
                  style={styles.gramInput}
                  value={grams}
                />
                <Pressable
                  onPress={() => setGrams((g) => String(parseFloat(g) + 10))}
                  style={styles.stepBtn}
                >
                  <Ionicons color={theme.colors.textPrimary} name="add" size={18} />
                </Pressable>
              </View>
            </View>

            {/* Nutrition preview */}
            {(() => {
              const gramNum = parseFloat(grams) || 0;
              const nutrition = calcNutrition(selectedFood, gramNum);
              return (
                <View style={styles.nutritionPreview}>
                  <Text style={styles.nutritionPreviewText}>
                    {nutrition.calories} kcal • {nutrition.protein}g protein • {nutrition.carb}g
                    carbs • {nutrition.fat}g fat
                  </Text>
                </View>
              );
            })()}

            {/* Buttons */}
            <View style={styles.mealPanelButtons}>
              <Pressable
                onPress={() => setSelectedFood(null)}
                style={[styles.mealPanelButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={isSaving}
                onPress={handleSaveMeal}
                style={[styles.mealPanelButton, styles.saveButton, isSaving && { opacity: 0.6 }]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={2000}
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bgBase },
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
  timelineContainer: { gap: spacing.sm },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 48,
  },
  timeWrapper: { width: 50, paddingTop: 4 },
  timeText: {
    ...typography.bodyStrong,
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  timeTextActive: { color: theme.colors.primary },
  lineContentWrapper: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center",
    marginHorizontal: spacing.sm,
  },
  timelineLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  timelineLineActive: { backgroundColor: "rgba(165,108,255,0.15)" },
  entriesColumn: { gap: 4 },
  entryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  exerciseChip: { backgroundColor: "rgba(92,214,122,0.12)" },
  entryText: {
    ...typography.caption,
    color: theme.colors.textPrimary,
    fontSize: 12,
    flex: 1,
  },
  entryCalText: {
    ...typography.caption,
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  selectedFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  selectedFoodName: {
    ...typography.bodyStrong,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  mealInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  mealInfoText: {
    ...typography.body,
    color: theme.colors.textSecondary,
  },
  gramRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gramLabel: {
    ...typography.body,
    color: theme.colors.textSecondary,
  },
  gramInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    overflow: "hidden",
  },
  stepBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceAlt,
  },
  gramInput: {
    width: 60,
    height: 40,
    textAlign: "center",
    ...typography.bodyStrong,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  nutritionPreview: {
    backgroundColor: theme.colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
  },
  nutritionPreviewText: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  mealPanelButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  mealPanelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
  },
  cancelButtonText: {
    ...typography.bodyStrong,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
});
