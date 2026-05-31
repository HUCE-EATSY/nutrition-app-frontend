import React, { useMemo } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWeightStore } from "@/store/statsStore";
import { useAppColors } from "@/hooks/useAppColors";
import { SafeScreen } from "@/components/layout/SafeScreen";

export default function WeightHistoryScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  
  const { weightLogs } = useWeightStore();

  // Gom nhóm dữ liệu theo tháng/năm
  const sections = useMemo(() => {
    const groups: Record<string, typeof weightLogs> = {};
    
    weightLogs.forEach((log) => {
      // log.log_date format "YYYY-MM-DD"
      const dateParts = log.log_date.split("-");
      if (dateParts.length >= 2) {
        const year = dateParts[0];
        const month = dateParts[1];
        // Format label vd "Tháng 05, 2026"
        const sectionTitle = `Tháng ${parseInt(month, 10)}, ${year}`;
        if (!groups[sectionTitle]) {
          groups[sectionTitle] = [];
        }
        groups[sectionTitle].push(log);
      }
    });

    const result = Object.keys(groups).map((title) => ({
      title,
      data: groups[title].sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()),
    }));

    // Sắp xếp các tháng theo thời gian giảm dần
    // (Bằng cách parse ngược title hoặc đơn giản là vì ta đã sort logs ban đầu)
    // Giả sử dữ liệu trả về mới nhất trước
    return result;
  }, [weightLogs]);

  const formatDate = (dateString: string) => {
    const parts = dateString.split("-");
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  };

  return (
    <SafeScreen contentContainerStyle={styles.container}>
      {/* 1. Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử cân nặng</Text>
        <View style={styles.headerRightEmpty} />
      </View>

      {/* 2. List Layout */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        
        // Section Header
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        
        // Item Card
        renderItem={({ item }) => {
          const imageUrl = item.photoUrl || item.photo_url;
          
          return (
            <View style={styles.cardContainer}>
              {/* Cụm Trái */}
              <View style={styles.leftContent}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderThumbnail}>
                    <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                  </View>
                )}
                
                <View style={styles.infoColumn}>
                  <Text style={styles.weightText}>{item.weight_kg} kg</Text>
                  <View style={styles.sourceRow}>
                    <Ionicons name="phone-portrait-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.sourceText}>Ghi bởi Wao</Text>
                  </View>
                </View>
              </View>

              {/* Cụm Phải */}
              <View style={styles.rightContent}>
                <Text style={styles.dateText}>{formatDate(item.log_date)}</Text>
              </View>
            </View>
          );
        }}
        
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="scale-outline" size={48} color={colors.borderSoft} />
            <Text style={styles.emptyText}>Chưa có lịch sử cân nặng</Text>
          </View>
        }
      />
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerRightEmpty: {
    width: 36, // Approximate width of back button to keep title centered
  },
  
  // List
  listContent: {
    paddingHorizontal: 0,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16, // Giữ lại chút lề cho text tiêu đề khỏi dính sát mép
  },
  
  // Card Container
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceAlt || "#1E1E1E", // Fallback to dark gray
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  
  // Left Content
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.bgBase,
  },
  placeholderThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.bgBase,
    justifyContent: "center",
    alignItems: "center",
  },
  infoColumn: {
    flexDirection: "column",
    marginLeft: 12,
  },
  weightText: {
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  sourceText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  
  // Right Content
  rightContent: {
    justifyContent: "center",
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  
  // Empty
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
});
