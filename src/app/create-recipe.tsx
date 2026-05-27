import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { foodService, FoodItemDto } from "@/services/foodService";
import { Toast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/constants/i18n";

interface RecipeComponentState {
  childFoodId: string;
  nameVi: string;
  quantityG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  servingSizeG: number;
  imageUrl?: string | null;
}

export default function CreateRecipeScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const categories = [
    { id: 1, name: t.categories.riceAndStickyRice },
    { id: 2, name: t.categories.noodleSoup },
    { id: 3, name: t.categories.breadAndPastries },
    { id: 4, name: t.categories.drinks },
    { id: 5, name: t.categories.packagedFood },
    { id: 6, name: t.categories.vegetablesAndFruits },
    { id: 7, name: t.categories.meatAndSeafood },
    { id: 10, name: t.categories.other }
  ];

  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(10);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Danh sách các nguyên liệu trong công thức
  const [components, setComponents] = useState<RecipeComponentState[]>([]);

  // Modals quản lý thêm nguyên liệu
  const [isFoodSelectorVisible, setIsFoodSelectorVisible] = useState(false);
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);

  // States tìm kiếm món ăn
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItemDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State nguyên liệu đang được chọn để nhập Gram
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] = useState<FoodItemDto | null>(null);
  const [quantityInput, setQuantityInput] = useState("100");

  // Show dinh dưỡng chi tiết
  const [showNutritionDetail, setShowNutritionDetail] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToastMsg = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Tải danh sách món ăn mặc định khi mở modal selector
  const loadDefaultFoods = async () => {
    setIsSearching(true);
    try {
      const res = await foodService.getAllFoods(1, 30);
      setSearchResults(res);
    } catch (err) {
      console.error("Lỗi tải món ăn mặc định:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isFoodSelectorVisible) {
      loadDefaultFoods();
    }
  }, [isFoodSelectorVisible]);

  // Xử lý tìm kiếm nguyên liệu
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadDefaultFoods();
      return;
    }
    setIsSearching(true);
    try {
      const res = await foodService.searchFoods({ q: query });
      setSearchResults(res.items);
    } catch (err) {
      console.error("Lỗi tìm kiếm nguyên liệu:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Chọn nguyên liệu
  const handleSelectFood = (food: FoodItemDto) => {
    setSelectedFoodForQuantity(food);
    setQuantityInput(String(food.servingSizeG || 100));
    setIsQuantityModalVisible(true);
  };

  // Xác nhận thêm nguyên liệu với số Gram nhất định
  const handleConfirmQuantity = () => {
    if (!selectedFoodForQuantity) return;
    const qty = parseFloat(quantityInput);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert(t.createRecipe.inputWeightError, t.createRecipe.weightMustBePositive);
      return;
    }

    // Kiểm tra xem nguyên liệu này đã có trong danh sách chưa
    const existingIndex = components.findIndex(c => c.childFoodId === selectedFoodForQuantity.id);
    const newComponent: RecipeComponentState = {
      childFoodId: selectedFoodForQuantity.id,
      nameVi: selectedFoodForQuantity.nameVi,
      quantityG: qty,
      caloriesKcal: selectedFoodForQuantity.caloriesKcal || 0,
      proteinG: selectedFoodForQuantity.proteinG || 0,
      carbsG: selectedFoodForQuantity.carbsG || 0,
      fatG: selectedFoodForQuantity.fatG || 0,
      fiberG: selectedFoodForQuantity.fiberG || 0,
      sugarG: selectedFoodForQuantity.sugarG || 0,
      sodiumMg: selectedFoodForQuantity.sodiumMg || 0,
      servingSizeG: selectedFoodForQuantity.servingSizeG || 100,
      imageUrl: selectedFoodForQuantity.imageUrl,
    };

    if (existingIndex >= 0) {
      // Cập nhật khối lượng nếu đã tồn tại
      const updated = [...components];
      updated[existingIndex].quantityG += qty;
      setComponents(updated);
    } else {
      // Thêm mới
      setComponents([...components, newComponent]);
    }

    setIsQuantityModalVisible(false);
    setIsFoodSelectorVisible(false);
    setSelectedFoodForQuantity(null);
    showToastMsg(t.createRecipe.ingredientAdded, "success");
  };

  // Xóa nguyên liệu khỏi danh sách
  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.childFoodId !== id));
    showToastMsg(t.createRecipe.ingredientDeleted, "success");
  };

  // Tính toán tổng các chỉ số dinh dưỡng dựa trên khối lượng nguyên liệu
  const calculateTotals = () => {
    let totalCal = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalWeight = 0;

    components.forEach((c) => {
      const ratio = c.quantityG / c.servingSizeG;
      totalCal += c.caloriesKcal * ratio;
      totalProt += (c.proteinG || 0) * ratio;
      totalCarbs += (c.carbsG || 0) * ratio;
      totalFat += (c.fatG || 0) * ratio;
      totalFiber += (c.fiberG || 0) * ratio;
      totalSugar += (c.sugarG || 0) * ratio;
      totalSodium += (c.sodiumMg || 0) * ratio;
      totalWeight += c.quantityG;
    });

    return {
      calories: Math.round(totalCal),
      protein: parseFloat(totalProt.toFixed(1)),
      carbs: parseFloat(totalCarbs.toFixed(1)),
      fat: parseFloat(totalFat.toFixed(1)),
      fiber: parseFloat(totalFiber.toFixed(1)),
      sugar: parseFloat(totalSugar.toFixed(1)),
      sodium: Math.round(totalSodium),
      weight: totalWeight,
    };
  };

  const totals = calculateTotals();

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t.createRecipe.permissionTitle, t.createRecipe.permissionMsg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);
      showToastMsg(t.createRecipe.pickImageError, "error");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToastMsg(t.createRecipe.nameRequired, "error");
      return;
    }
    if (components.length === 0) {
      showToastMsg(t.createRecipe.ingredientRequired, "error");
      return;
    }

    setIsSaving(true);
    try {
      // Chuẩn bị ảnh cho Web / Mobile
      let imageFile: any = undefined;
      if (imageUri) {
        const filename = imageUri.split("/").pop() || "recipe.jpg";
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        if (type === "image/jpg") type = "image/jpeg";

        imageFile = {
          uri: imageUri,
          name: filename,
          type,
        };
      }

      // Gọi API tạo công thức
      await foodService.createRecipe({
        nameVi: name.trim(),
        categoryId: selectedCategoryId,
        servingUnitVi: "phần",
        image: imageFile,
        components: components.map(c => ({
          child_food_id: c.childFoodId,
          quantity_g: c.quantityG,
        })),
      });

      // Invalidate cache to refetch updated food items list immediately
      queryClient.invalidateQueries({ queryKey: ["food"] });

      showToastMsg(t.createRecipe.saveSuccess, "success");
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi tạo công thức:", JSON.stringify(error?.response?.data || error.message));
      const responseData = error?.response?.data;
      const validationErrors = responseData?.errors ? JSON.stringify(responseData.errors) : "";
      const errMsg = responseData?.message || error?.message || t.createRecipe.saveError;
      showToastMsg(errMsg + " " + validationErrors, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.name || t.categories.other;
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t.createRecipe.title}</Text>
          </View>

          <Pressable hitSlop={12} style={styles.headerBtn}>
            <Ionicons color={colors.textPrimary} name="information-circle-outline" size={24} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Section: Hình ảnh */}
          <Text style={styles.sectionTitle}>{t.createRecipe.image}</Text>
          <View style={styles.imageSection}>
            <View style={styles.imageFrame}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderFrame}>
                  <MaterialCommunityIcons name="bowl-mix" size={64} color="#a78bfa" />
                </View>
              )}
            </View>
            <Pressable onPress={handlePickImage} style={styles.uploadBtn}>
              <Ionicons name="add" size={18} color="#a78bfa" />
              <Text style={styles.uploadBtnText}>{t.createRecipe.uploadBtn}</Text>
            </Pressable>
          </View>

          {/* Form nhập thông tin */}
          <View style={styles.formContainer}>
            {/* Tên món ăn */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createRecipe.recipeName}</Text>
              <TextInput
                onChangeText={setName}
                placeholder={t.createRecipe.enterRecipeNamePlaceholder}
                placeholderTextColor={colors.textMuted}
                style={styles.textInput}
                value={name}
              />
            </View>

            {/* Danh mục */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createRecipe.category}</Text>
              <Pressable
                onPress={() => setIsCategoryModalVisible(true)}
                style={styles.selectRow}
              >
                <Text style={styles.selectValue}>{getCategoryName(selectedCategoryId)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Dinh dưỡng tổng quan */}
          <Text style={styles.sectionTitle}>{t.createRecipe.nutritionOverview(totals.weight)}</Text>
          <View style={styles.statsContainer}>
            {/* Calories Circle */}
            <View style={styles.detailCircle}>
              <Text style={styles.detailCircleVal}>{totals.calories}</Text>
              <Text style={styles.detailCircleLabel}>Cal</Text>
            </View>

            {/* Macro columns */}
            <View style={styles.macrosRow}>
              {/* Protein */}
              <View style={styles.macroCol}>
                <View style={[styles.macroBadge, { backgroundColor: "rgba(255, 92, 92, 0.2)" }]}>
                  <Text style={[styles.macroBadgeText, { color: "#ff5c5c" }]}>{t.createRecipe.protein}</Text>
                </View>
                <Text style={styles.macroVal}>{totals.protein} g</Text>
                <View style={styles.macroLabelRow}>
                  <Ionicons color="#ff5c5c" name="flash" size={10} />
                  <Text style={styles.macroLabel}>{t.createRecipe.proteinLabel}</Text>
                </View>
              </View>

              {/* Carbs */}
              <View style={styles.macroCol}>
                <View style={[styles.macroBadge, { backgroundColor: "rgba(62, 166, 255, 0.2)" }]}>
                  <Text style={[styles.macroBadgeText, { color: "#3ea6ff" }]}>Carb</Text>
                </View>
                <Text style={styles.macroVal}>{totals.carbs} g</Text>
                <View style={styles.macroLabelRow}>
                  <Ionicons color="#3ea6ff" name="leaf" size={10} />
                  <Text style={styles.macroLabel}>{t.createRecipe.carbsLabel}</Text>
                </View>
              </View>

              {/* Fat */}
              <View style={styles.macroCol}>
                <View style={[styles.macroBadge, { backgroundColor: "rgba(255, 199, 44, 0.2)" }]}>
                  <Text style={[styles.macroBadgeText, { color: "#ffc72c" }]}>{t.createRecipe.fat}</Text>
                </View>
                <Text style={styles.macroVal}>{totals.fat} g</Text>
                <View style={styles.macroLabelRow}>
                  <Ionicons color="#ffc72c" name="water" size={10} />
                  <Text style={styles.macroLabel}>{t.createRecipe.fatLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nutritional Details Collapsible */}
          <Pressable
            onPress={() => setShowNutritionDetail(!showNutritionDetail)}
            style={styles.dropdownBtn}
          >
            <Text style={styles.dropdownBtnText}>
              {showNutritionDetail ? t.createRecipe.hideNutrition : t.createRecipe.showNutrition}
            </Text>
            <Ionicons color={colors.textSecondary} name={showNutritionDetail ? "chevron-up" : "chevron-down"} size={16} />
          </Pressable>

          {showNutritionDetail && (
            <View style={styles.dropdownContent}>
              <View style={styles.nutritionRowDetail}>
                <Text style={styles.nutritionLabelDetail}>{t.createRecipe.fiber}</Text>
                <Text style={styles.nutritionValDetail}>{totals.fiber} g</Text>
              </View>
              <View style={styles.nutritionRowDetail}>
                <Text style={styles.nutritionLabelDetail}>{t.createRecipe.sugar}</Text>
                <Text style={styles.nutritionValDetail}>{totals.sugar} g</Text>
              </View>
              <View style={styles.nutritionRowDetail}>
                <Text style={styles.nutritionLabelDetail}>{t.createRecipe.sodium}</Text>
                <Text style={styles.nutritionValDetail}>{totals.sodium} mg</Text>
              </View>
            </View>
          )}

          {/* Nguyên liệu của công thức này */}
          <View style={styles.ingredientsSection}>
            <Text style={styles.ingredientsTitle}>{t.createRecipe.ingredientsTitle}</Text>
            <Text style={styles.ingredientsSubtitle}>{t.createRecipe.ingredientsSubtitle}</Text>

            {/* Danh sách nguyên liệu đã thêm */}
            {components.map((comp) => (
              <View key={comp.childFoodId} style={styles.componentCard}>
                {comp.imageUrl ? (
                  <Image source={{ uri: comp.imageUrl }} style={styles.componentImg} />
                ) : (
                  <View style={styles.componentImgPlaceholder}>
                    <MaterialCommunityIcons name="bowl-mix" size={20} color={colors.textSecondary} />
                  </View>
                )}
                <View style={styles.componentInfo}>
                  <Text style={styles.componentName} numberOfLines={1}>{comp.nameVi}</Text>
                  <Text style={styles.componentSub}>
                    {comp.quantityG}g • {Math.round(comp.caloriesKcal * (comp.quantityG / comp.servingSizeG))} cal
                  </Text>
                </View>
                <Pressable hitSlop={8} onPress={() => handleRemoveComponent(comp.childFoodId)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))}

            <Pressable onPress={() => setIsFoodSelectorVisible(true)} style={styles.addIngredientBtn}>
              <Ionicons name="add" size={18} color="#a78bfa" />
              <Text style={styles.addIngredientText}>{t.createRecipe.addIngredient}</Text>
            </Pressable>
          </View>

        </ScrollView>

        {/* Footer Save Button */}
        <View style={styles.footer}>
          <Pressable
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.saveBtn, (!name.trim() || components.length === 0) && styles.saveBtnDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>{t.createRecipe.saveRecipe}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Modal chọn Danh mục */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createRecipe.selectCategory}</Text>
              <Pressable hitSlop={8} onPress={() => setIsCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setIsCategoryModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedCategoryId === cat.id && styles.modalItemTextActive]}>
                    {cat.name}
                  </Text>
                  {selectedCategoryId === cat.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Tìm kiếm/Chọn nguyên liệu */}
      <Modal
        visible={isFoodSelectorVisible}
        animationType="slide"
        onRequestClose={() => setIsFoodSelectorVisible(false)}
      >
        <SafeAreaView style={styles.selectorContainer}>
          {/* Header */}
          <View style={styles.selectorHeader}>
            <Pressable hitSlop={12} onPress={() => setIsFoodSelectorVisible(false)} style={styles.headerBtn}>
              <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
            </Pressable>
            <Text style={styles.selectorHeaderTitle}>{t.createRecipe.searchFood}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Box */}
          <View style={styles.searchBoxContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={t.createRecipe.enterIngredientNamePlaceholder}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => handleSearch("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </View>

          <Text style={styles.resultsTitle}>{t.createRecipe.searchResults}</Text>

          {/* List món ăn kết quả */}
          {isSearching ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={{ color: colors.textMuted }}>{t.createRecipe.noFoodsFound}</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={styles.searchCard}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.searchCardImg} />
                  ) : (
                    <View style={styles.searchCardImgPlaceholder}>
                      <MaterialCommunityIcons name="bowl-mix" size={28} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.searchCardInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={styles.searchCardName} numberOfLines={1}>{item.nameVi}</Text>
                      {item.source === 1 && (
                        <Ionicons name="checkmark-circle" size={14} color="#3ea6ff" />
                      )}
                    </View>
                    <Text style={styles.searchCardSub}>
                      {item.servingUnitVi} • {item.servingSizeG}g • {item.caloriesKcal} cal
                    </Text>
                    <View style={styles.searchCardMacros}>
                      <Text style={[styles.macroLabelText, { color: "#ff5c5c" }]}>
                        ⚡ {item.proteinG || 0}g
                      </Text>
                      <Text style={[styles.macroLabelText, { color: "#3ea6ff" }]}>
                        🌿 {item.carbsG || 0}g
                      </Text>
                      <Text style={[styles.macroLabelText, { color: "#ffc72c" }]}>
                        💧 {item.fatG || 0}g
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleSelectFood(item)} style={styles.addCardBtn}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </Pressable>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal nhỏ Nhập gram khối lượng */}
      <Modal
        visible={isQuantityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsQuantityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qtyModalContent}>
            <Text style={styles.qtyModalTitle}>{t.createRecipe.enterWeight}</Text>
            <Text style={styles.qtyModalSubtitle}>
              {t.createRecipe.addToRecipe(selectedFoodForQuantity?.nameVi || "")}
            </Text>

            <View style={styles.qtyInputBox}>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={quantityInput}
                onChangeText={setQuantityInput}
                autoFocus
              />
              <Text style={styles.qtyUnit}>gram</Text>
            </View>

            <View style={styles.qtyActionRow}>
              <Pressable
                onPress={() => {
                  setIsQuantityModalVisible(false);
                  setSelectedFoodForQuantity(null);
                }}
                style={[styles.qtyBtn, { backgroundColor: colors.borderSoft }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: "600" }}>{t.common.cancel}</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmQuantity}
                style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{t.common.confirm}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Alert */}
      <Toast
        message={toastMessage}
        onHide={() => setToastVisible(false)}
        type={toastType}
        visible={toastVisible}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  imageSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  imageFrame: {
    width: 130,
    height: 130,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderFrame: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  uploadBtnText: {
    color: "#a78bfa",
    fontWeight: "600",
    fontSize: 13,
  },
  formContainer: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 2,
    marginLeft: spacing.lg,
    textAlign: "right",
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  selectValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  detailCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#4a3c6b",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  detailCircleVal: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  detailCircleLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  macrosRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: spacing.lg,
  },
  macroCol: {
    alignItems: "center",
    gap: 4,
  },
  macroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  macroBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  macroVal: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  macroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  macroLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: "600",
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  dropdownBtnText: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownContent: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    gap: spacing.sm,
  },
  nutritionRowDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  nutritionLabelDetail: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  nutritionValDetail: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  ingredientsSection: {
    marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  ingredientsTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  ingredientsSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  addIngredientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#4a3c6b",
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  addIngredientText: {
    color: "#a78bfa",
    fontWeight: "600",
    fontSize: 14,
  },
  componentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: "#2d2454",
  },
  componentImg: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  componentImgPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  componentSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: colors.primaryStrong,
    opacity: 0.7,
    elevation: 0,
  },
  saveBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalList: {
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalItemText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  modalItemTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  // Selector Modal
  selectorContainer: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  selectorHeaderTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  searchBoxContainer: {
    padding: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  resultsTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchCardImg: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  searchCardImgPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  searchCardInfo: {
    flex: 1,
  },
  searchCardName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
    maxWidth: "85%",
  },
  searchCardSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  searchCardMacros: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  macroLabelText: {
    fontSize: 11,
    fontWeight: "600",
  },
  addCardBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  // Qty modal
  qtyModalContent: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    width: "85%",
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: "center",
  },
  qtyModalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  qtyModalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  qtyInputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    width: 140,
    paddingBottom: 4,
    marginBottom: spacing.xl,
  },
  qtyInput: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 6,
    width: 80,
  },
  qtyUnit: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  qtyActionRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  qtyBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
