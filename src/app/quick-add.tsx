import React, { useMemo } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { useResponsiveLayout } from "@/constants/responsive";
import { useTranslation } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";

export default function QuickAddModal() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { isCompactWidth } = useResponsiveLayout();
  const theme = useSettingsStore((state) => state.theme);
  // Tính toán chiều cao Tab Bar để Faux Tab Bar che khít vị trí thực
  const tabBarHeight = (isCompactWidth ? 72 : 84) + Math.max(insets.bottom, 8);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const handleNavigate = (path: string) => {
    router.navigate(path);
  };

  const handleToast = (feature: string) => {
    Alert.alert(t.quickAdd.comingSoon, t.quickAdd.featureUnderDev(feature));
  };

  // BlurView trên Android cực kỳ nặng và gây lag animation, ta dùng màu nền trong suốt làm fallback
  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { intensity: 30, tint: theme === "light" ? "light" : "dark", style: styles.container } as any
    : { style: [styles.container, { backgroundColor: theme === "light" ? "rgba(244, 245, 247, 0.9)" : "rgba(18, 16, 25, 0.9)" }] } as any;

  return (
    <Container {...containerProps}>
      {/* Không gian bấm ra ngoài để đóng */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Action Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: tabBarHeight + spacing.xl }]}>
        
        {/* Row 1: Primary Actions (4-Col Grid) */}
        <View style={styles.primaryGrid}>
          <Pressable style={styles.primaryItem} onPress={() => handleNavigate("/(tabs)/diary")}>
            <View style={[styles.primaryIconBox, { backgroundColor: colors.warning }]}>
              <Ionicons name="search" size={24} color="#FFF" />
            </View>
            <Text style={styles.primaryText}>{t.quickAdd.logMeal}</Text>
          </Pressable>

          <Pressable style={styles.primaryItem} onPress={() => handleNavigate("/scan-barcode")}>
            <View style={[styles.primaryIconBox, { backgroundColor: "#3D8BFF" }]}>
              <Ionicons name="barcode-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.primaryText}>{t.quickAdd.scanCode}</Text>
          </Pressable>

          <Pressable style={styles.primaryItem} onPress={() => handleNavigate("/detect-food")}>
            <View style={[styles.primaryIconBox, { backgroundColor: colors.success }]}>
              <Ionicons name="sparkles-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.primaryText}>{t.quickAdd.aiRecognize}</Text>
          </Pressable>

          <Pressable style={styles.primaryItem} onPress={() => handleToast(t.quickAdd.voiceRecord)}>
            <View style={[styles.primaryIconBox, { backgroundColor: colors.danger }]}>
              <Ionicons name="mic-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.primaryText}>{t.quickAdd.voiceRecord}</Text>
          </Pressable>
        </View>

        {/* Row 2-4: Secondary Features (2-Col Grid) */}
        <View style={styles.secondaryGrid}>
          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/log-water")}>
            <MaterialCommunityIcons name="cup-water" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.water}</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/(tabs)/meal-plan")}>
            <Ionicons name="nutrition-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.recipeSuggestions}</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/add-exercise")}>
            <MaterialCommunityIcons name="fire" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.logActivity}</Text>
          </Pressable>

          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/log-weight")}>
            <MaterialCommunityIcons name="scale-bathroom" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.weight}</Text>
          </Pressable>

          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/create-recipe")}>
            <MaterialCommunityIcons name="book-plus-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.createRecipe}</Text>
          </Pressable>

          <Pressable style={styles.secondaryCard} onPress={() => handleNavigate("/create-food")}>
            <MaterialCommunityIcons name="bowl-mix-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.secondaryText}>{t.quickAdd.createFood}</Text>
          </Pressable>
        </View>
      </View>

      {/* Faux Tab Bar - Giả lập thanh điều hướng đáy */}
      <View style={[styles.fauxTabBar, { height: tabBarHeight, paddingBottom: Math.max(insets.bottom, 10), paddingTop: isCompactWidth ? 8 : 10 }]}>
        <Pressable style={styles.fauxTabItem} onPress={() => handleNavigate("/(tabs)/home")}>
          <Ionicons name="sparkles-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.fauxTabLabel, isCompactWidth && styles.fauxTabLabelCompact]}>{t.navigation.home}</Text>
        </Pressable>
        <Pressable style={styles.fauxTabItem} onPress={() => handleNavigate("/(tabs)/diary")}>
          <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.fauxTabLabel, isCompactWidth && styles.fauxTabLabelCompact]}>{t.navigation.diary}</Text>
        </Pressable>

        {/* Center Close FAB */}
        <View style={[styles.quickAddWrap, isCompactWidth && styles.quickAddWrapCompact]}>
          <Pressable onPress={handleClose} style={[styles.quickAddButton, isCompactWidth && styles.quickAddButtonCompact]}>
            <Ionicons color={colors.textPrimary} name="close" size={28} />
          </Pressable>
        </View>

        <Pressable style={styles.fauxTabItem} onPress={() => handleNavigate("/(tabs)/meal-plan")}>
          <Ionicons name="restaurant-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.fauxTabLabel, isCompactWidth && styles.fauxTabLabelCompact]}>{t.navigation.mealPlan}</Text>
        </Pressable>
        <Pressable style={styles.fauxTabItem} onPress={() => handleNavigate("/(tabs)/account")}>
          <Ionicons name="person-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.fauxTabLabel, isCompactWidth && styles.fauxTabLabelCompact]}>{t.navigation.account}</Text>
        </Pressable>
      </View>
    </Container>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.bgBase, // Tạo khối màu cho phần nửa dưới
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    gap: spacing.xl,
  },
  primaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryItem: {
    alignItems: "center",
    gap: spacing.sm,
    width: "22%",
  },
  primaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: "center",
  },
  secondaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  secondaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    width: "48%", // 2 cột
  },
  secondaryText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  fauxTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  fauxTabItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
    gap: 2,
  },
  fauxTabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  fauxTabLabelCompact: {
    fontSize: 10,
  },
  quickAddWrap: {
    top: -18,
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
  },
  quickAddWrapCompact: {
    top: -12,
  },
  quickAddButton: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: colors.bgBase,
    // Hiệu ứng phát sáng
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  quickAddButtonCompact: {
    width: 56,
    height: 56,
  },
});
