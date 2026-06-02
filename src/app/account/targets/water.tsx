import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { useWaterStore } from "@/store/waterStore";
import { useAuthStore } from "@/store/authStore";
import { GradientButton } from "@/components/buttons/GradientButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { WaterPresetsGrid } from "@/components/water/WaterPresetsGrid";

export default function WaterTargetScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  
  const userId = useAuthStore((state) => state.userInfo?.id || "guest");
  const userWater = useWaterStore((state) => state.userWaterData[userId] || { waterGoal: 2000, waterLogs: {}, defaultStep: 250 });
  const setWaterGoal = useWaterStore((state) => state.setWaterGoal);
  const [goal, setGoal] = useState(userWater.waterGoal);

  const handleSave = () => {
    if (isNaN(goal) || goal <= 0) {
      Alert.alert("Lỗi nhập liệu", "Mục tiêu nước uống phải lớn hơn 0.");
      return;
    }
    setWaterGoal(userId, goal);
    router.back();
  };

  const handleQuickAdd = (amount: number) => {
    setGoal((prev: number) => prev + amount);
  };

  const handleQuickSubtract = (amount: number) => {
    setGoal((prev: number) => Math.max(0, prev - amount));
  };


  const handleGoalChange = (text: string) => {
    const val = parseInt(text.replace(/[^0-9]/g, ""), 10);
    setGoal(isNaN(val) ? 0 : val);
  };

  return (
    <SafeScreen contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={15}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Mục tiêu lượng nước</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Stepper controls for Goal */}
          <QuantityStepper
            label="Mục tiêu ngày"
            value={goal}
            unit="ml"
            step={250}
            onChange={handleGoalChange}
            onAdd={handleQuickAdd}
            onSubtract={handleQuickSubtract}
          />

          {/* Presets Grid */}
          <WaterPresetsGrid onAdd={handleQuickAdd} />
        </ScrollView>

        {/* Footer Save Button */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <GradientButton label="Lưu thay đổi" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  flex1: {
    flex: 1,
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
