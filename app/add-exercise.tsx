import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SectionList,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { getTodayDateISO } from "@/hooks/utils/date";
import { exerciseService, Exercise, ExerciseCategory } from "@/services/exerciseService";

export default function AddExerciseScreen() {
  const { date, exerciseName } = useLocalSearchParams<{ date: string; exerciseName?: string }>();
  const targetDate = date ?? getTodayDateISO();

  // ── State ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const sectionListRef = useRef<SectionList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: number }>({});

  // ── Load danh sách bài tập từ API ────────────────────────────────────────
  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      setLoading(true);
      const data = await exerciseService.getCategories();
      console.log("Categories loaded:", data);
      setCategories(data);
    } catch (error: any) {
      console.error("Load exercises error:", error);
      Alert.alert("Lỗi", error?.message || "Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  }

  // ── Chọn bài tập và chuyển sang màn hình nhập chi tiết ──────────────────
  function handleSelectExercise(exercise: Exercise) {
    console.log("Selected exercise:", exercise.nameVi);
    // TODO: Navigate to exercise detail input screen
    router.push(`/exercise-detail?exerciseId=${exercise.id}&date=${targetDate}`);
  }

  // ── Lọc và nhóm bài tập theo alphabet ────────────────────────────────────
  const allExercises = categories.flatMap(cat => cat.exercises);
  
  const filteredExercises = allExercises.filter(ex => {
    const matchesCategory = selectedCategoryId === null || ex.categoryId === selectedCategoryId;
    const matchesSearch = searchQuery
      ? ex.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Hàm chuẩn hóa chữ cái có dấu về chữ cái gốc
  const normalizeVietnamese = (str: string): string => {
    const map: Record<string, string> = {
      'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
      'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
      'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
      'Đ': 'D',
      'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
      'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
      'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
      'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
      'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
      'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
      'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
      'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
      'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    };
    const firstChar = str.charAt(0).toUpperCase();
    return map[firstChar] || firstChar;
  };

  // Nhóm theo chữ cái đầu (chuẩn hóa)
  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const normalizedLetter = normalizeVietnamese(exercise.nameVi);
    if (!acc[normalizedLetter]) {
      acc[normalizedLetter] = [];
    }
    acc[normalizedLetter].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const sections = Object.keys(groupedExercises)
    .sort()
    .map(letter => ({
      title: letter,
      data: groupedExercises[letter],
    }));

  console.log('Available sections:', sections.map(s => s.title).join(', '));

  // Tạo danh sách chữ cái cho alphabet slider
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Hiển thị tất cả các chữ cái, không chỉ những chữ có data
  const displayedAlphabet = alphabet;

  // Hàm scroll đến section theo chữ cái
  const scrollToLetter = (letter: string) => {
    const sectionIndex = sections.findIndex(s => s.title === letter);
    console.log(`Scrolling to letter: ${letter}, sectionIndex: ${sectionIndex}`);
    
    if (sectionIndex === -1) {
      console.log(`Letter ${letter} not found in sections`);
      return;
    }

    if (sectionListRef.current) {
      try {
        // Tính toán offset thủ công
        const ITEM_HEIGHT = 77; // height của mỗi exercise item
        const SECTION_HEADER_HEIGHT = 41; // height của section header
        
        let offset = 0;
        for (let i = 0; i < sectionIndex; i++) {
          offset += SECTION_HEADER_HEIGHT;
          offset += sections[i].data.length * ITEM_HEIGHT;
        }
        
        console.log(`Calculated offset: ${offset}`);
        
        // Lấy scrollable node từ SectionList
        const scrollResponder = (sectionListRef.current as any).getScrollResponder?.();
        if (scrollResponder && scrollResponder.scrollTo) {
          console.log('Using scrollResponder.scrollTo');
          scrollResponder.scrollTo({ y: offset, animated: true });
        } else if ((sectionListRef.current as any).scrollToOffset) {
          console.log('Using scrollToOffset');
          (sectionListRef.current as any).scrollToOffset({ offset, animated: true });
        } else {
          console.log('Using scrollToLocation');
          sectionListRef.current.scrollToLocation({
            sectionIndex,
            itemIndex: 0,
            animated: true,
            viewPosition: 0,
          });
        }
      } catch (error) {
        console.error('Scroll error:', error);
      }
    }
  };

  // Kiểm tra chữ cái nào có data
  const availableLetters = new Set(sections.map(s => s.title));

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải bài tập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm hoạt động</Text>
        <Pressable hitSlop={12} onPress={() => {}}>
          <Ionicons color={colors.primary} name="add" size={28} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        isSearchFocused && styles.searchContainerFocused
      ]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm kiếm hoạt động"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Category Tabs */}
      {!searchQuery && categories.length > 0 && (
        <View style={styles.tabsWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabsContent}
          >
            <Pressable
              onPress={() => setSelectedCategoryId(null)}
              style={[
                styles.tabBtn,
                selectedCategoryId === null && styles.tabBtnActive
              ]}
            >
              <Ionicons 
                name="apps-outline" 
                size={15} 
                color={selectedCategoryId === null ? colors.primary : colors.textMuted} 
              />
              <Text style={[
                styles.tabText,
                selectedCategoryId === null && styles.tabTextActive
              ]}>
                Tất cả
              </Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.tabBtn,
                  selectedCategoryId === cat.id && styles.tabBtnActive
                ]}
              >
                <Ionicons 
                  name="fitness-outline" 
                  size={15} 
                  color={selectedCategoryId === cat.id ? colors.primary : colors.textMuted} 
                />
                <Text style={[
                  styles.tabText,
                  selectedCategoryId === cat.id && styles.tabTextActive
                ]}>
                  {cat.nameVi}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Apple Health Section - chỉ hiện khi không search */}
      {!searchQuery && (
        <View style={styles.healthSection}>
          <Text style={styles.sectionTitle}>THEO DỐI TỰ ĐỘNG</Text>
          <Pressable style={styles.healthCard}>
            <View style={styles.healthIconWrapper}>
              <Ionicons name="heart" size={32} color="#FF2D55" />
            </View>
            <View style={styles.healthContent}>
              <Text style={styles.healthText}>
                Kết nối Apple Health để Wao tự theo dõi calo hoạt động cho bạn.
              </Text>
              <Text style={styles.healthLink}>Kết nối</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Exercise List */}
      <View style={styles.listContainer}>
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          getItemLayout={(data, index) => {
            const ITEM_HEIGHT = 77;
            return {
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            };
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={styles.exerciseItem}
              onPress={() => handleSelectExercise(item)}
            >
              {item.iconUrl ? (
                <Image 
                  source={{ uri: item.iconUrl }} 
                  style={styles.exerciseIcon}
                />
              ) : (
                <View style={styles.exerciseIconPlaceholder}>
                  <Ionicons name="fitness-outline" size={24} color={colors.textMuted} />
                </View>
              )}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.nameVi}</Text>
                {item.nameEn && (
                  <Text style={styles.exerciseNameEn}>{item.nameEn}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy bài tập</Text>
            </View>
          }
        />

        {/* Alphabet Slider - chỉ hiện khi không search */}
        {!searchQuery && (
          <View style={styles.alphabetSlider}>
            {displayedAlphabet.map((letter) => {
              const hasData = availableLetters.has(letter);
              return (
                <Pressable
                  key={letter}
                  onPress={() => hasData && scrollToLetter(letter)}
                  style={styles.alphabetItem}
                  hitSlop={4}
                  disabled={!hasData}
                >
                  <Text style={[
                    styles.alphabetText,
                    hasData && styles.alphabetTextActive
                  ]}>
                    {letter}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { 
    ...typography.h3, 
    color: colors.textPrimary,
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    height: 48,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchContainerFocused: {
    borderColor: colors.primary,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
    outlineStyle: "none" as any,
  },
  healthSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  healthCard: {
    flexDirection: "row",
    backgroundColor: "rgba(165,108,255,0.15)",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(165,108,255,0.3)",
  },
  healthIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  healthContent: {
    flex: 1,
    gap: spacing.xs,
  },
  healthText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  healthLink: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
    position: "relative",
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  exerciseIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  exerciseNameEn: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 15,
  },
  alphabetSlider: {
    position: "absolute",
    right: 4,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    width: 24,
    zIndex: 10,
  },
  alphabetItem: {
    paddingVertical: 1,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 14,
  },
  alphabetText: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0,
  },
  alphabetTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  tabsWrapper: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165,108,255,0.1)",
  },
  tabText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
