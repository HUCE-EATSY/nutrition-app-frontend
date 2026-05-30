import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { useDiaryStore } from "@/hooks/store/diaryStore";
import { useAuthStore } from "@/hooks/store/authStore";
import { getTodayDateISO } from "@/hooks/utils/date";
import Toast from "@/components/common/Toast";
import { API_BASE } from "@/constants/api";

// ── Types ────────────────────────────────────────────────────────────────────
// Khớp với FoodSearchResponse từ backend
interface FoodItem {
  id: string;          // Guid
  name: string;        // name_vi
  imageUrl: string | null;
  category: string;
  calories: number;    // nutrition.calories_kcal
  protein: number;     // nutrition.protein_g
  carbs: number;       // nutrition.carbs_g
  fat: number;         // nutrition.fat_g
  servingSize: number; // serving_size_g
}

// Shape raw từ /api/foods/search
interface RawFoodSearchItem {
  id: string;
  name_vi: string;
  name_en?: string;
  category_id: number;
  serving_size_g: number;
  calories_kcal?: number;
  image_url?: string;
}

// Shape raw từ /api/foods/{id}
interface RawFoodDetail {
  id: string;
  name_vi: string;
  name_en?: string;
  serving_size_g: number;
  image_url?: string;
  category?: { id: number; name_vi: string; name_en?: string };
  nutrition?: {
    calories_kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

function mapRawSearch(raw: RawFoodSearchItem): FoodItem {
  return {
    id: raw.id,
    name: raw.name_vi,
    imageUrl: raw.image_url ?? null,
    category: String(raw.category_id),
    calories: Number(raw.calories_kcal ?? 0),
    protein: 0,
    carbs: 0,
    fat: 0,
    servingSize: Number(raw.serving_size_g),
  };
}

function mapRawDetail(raw: RawFoodDetail): FoodItem {
  return {
    id: raw.id,
    name: raw.name_vi,
    imageUrl: raw.image_url ?? null,
    category: raw.category?.name_vi ?? "",
    calories: Number(raw.nutrition?.calories_kcal ?? 0),
    protein: Number(raw.nutrition?.protein_g ?? 0),
    carbs: Number(raw.nutrition?.carbs_g ?? 0),
    fat: Number(raw.nutrition?.fat_g ?? 0),
    servingSize: Number(raw.serving_size_g),
  };
}

// API base đã được cấu hình trong @/constants/api
// Endpoint thực của backend: GET /api/foods/search?q=...&page=1&pageSize=20

export default function AddEntryScreen() {
  const { hour, date, foodId } = useLocalSearchParams<{ hour: string; date: string; foodId: string }>();
  const targetDate = date ?? getTodayDateISO();

  const { addMealEntry } = useDiaryStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  // ── State ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // allFoods không dùng nữa vì backend yêu cầu query Q bắt buộc
  const sectionListRef = useRef<SectionList>(null);

  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");
  const [selectedHour, setSelectedHour] = useState(
    hour ? parseInt(hour, 10) : new Date().getHours()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Danh sách khung giờ (7:00 - 23:00)
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);

  // ── Load pre-selected food nếu có foodId ─────────────────────────────────
  // Endpoint: GET /api/foods/{id} → trả về FoodDetailResponse
  useEffect(() => {
    if (foodId) {
      loadFoodById(foodId);
    }
  }, [foodId]);

  async function loadFoodById(id: string) {
    try {
      const res = await fetch(`${API_BASE}/api/foods/${id}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.data) {
        setSelected(mapRawDetail(json.data as RawFoodDetail));
      }
    } catch (error) {
      console.error("Failed to load food:", error);
    }
  }

  // ── Search với debounce 400ms ─────────────────────────────────────────────
  // Endpoint: GET /api/foods/search?q=...&page=1&pageSize=20
  // Response: ApiResponse<PaginatedResponse<FoodSearchResponse>>
  //   → json.data.items[] (mỗi item có: id, name_vi, serving_size_g, calories_kcal, image_url)
  const searchFoods = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/foods/search?q=${encodeURIComponent(query)}&page=1&pageSize=20`
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      // json.data là PaginatedResponse, items nằm trong json.data.items
      const items: RawFoodSearchItem[] = json.data?.items ?? [];
      setFoods(items.map(mapRawSearch));
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
        foodId: selected.id,
        foodName: selected.name,
        dateISO: targetDate,
        hour: selectedHour,
        quantityG: gramNum,
        totalCalories: nutrition!.calories,
        proteinGram: nutrition!.protein,
        carbGram: nutrition!.carb,
        fatGram: nutrition!.fat,
      });

      // Hiện toast thành công
      setToastMessage(
        `Đã lưu ${selected.name} (${gramNum}g) vào ${selectedHour.toString().padStart(2, "0")}:00`
      );
      setToastType("success");
      setShowToast(true);

      // Đợi 2s rồi quay về tab Nhật ký
      setTimeout(() => {
        router.replace("/(tabs)/diary");
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
            keyExtractor={(item: FoodItem) => String(item.id)}
            style={styles.list}
            ListEmptyComponent={
              searchQuery.length >= 2 && !isSearching ? (
                <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
              ) : searchQuery.length < 2 ? (
                <Text style={styles.emptyText}>Nhập ít nhất 2 ký tự để tìm kiếm</Text>
              ) : null
            }
            renderItem={({ item }: { item: FoodItem }) => (
              <Pressable
                onPress={() => setSelected(item)}
                style={styles.foodRow}
              >
                <View style={styles.foodIcon}>
                  <Ionicons color={colors.warning} name="restaurant-outline" size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodSub}>
                    {item.calories} kcal / {item.servingSize}g
                    {item.category ? ` • ${item.category}` : ""}
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
