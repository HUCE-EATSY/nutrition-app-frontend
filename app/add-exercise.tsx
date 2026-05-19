import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
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
  
  const filteredExercises = searchQuery
    ? allExercises.filter(ex => 
        ex.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allExercises;

  // Nhóm theo chữ cái đầu
  const groupedExercises = filteredExercises.reduce((acc, exercise) => {
    const firstLetter = exercise.nameVi.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const sections = Object.keys(groupedExercises)
    .sort()
    .map(letter => ({
      title: letter,
      data: groupedExercises[letter],
    }));

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
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm kiếm hoạt động"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Apple Health Section */}
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

      {/* Exercise List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
            <Text style={styles.exerciseName}>{item.nameVi} ({item.nameEn})</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy bài tập</Text>
          </View>
        }
      />
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
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
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
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  sectionHeaderText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgBase,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
