import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { getTodayDateISO } from "@/utils/date";
import { useSettingsStore } from "@/store/settingsStore";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { useDiaryStore } from "@/store/diaryStore";
import { useStepsStore } from "@/store/statsStore";

export default function AddExerciseScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);
  const { date } = useLocalSearchParams<{ date: string }>();
  const targetDate = date ?? getTodayDateISO();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Lấy dữ liệu từ store giống dashboard
  const { exercises: exerciseLogs } = useDiaryStore();
  const { todaySteps, isConnected, stepRecords } = useStepsStore();
  
  // Tính toán calo giống dashboard
  const exerciseBurned = Math.round(exerciseLogs.reduce((sum, ex) => sum + ex.caloriesBurned, 0));
  const todayStr = getTodayDateISO();
  const stepsForSelectedDate = targetDate === todayStr ? todaySteps : ((stepRecords || {})[targetDate] || 0);
  const stepBurned = isConnected ? Math.round(stepsForSelectedDate * 0.04) : 0;
  const totalBurned = exerciseBurned + stepBurned;
  const exerciseGoal = 500; // Mục tiêu mặc định, có thể lấy từ settings sau

  useEffect(() => {
    async function loadExercises() {
      try {
        setLoading(true);
        const categories = await exerciseService.getCategories();
        let allExercises: Exercise[] = [];
        categories.forEach(cat => {
          allExercises = [...allExercises, ...cat.exercises];
        });
        setExercises(allExercises);
      } catch (error) {
        console.error("Failed to load exercises", error);
      } finally {
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return exercises;
    return exercises.filter(ex => 
      ex.nameVi.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exercises, searchQuery]);

  function normalizeChar(char: string) {
    const c = char.toUpperCase();
    if (["Á", "À", "Ả", "Ã", "Ạ", "Ă", "Ắ", "Ằ", "Ẳ", "Ẵ", "Ặ", "Â", "Ấ", "Ầ", "Ẩ", "Ẫ", "Ậ"].includes(c)) return "A";
    if (["Đ"].includes(c)) return "D";
    if (["É", "È", "Ẻ", "Ẽ", "Ẹ", "Ê", "Ế", "Ề", "Ể", "Ễ", "Ệ"].includes(c)) return "E";
    if (["Í", "Ì", "Ỉ", "Ĩ", "Ị"].includes(c)) return "I";
    if (["Ó", "Ò", "Ỏ", "Õ", "Ọ", "Ô", "Ố", "Ồ", "Ổ", "Ỗ", "Ộ", "Ơ", "Ớ", "Ờ", "Ở", "Ỡ", "Ợ"].includes(c)) return "O";
    if (["Ú", "Ù", "Ủ", "Ũ", "Ụ", "Ư", "Ứ", "Ừ", "Ử", "Ữ", "Ự"].includes(c)) return "U";
    if (["Ý", "Ỳ", "Ỷ", "Ỹ", "Ỵ"].includes(c)) return "Y";
    return c;
  }

  const sections = useMemo(() => {
    const grouped: Record<string, Exercise[]> = {};
    filteredExercises.forEach(ex => {
      const name = language === "en" ? ex.nameEn : ex.nameVi;
      const firstLetter = normalizeChar(name.charAt(0));
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(ex);
    });

    const sortedKeys = Object.keys(grouped).sort();
    return sortedKeys.map(key => ({
      title: key,
      data: grouped[key].sort((a, b) => {
        const nameA = language === "en" ? a.nameEn : a.nameVi;
        const nameB = language === "en" ? b.nameEn : b.nameVi;
        return nameA.localeCompare(nameB);
      })
    }));
  }, [filteredExercises, language]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={28} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm hoạt động</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Exercise Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mục tiêu</Text>
              <View style={styles.summaryValueRow}>
                <MaterialCommunityIcons name="fire" size={16} color={colors.danger} />
                <Text style={styles.summaryValue}>{exerciseGoal}</Text>
                <Text style={styles.summaryUnit}>kcal</Text>
              </View>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đã đốt</Text>
              <View style={styles.summaryValueRow}>
                <MaterialCommunityIcons name="fire" size={16} color={colors.primary} />
                <Text style={styles.summaryValue}>{totalBurned}</Text>
                <Text style={styles.summaryUnit}>kcal</Text>
              </View>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min(100, (totalBurned / exerciseGoal) * 100)}%` }
              ]} 
            />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons color={colors.textMuted} name="search" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm hoạt động"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <View style={styles.listWrapper}>
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <>
                  {!searchQuery && (
                    <>
                      <Text style={styles.sectionLabel}>THEO DÕI TỰ ĐỘNG</Text>
                      <View style={styles.healthCard}>
                        <View style={styles.healthIconContainer}>
                          <Ionicons name="heart" size={32} color="#FF3B30" />
                        </View>
                        <View style={styles.healthTextContainer}>
                          <Text style={styles.healthText}>
                            Kết nối Apple Health để Wao tự theo dõi calo hoạt động cho bạn.
                          </Text>
                          <Text style={styles.healthLink}>Kết nối</Text>
                        </View>
                      </View>
                    </>
                  )}
                </>
              }
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                return (
                  <Pressable 
                    style={styles.exerciseItem}
                    onPress={() => router.push({ pathname: "/exercise-detail", params: { exerciseId: item.id, date: targetDate } })}
                  >
                    {item.iconUrl ? (
                      <Image source={{ uri: item.iconUrl }} style={styles.exerciseImage} />
                    ) : null}
                    <View style={styles.exerciseTextContainer}>
                      <Text style={styles.exerciseName}>
                        {item.nameVi} ({item.nameEn})
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                );
              }}
            />
            
            {/* Alphabet Index */}
            <View style={styles.alphabetIndex}>
              {alphabet.map((letter) => (
                <Text 
                  key={letter} 
                  style={[
                    styles.alphabetLetter, 
                    sections.some(s => s.title === letter) && styles.alphabetLetterActive
                  ]}
                >
                  {letter}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: "#151226" }, // Dark background like image
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.h3, color: "#FFFFFF", fontSize: 18 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  summaryValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  summaryUnit: {
    color: "#8E8E93",
    fontSize: 12,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: spacing.md,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#A56CFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    ...typography.body,
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listWrapper: {
    flex: 1,
    flexDirection: "row",
  },
  listContent: {
    paddingBottom: spacing.xxxl,
    paddingRight: spacing.xl,
  },
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  healthCard: {
    flexDirection: "row",
    backgroundColor: "#2B1B54",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  healthIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  healthTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  healthText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  healthLink: {
    color: "#A56CFF",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    paddingVertical: spacing.xs,
    backgroundColor: "#151226",
  },
  sectionTitle: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  exerciseImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  alphabetIndex: {
    position: "absolute",
    right: -spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },
  alphabetLetter: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    fontWeight: "bold",
    marginVertical: 1,
  },
  alphabetLetterActive: {
    color: "#A56CFF",
  },
});
