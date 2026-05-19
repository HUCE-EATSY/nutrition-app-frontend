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

import { colors, spacing, typography, radius } from "@/constants";
import { getTodayDateISO } from "@/hooks/utils/date";
import { useAddMealEntry } from "@/hooks/api/useDiaryApi";
import { useFoodList, useFoodDetails, FoodItem } from "@/hooks/api/useFoodApi";
import { calcNutrition } from "@/hooks/utils/nutrition";
import { Toast } from "@/components/common/Toast";

// ── Types ────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────
export default function AddEntryScreen() {
  const { hour, date, foodId } = useLocalSearchParams<{ hour: string; date: string; foodId: string }>();
  const targetDate = date ?? getTodayDateISO();

  const { mutateAsync: addMealEntry, isPending: isSaving } = useAddMealEntry();

  // ── State ─────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");
  const [selectedHour, setSelectedHour] = useState(
    hour ? parseInt(hour, 10) : new Date().getHours()
  );

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

      // Đợi 2s rồi quay về tab Thực đơn
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
                onPress={() => setSelected(item)}
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
