import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "@/constants";
import { foodService, FoodItemDto } from "@/services/foodService";
import { FoodDetailModal } from "./FoodDetailModal";

/** Alias để UI không cần thay đổi */
type FoodItem = FoodItemDto & {
  /** alias: caloriesKcal */
  calories: number;
  /** alias: proteinG */
  protein: number;
  /** alias: carbsG */
  carbs: number;
  /** alias: fatG */
  fat: number;
  /** alias: servingSizeG */
  servingSize: number;
  name: string;
  category: string;
  imageUrl: string | null;
  description: string | null;
};

interface FoodSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}


export function FoodSelectorModal({ visible, onClose, onSelectFood }: FoodSelectorModalProps) {
  const [initialFoods, setInitialFoods] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showAllFoods, setShowAllFoods] = useState(false);

  // States quản lý Modal chi tiết món ăn (Detail view)
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailFood, setDetailFood] = useState<FoodItem | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = [
    { id: 1, name: "Cơm & Xôi" },
    { id: 2, name: "Phở & Bún" },
    { id: 3, name: "Bánh mì & Bánh" },
    { id: 4, name: "Đồ uống" },
    { id: 5, name: "Thực phẩm đóng gói" },
    { id: 6, name: "Rau củ quả" },
    { id: 7, name: "Thịt & Hải sản" },
    { id: 10, name: "Khác" }
  ];

  const DEFAULT_DISPLAY_COUNT = 4;

  const [activeTab, setActiveTab] = useState<"recent" | "created" | "favorite">("recent");

  const getTabFilteredFoods = () => {
    if (activeTab === "created") {
      return filteredFoods.filter((f) => f.source === 3);
    }
    if (activeTab === "favorite") {
      // Lọc các món ăn có đuôi/tên phổ biến hoặc source === 1/2 làm yêu thích
      return filteredFoods.filter((f) => f.source === 1 || f.source === 2 || f.name.includes("Cơm") || f.name.includes("luộc") || f.name.includes("bơ"));
    }
    return filteredFoods;
  };

  const displayedFoods = showAllFoods
    ? getTabFilteredFoods()
    : getTabFilteredFoods().slice(0, DEFAULT_DISPLAY_COUNT);

  const hasMoreFoods = getTabFilteredFoods().length > DEFAULT_DISPLAY_COUNT;

  // DRY helper để map DTO thành dạng FoodItem phù hợp giao diện
  function mapDto(dto: any): FoodItem {
    const catName = categories.find((c) => c.id === dto.categoryId)?.name || "Khác";
    return {
      ...dto,
      id: dto.id,
      name: dto.nameVi,
      category: catName,
      categoryId: dto.categoryId,
      calories: dto.caloriesKcal ?? 0,
      protein: dto.proteinG ?? 0,
      carbs: dto.carbsG ?? 0,
      fat: dto.fatG ?? 0,
      servingSize: dto.servingSizeG ?? 100,
      imageUrl: dto.imageUrl ?? null,
      description: null,
    };
  }

  // 1. Tải danh sách 50 món ăn ban đầu làm dữ liệu nguồn (Master list) khi Modal mở
  useEffect(() => {
    if (visible) {
      loadInitialFoods();
    }
  }, [visible]);

  async function loadInitialFoods() {
    setIsLoading(true);
    try {
      // Gọi API danh sách món ăn mặc định (GET /api/foods)
      const rawList = await foodService.getAllFoods(1, 50);

      const mapped = rawList.map(mapDto);
      setInitialFoods(mapped);
      setFilteredFoods(mapped);
    } catch (error) {
      console.error("Lỗi khi tải danh sách món ăn ban đầu:", error);
      setInitialFoods([]);
      setFilteredFoods([]);
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Lắng nghe thay đổi tìm kiếm & danh mục để phối hợp Tìm kiếm Lai (Hybrid Search)
  useEffect(() => {
    if (!visible) return;

    // A. Thử lọc cục bộ (Client-side) trước tiên từ danh sách 50 món đã tải ban đầu
    let localResult = initialFoods;
    if (selectedCategoryId) {
      localResult = localResult.filter((f) => f.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      localResult = localResult.filter((f) => f.name.toLowerCase().includes(q));
    }

    // B. Điều phối hiển thị / Fallback gọi API Server
    if (searchQuery.trim() === "") {
      // Nếu ô tìm kiếm trống, chỉ hiển thị danh sách lọc theo danh mục cục bộ (không gọi API)
      setFilteredFoods(localResult);
      setShowAllFoods(false);
      return;
    }

    if (localResult.length > 0) {
      // Nếu bộ lọc cục bộ tìm thấy kết quả, sử dụng ngay lập tức (Zero-latency!)
      setFilteredFoods(localResult);
      setShowAllFoods(false);
    } else {
      // Nếu cục bộ không thấy món này, tự động kích hoạt gọi Server Search nâng cao (Debounced 300ms)
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const res = await foodService.searchFoods({
            q: searchQuery.trim(),
            categoryId: selectedCategoryId ?? undefined,
            page: 1,
            pageSize: 50,
          });

          const mapped = res.items.map(mapDto);
          setFilteredFoods(mapped);
          setShowAllFoods(false);
        } catch (error) {
          console.error("Lỗi khi tìm kiếm nâng cao từ server:", error);
          setFilteredFoods([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selectedCategoryId, initialFoods, visible]);

  async function handleSelectFood(food: FoodItem) {
    try {
      const full = await foodService.getFoodById(food.id);
      if (full) {
        onSelectFood({
          ...food,
          protein: full.proteinG ?? 0,
          carbs: full.carbsG ?? 0,
          fat: full.fatG ?? 0,
          calories: full.caloriesKcal ?? 0,
          servingSize: full.servingSizeG ?? 100,
        });
      } else {
        onSelectFood(food);
      }
    } catch {
      onSelectFood(food);
    }
    // Reset state
    setSearchQuery("");
    setSelectedCategoryId(null);
    setShowAllFoods(false);
  }

  const handleClose = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setShowAllFoods(false);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn món ăn</Text>
            <Pressable hitSlop={12} onPress={handleClose}>
              <Ionicons color={colors.textPrimary} name="close" size={24} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.foodsCard}>
              {/* Search bar */}
              <View style={styles.searchRow}>
                <Ionicons color={colors.textMuted} name="search-outline" size={18} />
                <TextInput
                  onChangeText={setSearchQuery}
                  placeholder="Tìm thực phẩm hoặc món ăn"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  value={searchQuery}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons color={colors.textMuted} name="close-circle" size={18} />
                  </Pressable>
                ) : (
                  <Pressable hitSlop={8}>
                    <Ionicons color={colors.textPrimary} name="scan-outline" size={20} />
                  </Pressable>
                )}
              </View>

              {/* Premium Tabs: Gần đây • Tạo bởi tôi • Yêu thích */}
              <View style={styles.tabsContainer}>
                <Pressable
                  onPress={() => setActiveTab("recent")}
                  style={[styles.tabButton, activeTab === "recent" && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, activeTab === "recent" && styles.tabButtonTextActive]}>
                    Gần đây
                  </Text>
                  {activeTab === "recent" && <View style={styles.activeLine} />}
                </Pressable>
                
                <Pressable
                  onPress={() => setActiveTab("created")}
                  style={[styles.tabButton, activeTab === "created" && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, activeTab === "created" && styles.tabButtonTextActive]}>
                    Tạo bởi tôi
                  </Text>
                  {activeTab === "created" && <View style={styles.activeLine} />}
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab("favorite")}
                  style={[styles.tabButton, activeTab === "favorite" && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, activeTab === "favorite" && styles.tabButtonTextActive]}>
                    Yêu thích
                  </Text>
                  {activeTab === "favorite" && <View style={styles.activeLine} />}
                </Pressable>
              </View>

              {/* Premium Quick Action Cards */}
              <View style={styles.quickActionsRow}>
                {/* Barcode scan */}
                <Pressable style={styles.quickActionCard}>
                  <View style={[styles.quickActionIconBg, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                    <Ionicons color="#3b82f6" name="barcode-outline" size={22} />
                  </View>
                  <Text style={styles.quickActionText}>Quét mã vạch</Text>
                </Pressable>

                {/* AI Dishes Recognition */}
                <Pressable style={styles.quickActionCard}>
                  <View style={[styles.quickActionIconBg, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                    <Ionicons color="#10b981" name="sparkles-outline" size={22} />
                  </View>
                  <Text style={styles.quickActionText}>Nhận diện món ăn</Text>
                </Pressable>

                {/* Voice Record */}
                <Pressable style={styles.quickActionCard}>
                  <View style={[styles.quickActionIconBg, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
                    <Ionicons color="#ef4444" name="mic-outline" size={22} />
                  </View>
                  <Text style={styles.quickActionText}>Ghi bằng giọng nói</Text>
                </Pressable>
              </View>

              {/* Category filters */}
              <View style={styles.categoryRow}>
                <Pressable
                  onPress={() => setSelectedCategoryId(null)}
                  style={[styles.categoryChip, !selectedCategoryId && styles.categoryChipActive]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      !selectedCategoryId && styles.categoryTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === cat.id && styles.categoryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategoryId === cat.id && styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
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
                        {searchQuery || selectedCategoryId
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
                            onPress={async () => {
                              setIsLoading(true);
                              try {
                                const full = await foodService.getFoodById(item.id);
                                setDetailFood(full ? mapDto(full) : item);
                                setDetailVisible(true);
                              } catch (error) {
                                console.error("Lỗi khi tải chi tiết món ăn:", error);
                                setDetailFood(item);
                                setDetailVisible(true);
                              } finally {
                                setIsLoading(false);
                              }
                            }}
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
                            <Pressable
                              style={styles.addButton}
                              onPress={() => handleSelectFood(item)}
                            >
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
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

      {/* Giao diện chi tiết món ăn chuẩn premium độc lập và tái sử dụng */}
      <FoodDetailModal
        visible={detailVisible}
        food={detailFood}
        onClose={() => setDetailVisible(false)}
        onAdd={(food, grams) => {
          const ratio = grams / food.servingSize;
          onSelectFood({
            ...food,
            protein: food.protein * ratio,
            carbs: food.carbs * ratio,
            fat: food.fat * ratio,
            calories: food.calories * ratio,
            servingSize: grams,
          });
          setDetailVisible(false);
          handleClose();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.bgBase,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: spacing.xl,
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
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#221a3a",
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
    position: "relative",
  },
  tabButtonActive: {},
  tabButtonText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    fontSize: 15,
  },
  tabButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  activeLine: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#181231",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#282142",
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  quickActionText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 11,
    textAlign: "center",
  },
  foodsCard: {
    padding: spacing.lg,
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
