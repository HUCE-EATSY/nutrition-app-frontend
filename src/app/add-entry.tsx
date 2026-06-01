import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import { ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { getTodayDateISO } from "@/utils/date";
import { useDiaryStore } from "@/store/diaryStore";
import { useFoodList, useFoodDetails, FoodItem } from "@/hooks/queries/useFoodQueries";
import { calcNutrition } from "@/utils/nutrition";
import { MealPortionEditor } from "@/components/meal/MealPortionEditor";
import { useTranslation } from "@/constants/i18n";

// ── Types ────────────────────────────────────────────────────────────────────

/** Chuyển giờ → meal_type_id: 1=Sáng(5-10), 2=Trưa(11-14), 3=Tối(18-22), 4=Phụ */
function getMealTypeFromHour(hour: number): number {
  if (hour >= 5 && hour <= 10) return 1;
  if (hour >= 11 && hour <= 14) return 2;
  if (hour >= 18 && hour <= 22) return 3;
  return 4; // bữa phụ
}

export default function AddEntryScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { hour, date, foodId } = useLocalSearchParams<{ hour: string; date: string; foodId: string }>();
  const targetDate = date ?? getTodayDateISO();

  const { addMealEntry } = useDiaryStore();

  // ── State ─────────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");
  
  // State quản lý giờ được chọn (Tránh lỗi crash do biến selectedHour chưa được định nghĩa)
  const [selectedHour, setSelectedHour] = useState(
    hour ? parseInt(hour, 10) : new Date().getHours()
  );
  
  // mealTypeId: 1=Sáng, 2=Trưa, 3=Tối, 4=Bữa phụ
  const [mealTypeId, setMealTypeId] = useState(getMealTypeFromHour(selectedHour));
  
  useEffect(() => {
    setMealTypeId(getMealTypeFromHour(selectedHour));
  }, [selectedHour]);

  // Toast state
  const [showToast, setShowToast] = useState(false);
    


  // ── Load pre-selected food nếu có foodId ─────────────────────────────────
  const { data: preSelectedFood } = useFoodDetails(foodId);
  useEffect(() => {
    if (preSelectedFood) {
      setSelected(preSelectedFood);
    }
  }, [preSelectedFood]);

  // ── Search với debounce 400ms ─────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().length >= 2 ? searchQuery : "");
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: foods = [], isFetching: isSearching } = useFoodList(debouncedQuery);


  const gramNum = parseFloat(grams) || 0;
  const nutrition = selected ? calcNutrition(selected, gramNum) : null;

  // ── Lưu bữa ăn ───────────────────────────────────────────────────────────
  async function handleSave() {
    if (!selected || gramNum <= 0) {
      setToastMessage(t.mealEntry.validationError);
      setToastType("error");
      setShowToast(true);
      return;
    }
    setIsSaving(true);
    try {
      await addMealEntry({
        foodItemId: selected.id,           // UUID string
        mealTypeId: mealTypeId,            // 1-4 từ đồng hồ
        dateISO: targetDate,
        quantityG: gramNum,
      });

      setToastMessage(
        t.mealEntry.saveSuccess(selected.name, gramNum)
      );
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        router.replace("/(tabs)/meal-plan");
      }, 2000);
    } catch {
      setToastMessage(t.mealEntry.saveError);
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.mealEntry.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons color={colors.textMuted} name="search-outline" size={18} />
        <TextInput
          autoFocus
          onChangeText={setSearchQuery}
          placeholder={t.mealEntry.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => { setSearchQuery(""); setSelected(null); }}>
            <Ionicons color={colors.textMuted} name="close-circle" size={18} />
          </Pressable>
        )}
      </View>

      {/* Danh sách kết quả */}
      {!selected && (
        <>
          {isSearching && (
            <ActivityIndicator
              color={colors.primary}
              size="small"
              style={{ marginTop: spacing.md }}
            />
          )}
          <FlatList
            data={foods}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            ListEmptyComponent={
              searchQuery.length >= 2 && !isSearching ? (
                <Text style={styles.emptyText}>{t.mealEntry.noResults}</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelected(item);
                }}
                style={styles.foodRow}
              >
                <View style={styles.foodIcon}>
                  <Ionicons color={colors.warning} name="restaurant-outline" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodSub}>
                    {item.calories} kcal / {item.servingSize}g • {item.category}
                  </Text>
                </View>
                <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
              </Pressable>
            )}
          />
        </>
      )}

      {/* Panel chọn số gram */}
      {selected && (
        <View style={styles.gramPanel}>
          <MealPortionEditor
            foodName={selected.name}
            grams={grams}
            setGrams={setGrams}
            nutrition={nutrition}
            onSave={handleSave}
            onCancel={() => setSelected(null)}
            isSaving={isSaving}
            selectedHour={selectedHour}
            setSelectedHour={setSelectedHour}
          />
        </View>
      )}

      {/* Toast Notification */}
          </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
  },
  list: { marginTop: spacing.sm },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  foodName: { ...typography.bodyStrong, color: colors.textPrimary, fontSize: 15 },
  foodSub: { ...typography.caption, color: colors.textMuted },
  gramPanel: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
