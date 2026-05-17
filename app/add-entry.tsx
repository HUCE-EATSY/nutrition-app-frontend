import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { colors, radius, spacing, typography } from "@/constants";
import { foodService, FoodItemDto } from "@/services/foodService";
import { useAuthStore } from "@/hooks/store/authStore";
import { useDiaryStore } from "@/hooks/store/diaryStore";
import { getTodayDateISO } from "@/hooks/utils/date";

// ── Types ────────────────────────────────────────────────────────────────────
/** Local display shape – map từ FoodItemDto */
interface FoodItem {
  /** UUID string */
  id: string;
  name: string;
  imageUrl: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
}

function mapDto(dto: FoodItemDto): FoodItem {
  return {
    id: dto.id,
    name: dto.nameVi,
    imageUrl: dto.imageUrl ?? null,
    category: dto.category,
    calories: dto.caloriesKcal,
    protein: dto.proteinG ?? 0,
    carbs: dto.carbsG ?? 0,
    fat: dto.fatG ?? 0,
    servingSize: dto.servingSizeG,
  };
}

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

  const { addMealEntry } = useDiaryStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  // ── State ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");
  // mealTypeId: 1=Sáng, 2=Trưa, 3=Tối, 4=Bữa phụ
  const [mealTypeId, setMealTypeId] = useState(getMealTypeFromHour(
    hour ? parseInt(hour, 10) : new Date().getHours()
  ));
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Danh sách khung giờ (7:00 - 23:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);

  // ── Load pre-selected food nếu có foodId ─────────────────────────────────
  useEffect(() => {
    if (foodId) {
      loadFoodById(foodId);
    }
  }, [foodId]);

  async function loadFoodById(id: string) {
    try {
      const dto = await foodService.getFoodById(id);
      if (dto) setSelected(mapDto(dto));
    } catch (error) {
      console.error("Failed to load food:", error);
    }
  }

  // ── Search với debounce 400ms ─────────────────────────────────────────────
  const searchFoods = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const result = await foodService.searchFoods({ q: query, pageSize: 20 });
      const items = Array.isArray(result) ? result : (result?.items ?? []);
      setFoods(items.map(mapDto));
    } catch {
      setFoods([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setFoods([]);
      return;
    }
    debounceRef.current = setTimeout(() => searchFoods(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, searchFoods]);

  // ── Tính dinh dưỡng theo gram ─────────────────────────────────────────────
  function calcNutrition(food: FoodItem, g: number) {
    const ratio = g / food.servingSize;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carb: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
    };
  }

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
    setIsSaving(true);
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
            keyExtractor={(item) => item.id}
            style={styles.list}
            ListEmptyComponent={
              searchQuery.length >= 2 && !isSearching ? (
                <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={async () => {
                  setSelected(item);
                  try {
                    const full = await foodService.getFoodById(item.id);
                    if (full) {
                      setSelected(mapDto(full));
                    }
                  } catch (e) {
                    console.error("Failed to load food details:", e);
                  }
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
          {/* Tên món đã chọn */}
          <View style={styles.selectedRow}>
            <Ionicons color={colors.warning} name="restaurant-outline" size={20} />
            <Text style={styles.selectedName} numberOfLines={1}>
              {selected.name}
            </Text>
            <Pressable hitSlop={8} onPress={() => setSelected(null)}>
              <Ionicons color={colors.textMuted} name="close" size={20} />
            </Pressable>
          </View>

          {/* Input gram */}
          <View style={styles.gramRow}>
            <Text style={styles.gramLabel}>Số gram</Text>
            <View style={styles.gramInputWrap}>
              <Pressable
                onPress={() => setGrams((g) => String(Math.max(1, parseFloat(g) - 10)))}
                style={styles.stepBtn}
              >
                <Ionicons color={colors.textPrimary} name="remove" size={20} />
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
                <Ionicons color={colors.textPrimary} name="add" size={20} />
              </Pressable>
            </View>
          </View>

          {/* Chọn khung giờ */}
          <View style={styles.hourRow}>
            <Text style={styles.hourLabel}>Khung giờ</Text>
            <View style={styles.hourSelector}>
              <Pressable
                onPress={() => setSelectedHour((h) => Math.max(7, h - 1))}
                style={styles.hourBtn}
              >
                <Ionicons color={colors.textPrimary} name="chevron-back" size={20} />
              </Pressable>
              <View style={styles.hourDisplay}>
                <Ionicons color={colors.warning} name="time-outline" size={18} />
                <Text style={styles.hourText}>
                  {selectedHour.toString().padStart(2, "0")}:00
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedHour((h) => Math.min(23, h + 1))}
                style={styles.hourBtn}
              >
                <Ionicons color={colors.textPrimary} name="chevron-forward" size={20} />
              </Pressable>
            </View>
          </View>

          {/* Preview dinh dưỡng */}
          {nutrition && (
            <View style={styles.nutritionGrid}>
              {[
                { label: "Calo", val: `${nutrition.calories} kcal`, color: colors.primary },
                { label: "Protein", val: `${nutrition.protein}g`, color: colors.protein },
                { label: "Carbs", val: `${nutrition.carb}g`, color: colors.carbs },
                { label: "Fat", val: `${nutrition.fat}g`, color: colors.fat },
              ].map((n) => (
                <View key={n.label} style={styles.nutritionCell}>
                  <Text style={[styles.nutritionVal, { color: n.color }]}>{n.val}</Text>
                  <Text style={styles.nutritionLabel}>{n.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Nút lưu */}
          <Pressable
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons color="#fff" name="checkmark-circle-outline" size={20} />
                <Text style={styles.saveBtnText}>Ghi bữa ăn</Text>
              </>
            )}
          </Pressable>
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
    gap: spacing.lg,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  selectedName: { ...typography.bodyStrong, color: colors.textPrimary, flex: 1 },
  gramRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gramLabel: { ...typography.body, color: colors.textSecondary },
  gramInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  gramInput: {
    width: 72,
    height: 44,
    textAlign: "center",
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 18,
  },
  nutritionGrid: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  nutritionCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.borderSoft,
  },
  nutritionVal: { ...typography.bodyStrong, fontSize: 15 },
  nutritionLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: "auto",
    marginBottom: spacing.lg,
  },
  saveBtnText: { ...typography.bodyStrong, color: "#fff" },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hourLabel: { ...typography.body, color: colors.textSecondary },
  hourSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  hourBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  hourDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 100,
    justifyContent: "center",
  },
  hourText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 18,
  },
});
