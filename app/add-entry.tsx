import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Toast } from "@/components/common/Toast";
import { colors, spacing, typography, radius } from "@/constants";
import { getTodayDateISO } from "@/hooks/utils/date";
import { useAddMealEntry } from "@/hooks/api/useDiaryApi";
import { useFoodList, useFoodDetails, FoodItem } from "@/hooks/api/useFoodApi";
import { calcNutrition } from "@/hooks/utils/nutrition";
import { MealPortionEditor } from "@/components/meal/MealPortionEditor";

// ── Types ────────────────────────────────────────────────────────────────────

/** Chuyển giờ → meal_type_id: 1=Sáng(5-10), 2=Trưa(11-14), 3=Tối(18-22), 4=Phụ */
function getMealTypeFromHour(hour: number): number {
  if (hour >= 5 && hour <= 10) return 1;
  if (hour >= 11 && hour <= 14) return 2;
  if (hour >= 18 && hour <= 22) return 3;
  return 4; // bữa phụ
}

export default function AddEntryScreen() {
  const { hour, date, foodId } = useLocalSearchParams<{ hour: string; date: string; foodId: string }>();
  const targetDate = date ?? getTodayDateISO();

  const { mutateAsync: addMealEntry, isPending: isSaving } = useAddMealEntry();

  // ── State ─────────────────────────────────────────────────────────────────
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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");



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
      setToastMessage("Vui lòng chọn món ăn và nhập số gram hợp lệ");
      setToastType("error");
      setShowToast(true);
      return;
    }
    try {
      await addMealEntry({
        foodItemId: selected.id,           // UUID string
        mealTypeId: mealTypeId,            // 1-4 từ đồng hồ
        dateISO: targetDate,
        quantityG: gramNum,
      });

      setToastMessage(
        `Đã lưu ${selected.name} (${gramNum}g)`
      );
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        router.replace("/(tabs)/meal-plan");
      }, 2000);
    } catch {
      setToastMessage("Không thể ghi bữa ăn. Vui lòng thử lại.");
      setToastType("error");
      setShowToast(true);
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
        <Text style={styles.headerTitle}>Ghi bữa ăn</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <Ionicons color={colors.textMuted} name="search-outline" size={18} />
        <TextInput
          autoFocus
          onChangeText={setSearchQuery}
          placeholder="Tìm món ăn... (ít nhất 2 ký tự)"
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
                <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
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
