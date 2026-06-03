import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { SafeScreen } from "@/components/layout/SafeScreen";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { menuService, MenuResponse, MenuFoodItem } from "@/services/menuService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MEAL_TYPE_NAMES: Record<number, string> = {
  1: "Bữa sáng",
  2: "Bữa trưa",
  3: "Bữa tối",
  4: "Bữa phụ",
};

const MEAL_TYPE_ICONS: Record<number, React.ComponentProps<typeof Ionicons>["name"]> = {
  1: "sunny-outline",
  2: "partly-sunny-outline",
  3: "moon-outline",
  4: "cafe-outline",
};

export default function MenuDetailScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ menuId?: string }>();
  const menuId = params.menuId ?? "";

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const triggerToast = (msg: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  // Lấy danh sách tất cả menu rồi lọc theo menuId
  const { data: allMenus, isLoading } = useQuery({
    queryKey: ["menus", "my-plans"],
    queryFn: menuService.getMyPlans,
  });

  const menu: MenuResponse | undefined = allMenus?.find((m) => m.id === menuId);

  // Apply to today mutation
  const applyMutation = useMutation({
    mutationFn: () => {
      const today = new Date().toISOString().split("T")[0];
      return menuService.applyDailyPlan(menuId, today);
    },
    onSuccess: () => {
      triggerToast("Đã áp dụng thực đơn vào kế hoạch hôm nay! ✅", "success");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: () => {
      triggerToast("Không thể áp dụng. Thử lại sau.", "error");
    },
  });

  // Delete menu mutation
  const deleteMutation = useMutation({
    mutationFn: () => menuService.deleteMenu(menuId),
    onSuccess: () => {
      triggerToast("Đã xóa thực đơn.", "info");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setTimeout(() => router.back(), 1200);
    },
    onError: () => {
      triggerToast("Không thể xóa. Thử lại sau.", "error");
    },
  });

  const handleApplyToday = () => {
    Alert.alert(
      "Áp dụng thực đơn",
      "Bạn muốn áp dụng thực đơn này vào kế hoạch ăn hôm nay không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Áp dụng", onPress: () => applyMutation.mutate() },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa thực đơn",
      `Bạn chắc chắn muốn xóa thực đơn "${menu?.name ?? ""}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const handleShare = async () => {
    if (!menu) return;
    const lines = [
      `🍽️ Thực đơn: ${menu.name}`,
      menu.description ? `📝 ${menu.description}` : "",
      `🔥 ${Math.round(menu.totalCalories)} kcal | 💪 P ${Math.round(menu.totalProtein)}g | 🍞 C ${Math.round(menu.totalCarbs)}g | 🥑 F ${Math.round(menu.totalFat)}g`,
      `📋 ${menu.foods.length} món — từ WAO Health App`,
    ].filter(Boolean).join("\n");
    await Share.share({ message: lines });
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!menu) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Không tìm thấy thực đơn
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtnSolo, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  // Group foods by meal type
  const mealGroups: Record<number, MenuFoodItem[]> = {};
  for (const food of menu.foods) {
    const key = food.mealTypeId;
    if (!mealGroups[key]) mealGroups[key] = [];
    mealGroups[key].push(food);
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {menu.name}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Nutrition Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          {menu.description ? (
            <Text style={styles.summaryDesc}>{menu.description}</Text>
          ) : null}
          <View style={styles.macroRow}>
            {[
              { label: "Calo", value: `${Math.round(menu.totalCalories)}`, unit: "kcal", color: "#FFD700" },
              { label: "Đạm", value: `${Math.round(menu.totalProtein)}`, unit: "g", color: "#FF9500" },
              { label: "Tinh bột", value: `${Math.round(menu.totalCarbs)}`, unit: "g", color: "#34C759" },
              { label: "Chất béo", value: `${Math.round(menu.totalFat)}`, unit: "g", color: "#FF2D55" },
            ].map((m, i) => (
              <View key={i} style={styles.macroItem}>
                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.macroUnit}>{m.unit}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.foodCount}>{menu.foods.length} món ăn trong thực đơn</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleApplyToday}
            disabled={applyMutation.isPending}
            style={[styles.actionBtn, { backgroundColor: "#34C759" }]}
            activeOpacity={0.85}
          >
            {applyMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="calendar-check" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Áp dụng hôm nay</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            style={[styles.actionBtn, { backgroundColor: "#FF2D55" }]}
            activeOpacity={0.85}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Xóa thực đơn</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Food items grouped by meal */}
        {Object.entries(mealGroups).map(([mealTypeId, foods]) => {
          const mId = Number(mealTypeId);
          const mealCals = foods.reduce((s, f) => s + f.caloriesKcal, 0);
          return (
            <View key={mId} style={[styles.mealGroup, { backgroundColor: colors.surface }]}>
              <View style={styles.mealGroupHeader}>
                <Ionicons
                  name={MEAL_TYPE_ICONS[mId] ?? "restaurant-outline"}
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.mealGroupTitle, { color: colors.textPrimary }]}>
                  {MEAL_TYPE_NAMES[mId] ?? `Bữa ${mId}`}
                </Text>
                <Text style={[styles.mealGroupCals, { color: colors.textSecondary }]}>
                  {Math.round(mealCals)} kcal
                </Text>
              </View>
              {foods.map((food, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.foodRow,
                    { borderColor: colors.border ?? "#E0E0E0" },
                    idx < foods.length - 1 && { borderBottomWidth: 1 },
                  ]}
                >
                  <View style={styles.foodInfo}>
                    <Text style={[styles.foodName, { color: colors.textPrimary }]}>{food.nameVi}</Text>
                    <Text style={[styles.foodSub, { color: colors.textSecondary }]}>
                      {food.quantityG}g • {Math.round(food.caloriesKcal)} kcal
                    </Text>
                  </View>
                  <View style={styles.foodMacros}>
                    <Text style={[styles.foodMacro, { color: "#FF9500" }]}>P {Math.round(food.proteinG)}g</Text>
                    <Text style={[styles.foodMacro, { color: "#34C759" }]}>C {Math.round(food.carbsG)}g</Text>
                    <Text style={[styles.foodMacro, { color: "#FF2D55" }]}>F {Math.round(food.fatG)}g</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Created at */}
        <Text style={[styles.createdAt, { color: colors.textSecondary }]}>
          Tạo ngày {new Date(menu.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>
      </View>

      <Toast visible={showToast} message={toastMessage} type={toastType} duration={2500} onHide={() => setShowToast(false)} />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    fontSize: 15,
    textAlign: "center",
  },
  backBtnSolo: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: spacing.xs },
  shareBtn: { padding: spacing.xs },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryDesc: {
    ...typography.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontStyle: "italic",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  macroUnit: {
    ...typography.caption,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  macroLabel: {
    ...typography.caption,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  foodCount: {
    ...typography.caption,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  mealGroup: {
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mealGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  mealGroupTitle: {
    ...typography.bodyStrong,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  mealGroupCals: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: "600",
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  foodInfo: { flex: 1 },
  foodName: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: "600",
  },
  foodSub: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  foodMacros: {
    alignItems: "flex-end",
    gap: 2,
  },
  foodMacro: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
  },
  createdAt: {
    ...typography.caption,
    fontSize: 12,
    textAlign: "center",
  },
});
