import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  Modal,
  Animated,
  Platform,
  AlertButton,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const showAlert = (title: string, message: string, buttons?: AlertButton[]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const confirmBtn = buttons.find(b => b.text !== "Hủy" && b.text !== "Cancel");
      const confirmed = window.confirm(`${title}: ${message}`);
      if (confirmed && confirmBtn?.onPress) {
        confirmBtn.onPress();
      }
    } else {
      window.alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

import { GradientButton } from "@/components/buttons/GradientButton";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { HeroPlanCard } from "@/components/meal/HeroPlanCard";
import { useRouter } from "expo-router";
import { SegmentedPillTabs } from "@/components/meal/SegmentedPillTabs";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { useFoodList, FoodItem } from "@/hooks/queries/useFoodQueries";
import { useDiaryStore } from "@/store/diaryStore";
import Toast from "@/components/common/Toast";

import {
  useMyPlans,
  useDailyPlanQuery,
  useCreateMenuMutation,
  useDeleteMenuMutation,
  useApplyMenuMutation,
  useSyncToDiaryMutation,
} from "@/hooks/queries/useMenus";

export default function MealPlanScreen() {
  const router = useRouter();
  const t = useTranslation();
  const colors = useAppColors();
  const { isNarrowWidth } = useResponsiveLayout();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  // Tab State
  const [activeTab, setActiveTab] = useState("discover");
  const tabs = [
    { key: "daily", label: "Hằng ngày" },
    { key: "discover", label: "Khám phá" },
    { key: "saved", label: "Tự tạo" },
  ];

  // Zustand stores for global synchronization
  const { fetchDiary, selectedDate, setDate } = useDiaryStore();

  // React Query Hooks
  const { data: dailyPlanData, isLoading: isLoadingDailyPlan, refetch: refetchDailyPlan } = useDailyPlanQuery(selectedDate);
  const { data: myPlans = [], isLoading: isLoadingMyPlans } = useMyPlans();

  const createMenuMutation = useCreateMenuMutation();
  const deleteMenuMutation = useDeleteMenuMutation();
  const applyMenuMutation = useApplyMenuMutation();
  const syncToDiaryMutation = useSyncToDiaryMutation();

  // Search & Foods List from DB
  const { data: foods = [], isLoading: isLoadingFoods } = useFoodList();
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(foodSearchQuery.toLowerCase())
  );

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const triggerToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");
  
  // Custom Menu Foods in Creation state
  const [newMenuFoods, setNewMenuFoods] = useState<{
    food: FoodItem;
    quantityG: number;
    mealTypeId: number;
  }[]>([]);

  // Add Food Popup states
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null);
  const [mealSelectorVisible, setMealSelectorVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<number>(1);
  const [quantityGrams, setQuantityGrams] = useState("100");

  // Animations
  const tickScale1 = useRef(new Animated.Value(1)).current;
  const tickScale2 = useRef(new Animated.Value(1)).current;
  const tickScale3 = useRef(new Animated.Value(1)).current;
  const tickScale4 = useRef(new Animated.Value(1)).current;

  const getScaleAnim = (mealTypeId: number) => {
    switch (mealTypeId) {
      case 1: return tickScale1;
      case 2: return tickScale2;
      case 3: return tickScale3;
      case 4: return tickScale4;
      default: return tickScale1;
    }
  };

  // Sync Date when changing
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  };

  // Daily plan computations
  const planItems = dailyPlanData?.items ?? [];
  const getPlanItemsByMeal = (mealTypeId: number) => planItems.filter((p) => p.mealTypeId === mealTypeId);
  
  // Calculated totals of the daily plan
  const planTotals = React.useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0;
    planItems.forEach((p) => {
      cal += p.caloriesKcal;
      pro += p.proteinG;
      carb += p.carbsG;
      fat += p.fatG;
    });
    return {
      calories: Math.round(cal),
      protein: Math.round(pro * 10) / 10,
      carbs: Math.round(carb * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [planItems]);

  const mealInfoMap: Record<number, { label: string; icon: string; color: string }> = {
    1: { label: "Bữa sáng", icon: "sunny", color: "#FF9800" },
    2: { label: "Bữa trưa", icon: "restaurant", color: "#4CAF50" },
    3: { label: "Bữa tối", icon: "moon", color: "#3F51B5" },
    4: { label: "Bữa phụ", icon: "cafe", color: "#E91E63" },
  };

  // ════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════

  // Apply a custom menu to the Daily Plan
  const handleApplyMenu = async (menuId: string, menuName: string) => {
    try {
      triggerToast("Đang áp dụng thực đơn làm kế hoạch...", "info");
      await applyMenuMutation.mutateAsync({ menuId, date: selectedDate });
      refetchDailyPlan();
      triggerToast(`Đã áp dụng "${menuName}" thành bản nháp ngày ${selectedDate}! 🥗`, "success");
      setActiveTab("daily");
    } catch (err: any) {
      triggerToast("Lỗi khi áp dụng thực đơn!", "error");
    }
  };

  // Synchronize planned meals to actual FoodLogs
  const handleSyncToDiary = async (mealTypeId: number) => {
    const mealName = mealInfoMap[mealTypeId].label;
    const items = getPlanItemsByMeal(mealTypeId).filter((p) => !p.isSynced);
    if (items.length === 0) {
      triggerToast(`${mealName} đã được đồng bộ vào nhật ký rồi!`, "warning");
      return;
    }

    showAlert(
      "Đồng bộ Nhật ký",
      `Bạn có muốn ghi nhận ${items.length} món ăn của ${mealName} vào Nhật ký dinh dưỡng thực tế không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng bộ ✓",
          onPress: async () => {
            try {
              triggerToast("Đang đồng bộ vào nhật ký...", "info");
              await syncToDiaryMutation.mutateAsync({ mealTypeId, date: selectedDate });

              // Sync globally shared Zustand store
              await fetchDiary(selectedDate);
              refetchDailyPlan();

              // Bounce animation for tick button
              const scaleAnim = getScaleAnim(mealTypeId);
              Animated.sequence([
                Animated.timing(scaleAnim, {
                  toValue: 1.3,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  friction: 3,
                  tension: 40,
                  useNativeDriver: true,
                }),
              ]).start();

              triggerToast(`✅ Đã đồng bộ ${mealName} vào Nhật ký thành công!`, "success");
            } catch (err) {
              triggerToast("Lỗi khi đồng bộ bữa ăn vào nhật ký", "error");
            }
          },
        },
      ]
    );
  };

  // Create menu handlers
  const openMealSelector = (food: FoodItem) => {
    setPendingFood(food);
    setQuantityGrams("100");
    setSelectedMealType(1);
    setMealSelectorVisible(true);
  };

  const addFoodToNewMenu = () => {
    if (!pendingFood) return;
    const grams = parseFloat(quantityGrams);
    if (isNaN(grams) || grams <= 0) {
      showAlert("Lỗi", "Số lượng grams phải lớn hơn 0");
      return;
    }

    setNewMenuFoods((prev) => [
      ...prev,
      {
        food: pendingFood,
        quantityG: grams,
        mealTypeId: selectedMealType,
      },
    ]);

    setMealSelectorVisible(false);
    setPendingFood(null);
    triggerToast(`Đã thêm ${pendingFood.name} vào mẫu thực đơn!`, "success");
  };

  const removeFoodFromNewMenu = (index: number) => {
    setNewMenuFoods((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveNewMenu = async () => {
    if (!newMenuName.trim()) {
      showAlert("Lỗi", "Vui lòng nhập tên thực đơn cá nhân");
      return;
    }
    if (newMenuFoods.length === 0) {
      showAlert("Lỗi", "Hãy thêm ít nhất một món ăn vào thực đơn");
      return;
    }

    try {
      triggerToast("Đang lưu thực đơn cá nhân...", "info");
      await createMenuMutation.mutateAsync({
        name: newMenuName,
        description: newMenuDesc,
        foods: newMenuFoods.map((item) => ({
          foodItemId: item.food.id,
          mealTypeId: item.mealTypeId,
          quantityG: item.quantityG,
        })),
      });

      setCreateModalVisible(false);
      setNewMenuName("");
      setNewMenuDesc("");
      setNewMenuFoods([]);
      triggerToast("Lưu thực đơn cá nhân thành công! 🎉", "success");
    } catch (err) {
      triggerToast("Lỗi khi lưu thực đơn cá nhân", "error");
    }
  };

  const handleDeleteMenu = async (id: string, name: string) => {
    showAlert("Xóa thực đơn", `Bạn có chắc chắn muốn xóa thực đơn "${name}" không?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuMutation.mutateAsync(id);
            triggerToast("Đã xóa thực đơn thành công", "success");
          } catch (err) {
            triggerToast("Lỗi khi xóa thực đơn", "error");
          }
        },
      },
    ]);
  };

  // ════════════════════════════════════════════════════
  // RENDERING
  // ════════════════════════════════════════════════════

  const renderDailyPlanTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Date Navigator */}
        <View style={styles.dateNavCard}>
          <Pressable onPress={handlePrevDay} style={styles.dateNavBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.dateInfoContainer}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.dateNavTitle}>{selectedDate}</Text>
          </View>
          <Pressable onPress={handleNextDay} style={styles.dateNavBtn}>
            <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Plan Macros Summary Box */}
        <SurfaceCard style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>📋 TỔNG HỢP DINH DƯỠNG KẾ HOẠCH</Text>
          <View style={styles.macrosContainer}>
            <View style={styles.macroCol}>
              <Text style={styles.macroValue}>{planTotals.calories}</Text>
              <Text style={styles.macroLabel}>Calo (kcal)</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroValue, { color: colors.protein }]}>{planTotals.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroValue, { color: colors.carbs }]}>{planTotals.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroCol}>
              <Text style={[styles.macroValue, { color: colors.fat }]}>{planTotals.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </SurfaceCard>

        {/* 4 Meal sections */}
        {isLoadingDailyPlan ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          [1, 2, 3, 4].map((mealTypeId) => {
            const mealItems = getPlanItemsByMeal(mealTypeId);
            const mInfo = mealInfoMap[mealTypeId];
            const allSynced = mealItems.length > 0 && mealItems.every((item) => item.isSynced);
            const scaleAnim = getScaleAnim(mealTypeId);

            return (
              <SurfaceCard key={mealTypeId} style={styles.mealSectionCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealHeaderLeft}>
                    <View style={[styles.mealBadge, { backgroundColor: mInfo.color + "20" }]}>
                      <Ionicons name={mInfo.icon as any} size={16} color={mInfo.color} />
                    </View>
                    <Text style={styles.mealTitle}>{mInfo.label}</Text>
                  </View>

                  {/* Sync (Tick) Button */}
                  {mealItems.length > 0 && (
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                      <Pressable
                        onPress={() => handleSyncToDiary(mealTypeId)}
                        disabled={allSynced}
                        style={[
                          styles.syncBtn,
                          allSynced ? styles.syncBtnDone : styles.syncBtnPending,
                        ]}
                      >
                        <Ionicons
                          name={allSynced ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={18}
                          color={allSynced ? "#FFFFFF" : mInfo.color}
                        />
                        <Text style={[styles.syncBtnText, allSynced && { color: "#FFFFFF" }]}>
                          {allSynced ? "Đã đồng bộ" : "Đồng bộ"}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  )}
                </View>

                {/* Planned Foods list */}
                {mealItems.length === 0 ? (
                  <Text style={styles.emptyMealText}>Không có kế hoạch ăn uống. Sang tab Tự tạo để áp dụng.</Text>
                ) : (
                  <View style={styles.planItemsList}>
                    {mealItems.map((item) => (
                      <View key={item.id} style={[styles.planItemRow, item.isSynced && styles.planItemSynced]}>
                        <Ionicons
                          name={item.isSynced ? "checkmark-circle" : "ellipse-outline"}
                          size={16}
                          color={item.isSynced ? "#4CAF50" : colors.textMuted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.planItemName, item.isSynced && styles.textThrough]}>
                            {item.foodNameVi}
                          </Text>
                          <Text style={styles.planItemGrams}>
                            {item.quantityG}g • {Math.round(item.caloriesKcal)} kcal
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </SurfaceCard>
            );
          })
        )}
      </View>
    );
  };

  const renderSavedPlansTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Create CTA Button */}
        <GradientButton
          label="Tạo mẫu thực đơn mới +"
          onPress={() => setCreateModalVisible(true)}
        />

        {isLoadingMyPlans ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : myPlans.length === 0 ? (
          <SurfaceCard style={styles.emptySavedCard}>
            <Ionicons name="list" size={48} color={colors.textMuted} />
            <Text style={styles.emptySavedText}>Chưa có mẫu thực đơn tự tạo nào.</Text>
            <Text style={styles.emptySavedSub}>Nhấp nút phía trên để bắt đầu lập thực đơn cá nhân của riêng bạn!</Text>
          </SurfaceCard>
        ) : (
          myPlans.map((menu) => (
            <SurfaceCard key={menu.id} style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuName}>{menu.name}</Text>
                  {menu.description && <Text style={styles.menuDesc}>{menu.description}</Text>}
                  <Text style={styles.menuCals}>{Math.round(menu.totalCalories)} kcal nạp</Text>
                </View>

                {/* Actions */}
                <View style={styles.menuActions}>
                  <Pressable
                    onPress={() => handleApplyMenu(menu.id, menu.name)}
                    style={styles.applyBtn}
                  >
                    <Ionicons name="checkbox-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.applyBtnText}>Áp dụng</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteMenu(menu.id, menu.name)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF5252" />
                  </Pressable>
                </View>
              </View>

              {/* Display grouped items inside card */}
              <View style={styles.menuFoodsPreview}>
                {[1, 2, 3, 4].map((mealTypeId) => {
                  const mFoods = menu.foods.filter((f) => f.mealTypeId === mealTypeId);
                  if (mFoods.length === 0) return null;

                  return (
                    <View key={mealTypeId} style={styles.previewMealSection}>
                      <Text style={[styles.previewMealLabel, { color: mealInfoMap[mealTypeId].color }]}>
                        {mealInfoMap[mealTypeId].label}
                      </Text>
                      {mFoods.map((mf, index) => (
                        <Text key={index} style={styles.previewFoodText}>
                          • {mf.nameVi} ({mf.quantityG}g)
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            </SurfaceCard>
          ))
        )}
      </View>
    );
  };


  const renderDiscoverTab = () => {
    return (
      <View style={styles.tabContent}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 16 }}>
          {["2200 Cal", "2200-2400 Cal", "2400-2600 Cal", "Giảm cân", "Tăng cơ"].map((filter, i) => (
            <View key={i} style={{ backgroundColor: i === 0 ? "#A56CFF" : colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: i === 0 ? 0 : 1, borderColor: colors.borderSoft }}>
              <Text style={{ color: i === 0 ? "#fff" : colors.textPrimary, fontWeight: "600" }}>{filter}</Text>
            </View>
          ))}
        </ScrollView>
        <HeroPlanCard 
          title="Meal plan chuẩn gym: Tăng cơ, Giảm mỡ, Sống khỏe"
          subtitle="4 bữa/ngày"
          calories="2400 - 2600 cal / ngày"
          badges={["Ít tinh bột", "Tăng đạm"]}
          imageUrl="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1000&auto=format&fit=crop"
          onPress={() => router.push("/menu-detail?menuId=discover_1")}
        />
        <HeroPlanCard 
          title="Eat Clean dành cho dân văn phòng bận rộn"
          subtitle="4 bữa/ngày"
          calories="1200 - 1400 cal / ngày"
          badges={["Eat Clean", "Nhanh gọn"]}
          imageUrl="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop"
          onPress={() => router.push("/menu-detail?menuId=discover_2")}
        />
        <HeroPlanCard 
          title="Thực đơn Keto giảm cân cấp tốc 7 ngày"
          subtitle="3 bữa/ngày"
          calories="1000 - 1200 cal / ngày"
          badges={["Keto", "Ít carb"]}
          imageUrl="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop"
          onPress={() => router.push("/menu-detail?menuId=discover_3")}
        />
      </View>
    );
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>
            Thực đơn Cá nhân
          </Text>
          <Text style={styles.description}>
            Lập kế hoạch ăn uống dinh dưỡng trước và đồng bộ vào Nhật ký tiêu thụ hàng ngày dễ dàng.
          </Text>
        </View>

        <SegmentedPillTabs activeKey={activeTab} items={tabs} onChange={setActiveTab} />

        {activeTab === "daily" && renderDailyPlanTab()}
        {activeTab === "discover" && renderDiscoverTab()}
        {activeTab === "saved" && renderSavedPlansTab()}

        {/* Floating Toast Alert */}
        <Toast
          visible={showToast}
          message={toastMessage}
          type={toastType}
          onHide={() => setShowToast(false)}
        />

        {/* ════════════════════════════════════════════════════
            MODAL: CREATE MENU
            ════════════════════════════════════════════════════ */}
        <Modal
          visible={createModalVisible}
          animationType="slide"
          onRequestClose={() => setCreateModalVisible(false)}
        >
          <SafeScreen scrollable>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo Thực Đơn Mới</Text>
                <Pressable onPress={() => setCreateModalVisible(false)}>
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </Pressable>
              </View>

              {/* Form details */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Tên thực đơn *</Text>
                <TextInput
                  placeholder="Ví dụ: Thực đơn Low-carb Thứ Hai"
                  placeholderTextColor={colors.textMuted}
                  value={newMenuName}
                  onChangeText={setNewMenuName}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Mô tả thực đơn</Text>
                <TextInput
                  placeholder="Mô tả mục tiêu dinh dưỡng..."
                  placeholderTextColor={colors.textMuted}
                  value={newMenuDesc}
                  onChangeText={setNewMenuDesc}
                  style={styles.modalInput}
                  multiline
                />
              </View>

              {/* Selected foods grouped in creating list */}
              <SurfaceCard style={styles.foodsListCard}>
                <Text style={styles.foodsListCardTitle}>🥗 Món Ăn Đã Chọn</Text>
                {newMenuFoods.length === 0 ? (
                  <Text style={styles.emptyFoodsListText}>Chưa chọn món ăn nào. Nhấp dấu cộng dưới danh sách để thêm.</Text>
                ) : (
                  newMenuFoods.map((item, index) => (
                    <View key={index} style={styles.selectedFoodRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedFoodName}>{item.food.name}</Text>
                        <Text style={styles.selectedFoodSub}>
                          {mealInfoMap[item.mealTypeId].label} • {item.quantityG}g
                        </Text>
                      </View>
                      <Pressable onPress={() => removeFoodFromNewMenu(index)}>
                        <Ionicons name="close-circle" size={22} color="#FF5252" />
                      </Pressable>
                    </View>
                  ))
                )}
              </SurfaceCard>

              {/* Search & add from database section */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Chọn món ăn từ Cơ sở dữ liệu</Text>
                <View style={styles.searchBarRow}>
                  <Ionicons name="search" size={18} color={colors.textMuted} />
                  <TextInput
                    placeholder="Tìm kiếm món ăn..."
                    placeholderTextColor={colors.textMuted}
                    value={foodSearchQuery}
                    onChangeText={setFoodSearchQuery}
                    style={styles.searchBarInput}
                  />
                </View>

                {isLoadingFoods ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.md }} />
                ) : (
                  <ScrollView style={styles.searchFoodsList} nestedScrollEnabled>
                    {filteredFoods.slice(0, 5).map((food) => (
                      <Pressable
                        key={food.id}
                        onPress={() => openMealSelector(food)}
                        style={styles.searchFoodItem}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.searchFoodName}>{food.name}</Text>
                          <Text style={styles.searchFoodCals}>{food.calories} kcal / {food.servingSize}g</Text>
                        </View>
                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                      </Pressable>
                    ))}
                    {filteredFoods.length === 0 && (
                      <Text style={styles.emptySearchText}>Không tìm thấy món ăn nào khớp.</Text>
                    )}
                  </ScrollView>
                )}
              </View>

              {/* Save CTA */}
              <View style={{ marginTop: spacing.lg }}>
                <GradientButton
                  label="Lưu Mẫu Thực Đơn"
                  onPress={handleSaveNewMenu}
                />
              </View>
            </View>
          </SafeScreen>
        </Modal>

        {/* ════════════════════════════════════════════════════
            MODAL: ADD FOOD SELECT DETAILS (MEAL & QUANTITY)
            ════════════════════════════════════════════════════ */}
        <Modal
          visible={mealSelectorVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMealSelectorVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>Thiết Lập Chi Tiết Món Ăn</Text>
              {pendingFood && <Text style={styles.overlaySubtitle}>{pendingFood.name}</Text>}

              <View style={styles.overlayFormGroup}>
                <Text style={styles.overlayFieldLabel}>Chọn Bữa Ăn:</Text>
                <View style={styles.mealSelectorRow}>
                  {[1, 2, 3, 4].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setSelectedMealType(type)}
                      style={[
                        styles.mealSelectChip,
                        selectedMealType === type && { backgroundColor: mealInfoMap[type].color },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mealSelectText,
                          selectedMealType === type && { color: "#FFFFFF" },
                        ]}
                      >
                        {mealInfoMap[type].label.split(" ")[1]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.overlayFormGroup}>
                <Text style={styles.overlayFieldLabel}>Định lượng (Grams):</Text>
                <TextInput
                  keyboardType="numeric"
                  value={quantityGrams}
                  onChangeText={setQuantityGrams}
                  style={styles.overlayInput}
                />
              </View>

              <View style={styles.overlayActions}>
                <Pressable
                  onPress={() => setMealSelectorVisible(false)}
                  style={styles.overlayBtnCancel}
                >
                  <Text style={styles.overlayCancelText}>Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={addFoodToNewMenu}
                  style={styles.overlayBtnConfirm}
                >
                  <Text style={styles.overlayConfirmText}>Thêm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: {
      gap: spacing.lg,
      paddingVertical: spacing.md,
    },
    header: {
      gap: spacing.xs,
    },
    title: {
      ...typography.display,
      color: colors.textPrimary,
    },
    titleCompact: {
      ...typography.h1,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
    },
    tabContent: {
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    // Date Navigator styles
    dateNavCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    dateNavBtn: {
      padding: spacing.xs,
    },
    dateInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    dateNavTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    // Summary Card
    summaryCard: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    summaryCardTitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: "bold",
    },
    macrosContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    macroCol: {
      alignItems: "center",
    },
    macroValue: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    macroLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    // Meal Sections
    mealSectionCard: {
      padding: spacing.md,
      gap: spacing.md,
    },
    mealHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
      paddingBottom: spacing.sm,
    },
    mealHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    mealBadge: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    mealTitle: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    syncBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    syncBtnPending: {
      borderColor: colors.borderSoft,
      backgroundColor: colors.surfaceAlt,
    },
    syncBtnDone: {
      borderColor: "#4CAF50",
      backgroundColor: "#4CAF50",
    },
    syncBtnText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    emptyMealText: {
      ...typography.body,
      color: colors.textMuted,
      fontSize: 13,
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
    planItemsList: {
      gap: spacing.sm,
    },
    planItemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
    },
    planItemSynced: {
      opacity: 0.6,
    },
    planItemName: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
      fontSize: 14,
    },
    planItemGrams: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    textThrough: {
      textDecorationLine: "line-through",
      color: colors.textMuted,
    },
    // Custom Menu Saved Plans
    emptySavedCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptySavedText: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
    },
    emptySavedSub: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: spacing.xl,
    },
    menuCard: {
      padding: spacing.md,
      gap: spacing.md,
    },
    menuHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    menuName: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    menuDesc: {
      ...typography.body,
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
    },
    menuCals: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "bold",
      marginTop: 4,
    },
    menuActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    applyBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    applyBtnText: {
      ...typography.caption,
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    deleteBtn: {
      padding: spacing.xs,
    },
    menuFoodsPreview: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    previewMealSection: {
      marginBottom: 4,
    },
    previewMealLabel: {
      ...typography.caption,
      fontWeight: "bold",
      fontSize: 12,
    },
    previewFoodText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      marginLeft: spacing.sm,
    },
    // Modals
    modalContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
      paddingBottom: spacing.md,
    },
    modalTitle: {
      ...typography.h2,
      color: colors.textPrimary,
    },
    formGroup: {
      gap: spacing.xs,
    },
    fieldLabel: {
      ...typography.bodyStrong,
      color: colors.textSecondary,
      fontSize: 14,
    },
    modalInput: {
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: radius.sm,
      padding: spacing.sm,
      ...typography.body,
      fontSize: 14,
    },
    foodsListCard: {
      padding: spacing.md,
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
    },
    foodsListCardTitle: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
    },
    emptyFoodsListText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.sm,
    },
    selectedFoodRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    selectedFoodName: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
      fontSize: 13,
    },
    selectedFoodSub: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    searchBarRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    searchBarInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      fontSize: 14,
    },
    searchFoodsList: {
      maxHeight: 180,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing.xs,
    },
    searchFoodItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    searchFoodName: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
      fontSize: 13,
    },
    searchFoodCals: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    emptySearchText: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: "center",
      paddingVertical: spacing.md,
    },
    // Overlay selector
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },
    overlayCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      gap: spacing.md,
      width: "100%",
      maxWidth: 340,
    },
    overlayTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
    },
    overlaySubtitle: {
      ...typography.bodyStrong,
      color: colors.primary,
      textAlign: "center",
      fontSize: 14,
    },
    overlayFormGroup: {
      gap: spacing.xs,
    },
    overlayFieldLabel: {
      ...typography.bodyStrong,
      color: colors.textSecondary,
      fontSize: 13,
    },
    mealSelectorRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 4,
      marginTop: 4,
    },
    mealSelectChip: {
      flex: 1,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    mealSelectText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "bold",
    },
    overlayInput: {
      backgroundColor: colors.surfaceAlt,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: radius.sm,
      padding: spacing.sm,
      ...typography.body,
      fontSize: 14,
    },
    overlayActions: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    overlayBtnCancel: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
    },
    overlayBtnConfirm: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    overlayCancelText: {
      ...typography.bodyStrong,
      color: colors.textSecondary,
    },
    overlayConfirmText: {
      ...typography.bodyStrong,
      color: "#FFFFFF",
    },
  });
