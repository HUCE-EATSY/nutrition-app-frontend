import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "@/constants";
import { foodService } from "@/services/foodService";

/** Alias để khớp kiểu dữ liệu */
interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  imageUrl: string | null;
  description?: string | null;
}

interface FoodDetailModalProps {
  visible: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onAdd: (food: FoodItem, grams: number) => void;
  initialGrams?: number;
  submitButtonText?: string;
  headerTitle?: string;
}

/** Tiện ích lấy danh sách nguyên liệu trực quan dựa vào tên món ăn để UI giống hệt screenshot */
function getMockIngredients(foodName: string): string[] {
  const name = foodName.toLowerCase();
  if (name.includes("salad") || name.includes("rau") || name.includes("bơ")) {
    return ["Rau xà lách", "Quả bơ", "Tôm sú, sống", "Củ hành tím", "Dầu ô liu", "Nước cốt chanh vàng"];
  }
  if (name.includes("cơm") || name.includes("xôi")) {
    return ["Gạo tẻ thơm", "Nước lọc", "Hành phi", "Mỡ hành", "Muối tinh"];
  }
  if (name.includes("phở") || name.includes("bún")) {
    return ["Bánh phở tươi", "Thịt bò tái", "Nước dùng bò", "Hành lá", "Rau mùi", "Chanh ớt"];
  }
  if (name.includes("bánh mì") || name.includes("bánh")) {
    return ["Bột mì đa dụng", "Men nở", "Nước ấm", "Trứng gà", "Đường kính", "Bơ nhạt"];
  }
  if (name.includes("thịt") || name.includes("hải sản") || name.includes("tôm") || name.includes("cá")) {
    return ["Thịt tươi sống", "Hành tỏi", "Tiêu đen", "Nước mắm", "Dầu hào"];
  }
  if (name.includes("đồ uống") || name.includes("trà") || name.includes("sữa")) {
    return ["Trà lài", "Sữa đặc", "Đường nước", "Đá viên", "Trân châu"];
  }
  return ["Nguyên liệu tươi", "Gia vị thảo mộc", "Dầu oliu", "Muối hồng"];
}

