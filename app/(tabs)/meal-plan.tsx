import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { SegmentedPillTabs } from "@/components/meal/SegmentedPillTabs";
import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";

const tabs = [
  { key: "explore", label: t.mealPlan.tabs.explore },
  { key: "saved", label: t.mealPlan.tabs.saved },
  { key: "history", label: t.mealPlan.tabs.history },
];

const API_BASE = "http://localhost:5184";

interface FoodItem {
  id: number;
  name: string;
  imageUrl: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  description: string | null;
}

export default function MealPlanScreen() {
  const [activeTab, setActiveTab] = useState("explore");
  const { isNarrowWidth } = useResponsiveLayout();

  // Foods state
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllFoods, setShowAllFoods] = useState(false); // Trạng thái xem thêm

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Categories từ database
  const categories = ["Vietnamese", "Protein", "Vegetables", "Fruits", "Grains"];

  // Số món hiển thị mặc định
  const DEFAULT_DISPLAY_COUNT = 4;
  
  // Danh sách món để hiển thị (giới hạn hoặc full)
  const displayedFoods = showAllFoods 
    ? filteredFoods 
    : filteredFoods.slice(0, DEFAULT_DISPLAY_COUNT);
  
  const hasMoreFoods = filteredFoods.length > DEFAULT_DISPLAY_COUNT;

  // Load tất cả foods khi mount
  useEffect(() => {
    if (activeTab === "explore") {
      loadAllFoods();
    }
  }, [activeTab]);

  // Filter foods khi search hoặc category thay đổi
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      let result = foods;

      // Filter by category
      if (selectedCategory) {
        result = result.filter((f) => f.category === selectedCategory);
      }

      // Filter by search
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        result = result.filter((f) => f.name.toLowerCase().includes(query));
      }

      setFilteredFoods(result);
      setShowAllFoods(false); // Reset về trạng thái thu gọn khi filter thay đổi
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedCategory, foods]);

  async function loadAllFoods() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/Food`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setFoods(json.data ?? []);
      setFilteredFoods(json.data ?? []);
    } catch (error) {
      console.error("Failed to load foods:", error);
      setFoods([]);
      setFilteredFoods([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFoodPress(food: FoodItem) {
    // Navigate to add-entry with pre-selected food
    router.push(`/add-entry?foodId=${food.id}`);
  }

  // Render tab content
  function renderTabContent() {
    if (activeTab === "saved" || activeTab === "history") {
      return (
        <SurfaceCard style={[styles.emptyCard, isNarrowWidth && styles.emptyCardCompact]}>
          <Text style={styles.emoji}>{t.mealPlan.emptyEmoji}</Text>
          <Text style={[styles.emptyTitle, isNarrowWidth && styles.emptyTitleCompact]}>
            {t.mealPlan.emptyTitle}
          </Text>
          <Text style={styles.emptyBody}>{t.mealPlan.emptyBody}</Text>
        </SurfaceCard>
      );
    }

    // Tab "explore" - Hiển thị danh sách foods
    return (
      <SurfaceCard style={styles.foodsCard}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons color={colors.textMuted} name="search-outline" size={18} />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder="Tìm món ăn..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons color={colors.textMuted} name="close-circle" size={18} />
            </Pressable>
          )}
        </View>

        {/* Category filters */}
        <View style={styles.categoryRow}>
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          >
            <Text
              style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive,
              ]}
            >
              Tất cả
            </Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Loading */}
        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ marginTop: spacing.xl }}
          />
        )}

        {/* Foods list */}
        {!isLoading && (
          <>
            {displayedFoods.length === 0 ? (
              <View style={styles.emptyList}>
                <Ionicons color={colors.textMuted} name="restaurant-outline" size={48} />
                <Text style={styles.emptyListText}>
                  {searchQuery || selectedCategory
                    ? "Không tìm thấy món ăn nào"
                    : "Chưa có món ăn nào"}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.foodsList}>
                  {displayedFoods.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleFoodPress(item)}
                      style={styles.foodCard}
                    >
                      {/* Food image */}
                      <View style={styles.foodImageContainer}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.foodImage} />
                        ) : (
                          <View style={styles.foodImagePlaceholder}>
                            <Ionicons
                              color={colors.textMuted}
                              name="restaurant-outline"
                              size={32}
                            />
                          </View>
                        )}
                      </View>

                      {/* Food info */}
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.foodCategory}>{item.category}</Text>

                        {/* Nutrition info */}
                        <View style={styles.nutritionRow}>
                          <View style={styles.nutritionItem}>
                            <Ionicons color={colors.primary} name="flame" size={12} />
                            <Text style={styles.nutritionText}>{item.calories} kcal</Text>
                          </View>
                          <View style={styles.nutritionItem}>
                            <Ionicons color={colors.protein} name="flash" size={12} />
                            <Text style={styles.nutritionText}>{item.protein}g</Text>
                          </View>
                          <View style={styles.nutritionItem}>
                            <Ionicons color={colors.carbs} name="leaf" size={12} />
                            <Text style={styles.nutritionText}>{item.carbs}g</Text>
                          </View>
                          <View style={styles.nutritionItem}>
                            <Ionicons color={colors.fat} name="water" size={12} />
                            <Text style={styles.nutritionText}>{item.fat}g</Text>
                          </View>
                        </View>

                        <Text style={styles.servingSize}>
                          Khẩu phần: {item.servingSize}g
                        </Text>
                      </View>

                      {/* Add button */}
                      <Pressable style={styles.addButton} onPress={() => handleFoodPress(item)}>
                        <Ionicons color={colors.primary} name="add-circle" size={28} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>

                {/* Nút "Xem thêm" / "Thu gọn" */}
                {hasMoreFoods && (
                  <Pressable
                    onPress={() => setShowAllFoods(!showAllFoods)}
                    style={styles.viewMoreButton}
                  >
                    <Text style={styles.viewMoreText}>
                      {showAllFoods
                        ? "Thu gọn"
                        : `Xem thêm ${filteredFoods.length - DEFAULT_DISPLAY_COUNT} món`}
                    </Text>
                    <Ionicons
                      color={colors.primary}
                      name={showAllFoods ? "chevron-up" : "chevron-down"}
                      size={18}
                    />
                  </Pressable>
                )}
              </>
            )}
          </>
        )}
      </SurfaceCard>
    );
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>
          {t.mealPlan.title}
        </Text>
        <Text style={styles.description}>{t.mealPlan.description}</Text>

        <SegmentedPillTabs activeKey={activeTab} items={tabs} onChange={setActiveTab} />

        {renderTabContent()}

        <GradientButton label={t.mealPlan.createCta} onPress={() => undefined} />
        <GradientButton disabled label={t.mealPlan.savedCta} onPress={() => undefined} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
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
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
  },
  emptyCardCompact: {
    minHeight: 250,
  },
  emoji: {
    fontSize: 64,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptyTitleCompact: {
    ...typography.h3,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  // Foods card styles
  foodsCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  exploreContent: {
    gap: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
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
  categoryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: colors.textPrimary,
  },
  foodsList: {
    gap: spacing.md,
  },
  emptyList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyListText: {
    ...typography.body,
    color: colors.textMuted,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  foodImageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  foodImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  foodImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  foodInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  foodName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  foodCategory: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  nutritionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  nutritionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  nutritionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  servingSize: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  addButton: {
    alignSelf: "center",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    marginTop: spacing.sm,
  },
  viewMoreText: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 14,
  },
});