export function FoodDetailModal({
  visible,
  food,
  onClose,
  onAdd,
  initialGrams,
  submitButtonText,
  headerTitle,
}: FoodDetailModalProps) {
  const [customServings, setCustomServings] = useState("1");
  const [showNutritionDetail, setShowNutritionDetail] = useState(false);
  const [components, setComponents] = useState<any[]>([]);
  const [showComponents, setShowComponents] = useState(true);
  const [isComponentsLoading, setIsComponentsLoading] = useState(false);

  useEffect(() => {
    if (food) {
      if (initialGrams && initialGrams > 0) {
        setCustomServings(String(Math.round((initialGrams / food.servingSize) * 100) / 100));
      } else {
        setCustomServings("1");
      }
      setComponents([]);
      setIsComponentsLoading(true);

      foodService.getFoodComponents(food.id)
        .then((res) => {
          console.log("Danh sách nguyên liệu lấy từ API:", res);
          setComponents(res || []);
        })
        .catch((err) => {
          console.error("Lỗi khi tải components món ăn:", err);
          setComponents([]);
        })
        .finally(() => {
          setIsComponentsLoading(false);
        });
    }
  }, [food, initialGrams]);

  if (!food) return null;

  const currentServings = parseFloat(customServings) || 1;
  const ratio = currentServings;
  const currentGrams = food.servingSize * ratio;

  const adjustedCalories = Math.round(food.calories * ratio);
  const adjustedProtein = food.protein * ratio;
  const adjustedCarbs = food.carbs * ratio;
  const adjustedFat = food.fat * ratio;

  const macroTotal = (adjustedProtein * 4) + (adjustedCarbs * 4) + (adjustedFat * 9);
  const pPercent = macroTotal > 0 ? Math.round((adjustedProtein * 4 / macroTotal) * 100) : 0;
  const cPercent = macroTotal > 0 ? Math.round((adjustedCarbs * 4 / macroTotal) * 100) : 0;
  const fPercent = macroTotal > 0 ? (100 - pPercent - cPercent) : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.detailOverlay}>
        <SafeAreaView style={styles.detailContent}>
          {/* Header */}
          <View style={styles.detailHeader}>
            <Pressable hitSlop={12} style={styles.detailHeaderBtn} onPress={onClose}>
              <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
            </Pressable>
            
            <View style={styles.detailHeaderTitleContainer}>
              <Text style={styles.detailHeaderTitle}>
                {headerTitle || "Chi tiết món ăn"}
              </Text>
              <Ionicons color={colors.textPrimary} name="chevron-down" size={14} style={{ marginLeft: 4 }} />
            </View>

            <Pressable hitSlop={12} style={styles.detailHeaderBtn}>
              <Ionicons color={colors.textPrimary} name="heart-outline" size={24} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
            {/* Food Image */}
            <View style={styles.detailImageContainer}>
              {food.imageUrl ? (
                <Image source={{ uri: food.imageUrl }} style={styles.detailImage} />
              ) : (
                <View style={styles.detailImagePlaceholder}>
                  <Ionicons color={colors.textMuted} name="restaurant-outline" size={64} />
                </View>
              )}
            </View>

            {/* Food Title */}
            <Text style={styles.detailFoodName}>{food.name}</Text>

            {/* Circular Progress & Macro Stats */}
            <View style={styles.detailStatsContainer}>
              {/* Custom circle with Calories */}
              <View style={styles.detailCircle}>
                <Text style={styles.detailCircleVal}>
                  {adjustedCalories}
                </Text>
                <Text style={styles.detailCircleLabel}>Cal</Text>
              </View>

              {/* Macro metrics columns */}
              <View style={styles.detailMacrosRow}>
                {/* Protein */}
                <View style={styles.detailMacroCol}>
                  <View style={[styles.detailMacroBadge, { backgroundColor: "rgba(255, 92, 92, 0.2)" }]}>
                    <Text style={[styles.detailMacroBadgeText, { color: "#ff5c5c" }]}>
                      {pPercent}%
                    </Text>
                  </View>
                  <Text style={styles.detailMacroVal}>
                    {adjustedProtein.toFixed(1).replace(".", ",")} g
                  </Text>
                  <View style={styles.detailMacroLabelRow}>
                    <Ionicons color="#ff5c5c" name="flash" size={10} />
                    <Text style={styles.detailMacroLabel}>CHẤT ĐẠM</Text>
                  </View>
                </View>

                {/* Carbs */}
                <View style={styles.detailMacroCol}>
                  <View style={[styles.detailMacroBadge, { backgroundColor: "rgba(62, 166, 255, 0.2)" }]}>
                    <Text style={[styles.detailMacroBadgeText, { color: "#3ea6ff" }]}>
                      {cPercent}%
                    </Text>
                  </View>
                  <Text style={styles.detailMacroVal}>
                    {adjustedCarbs.toFixed(1).replace(".", ",")} g
                  </Text>
                  <View style={styles.detailMacroLabelRow}>
                    <Ionicons color="#3ea6ff" name="leaf" size={10} />
                    <Text style={styles.detailMacroLabel}>ĐƯỜNG BỘT</Text>
                  </View>
                </View>

                {/* Fat */}
                <View style={styles.detailMacroCol}>
                  <View style={[styles.detailMacroBadge, { backgroundColor: "rgba(255, 199, 44, 0.2)" }]}>
                    <Text style={[styles.detailMacroBadgeText, { color: "#ffc72c" }]}>
                      {fPercent}%
                    </Text>
                  </View>
                  <Text style={styles.detailMacroVal}>
                    {adjustedFat.toFixed(1).replace(".", ",")} g
                  </Text>
                  <View style={styles.detailMacroLabelRow}>
                    <Ionicons color="#ffc72c" name="water" size={10} />
                    <Text style={styles.detailMacroLabel}>CHẤT BÉO</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Verified Badge */}
            <View style={styles.verifiedRow}>
              <Ionicons color="#3ea6ff" name="checkmark-circle" size={16} />
              <Text style={styles.verifiedText}>Được xác nhận bởi đội ngũ dinh dưỡng Wao</Text>
            </View>

            {/* Nutritional Details Collapsible */}
            <Pressable
              onPress={() => setShowNutritionDetail(!showNutritionDetail)}
              style={styles.dropdownBtn}
            >
              <Text style={styles.dropdownBtnText}>Hiển thị giá trị dinh dưỡng</Text>
              <Ionicons color={colors.textSecondary} name={showNutritionDetail ? "chevron-up" : "chevron-down"} size={16} />
            </Pressable>

            {showNutritionDetail && (
              <View style={styles.dropdownContent}>
                <View style={styles.nutritionRowDetail}>
                  <Text style={styles.nutritionLabelDetail}>Calories (Calo)</Text>
                  <Text style={styles.nutritionValDetail}>
                    {adjustedCalories} kcal
                  </Text>
                </View>
                <View style={styles.nutritionRowDetail}>
                  <Text style={styles.nutritionLabelDetail}>Protein (Chất đạm)</Text>
                  <Text style={styles.nutritionValDetail}>
                    {adjustedProtein.toFixed(1)}g
                  </Text>
                </View>
                <View style={styles.nutritionRowDetail}>
                  <Text style={styles.nutritionLabelDetail}>Carbohydrates (Đường bột)</Text>
                  <Text style={styles.nutritionValDetail}>
                    {adjustedCarbs.toFixed(1)}g
                  </Text>
                </View>
                <View style={styles.nutritionRowDetail}>
                  <Text style={styles.nutritionLabelDetail}>Fat (Chất béo)</Text>
                  <Text style={styles.nutritionValDetail}>
                    {adjustedFat.toFixed(1)}g
                  </Text>
                </View>
              </View>
            )}

            {/* Ingredients Section */}
            {isComponentsLoading ? (
              <View style={styles.ingredientsSection}>
                <View style={styles.ingredientsHeader}>
                  <Text style={styles.ingredientsTitle}>Nguyên liệu</Text>
                  <ActivityIndicator size="small" color="#8b5cf6" />
                </View>
              </View>
            ) : components.length > 0 ? (
              <View style={styles.ingredientsSection}>
                <Pressable
                  onPress={() => setShowComponents(!showComponents)}
                  style={styles.ingredientsHeader}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={styles.ingredientsTitle}>Nguyên liệu</Text>
                  </View>
                  <Ionicons
                    color={colors.textPrimary}
                    name={showComponents ? "chevron-up" : "chevron-down"}
                    size={20}
                  />
                </Pressable>

                {showComponents && (
                  <View style={styles.ingredientsList}>
                    {components.map((comp, idx) => (
                      <View key={comp.id || comp.child_food_id || idx} style={styles.ingredientRowItem}>
                        {comp.child_food_image_url ? (
                          <Image source={{ uri: comp.child_food_image_url }} style={styles.ingredientImg} />
                        ) : (
                          <View style={styles.ingredientImgPlaceholder}>
                            <MaterialCommunityIcons name="bowl-mix" size={20} color={colors.textSecondary} />
                          </View>
                        )}
                        <View style={styles.ingredientInfo}>
                          <Text style={styles.ingredientName} numberOfLines={1}>
                            {comp.child_food_name_vi || comp.child_food_name_en}
                          </Text>
                          <Text style={styles.ingredientWeight}>
                            {Math.round(Number(comp.quantity_g) * ratio)}g
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              // Fallback to original mock design if no components exist
              <View style={styles.ingredientsSection}>
                <View style={styles.ingredientsHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={styles.ingredientsTitle}>Nguyên liệu gợi ý</Text>
                    <Ionicons color={colors.textMuted} name="help-circle-outline" size={16} />
                  </View>
                </View>

                <View style={styles.ingredientsGrid}>
                  {getMockIngredients(food.name).map((ing, idx) => (
                    <View key={idx} style={styles.ingredientBadge}>
                      <Text style={styles.ingredientBadgeText}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Custom Serving Box */}
            <View style={styles.servingContainer}>
              <Text style={styles.servingTitle}>Khẩu phần tuỳ chỉnh</Text>
              <View style={styles.servingInputRow}>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setCustomServings}
                  style={styles.servingInput}
                  value={customServings}
                />
                <View style={styles.servingSeparator} />
                <Pressable style={styles.servingDropdown}>
                  <Text style={styles.servingDropdownText}>Khẩu phần ({food.servingSize.toString().replace('.', ',')}g)</Text>
                  <Ionicons color={colors.textPrimary} name="chevron-down" size={16} />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Violet Add Button at Bottom */}
          <View style={styles.detailFooter}>
            <Pressable
              onPress={() => onAdd(food, currentGrams)}
              style={styles.detailAddButton}
            >
              <Text style={styles.detailAddButtonText}>{submitButtonText || "Thêm vào"}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  detailOverlay: {
    flex: 1,
    backgroundColor: "#110b26",
  },
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#221a3a",
  },
  detailHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeaderTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  detailScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  detailImageContainer: {
    width: 220,
    height: 220,
    borderRadius: radius.lg,
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#30284e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  detailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1f1837",
    alignItems: "center",
    justifyContent: "center",
  },
  detailFoodName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: spacing.xl,
    fontSize: 22,
  },
  detailStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#181231",
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#282142",
  },
  detailCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 5,
    borderColor: "#ff5c5c",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1738",
  },
  detailCircleVal: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
  },
  detailCircleLabel: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  detailMacrosRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    marginLeft: spacing.md,
  },
  detailMacroCol: {
    alignItems: "center",
    gap: 4,
  },
  detailMacroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  detailMacroBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  detailMacroVal: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  detailMacroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  detailMacroLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "600",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  verifiedText: {
    color: "#3ea6ff",
    fontSize: 12,
    fontWeight: "500",
  },
  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1738",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#282142",
  },
  dropdownBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownContent: {
    backgroundColor: "#181231",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#282142",
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
    marginBottom: spacing.lg,
  },
  ingredientsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  ingredientsTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  ingredientsActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  ingredientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    backgroundColor: "#181231",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#282142",
  },
  ingredientBadge: {
    backgroundColor: "#221c3c",
    paddingHorizontal: 12,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  ingredientBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  // Style mới cho danh sách nguyên liệu dạng Card
  ingredientsList: {
    backgroundColor: "#181231",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#282142",
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  ingredientRowItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#221a3a",
  },
  ingredientImg: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  ingredientImgPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: "#20183e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  ingredientWeight: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  viewMoreIngredients: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  viewMoreIngredientsText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "600",
  },
  servingContainer: {
    marginBottom: spacing.xl,
  },
  servingTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  servingInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181231",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#282142",
    height: 48,
    paddingHorizontal: spacing.md,
  },
  servingInput: {
    width: 60,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  servingSeparator: {
    width: 1,
    height: 24,
    backgroundColor: "#2e274a",
    marginHorizontal: spacing.md,
  },
  servingDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  servingDropdownText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  detailFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#110b26",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#221a3a",
  },
  detailAddButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: radius.pill,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  detailAddButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
