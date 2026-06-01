import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/hooks/useAppColors';
import { spacing, typography, radius } from '@/constants';
import { useWaterStore } from '@/store/waterStore';
import { useAuthStore } from '@/store/authStore';
import { GradientButton } from '@/components/buttons/GradientButton';
import { WaterPresetsGrid } from '@/components/water/WaterPresetsGrid';

export default function WaterTargetScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const userId = useAuthStore((state) => state.userInfo?.id) || "guest";
  const userWater = useWaterStore((state) => state.userWaterData[userId]);
  const { setWaterGoal, setDefaultStep } = useWaterStore();

  const currentGoal = userWater?.waterGoal ?? 2000;
  const currentStep = userWater?.defaultStep ?? 250;

  const [goal, setGoal] = useState(String(currentGoal));
  const [defaultStep, setDefaultStepLocal] = useState(String(currentStep));

  const handleSave = () => {
    const goalVal = parseInt(goal, 10);
    const stepVal = parseInt(defaultStep, 10);

    if (isNaN(goalVal) || goalVal <= 0) {
      Alert.alert("Lỗi nhập liệu", "Mục tiêu nước uống không hợp lệ.");
      return;
    }
    if (isNaN(stepVal) || stepVal <= 0) {
      Alert.alert("Lỗi nhập liệu", "Dung tích cốc không hợp lệ.");
      return;
    }

    setWaterGoal(userId, goalVal);
    setDefaultStep(userId, stepVal);
    router.back();
  };

  const setPresetGoal = (val: number) => {
    setGoal(String(val));
  };

  const setPresetStep = (val: number) => {
    setDefaultStepLocal(String(val));
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mục tiêu nước uống</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Daily Goal Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mục tiêu ngày</Text>
          
          <View style={[styles.inputContainer, { justifyContent: 'center', position: 'relative' }]}>
            <TextInput
              style={[styles.textInput, { textAlign: 'center' }]}
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={[styles.unitText, { position: 'absolute', right: 16 }]}>ml</Text>
          </View>
        </View>

        {/* Quick Add Cup Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thêm nhanh theo cốc</Text>
          <WaterPresetsGrid 
            onSelect={setPresetStep} 
            activePreset={parseInt(defaultStep, 10)}
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <GradientButton label="Lưu thay đổi" onPress={handleSave} />
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.textPrimary,
    ...typography.h3,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    ...typography.h3,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    ...typography.body,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  textInput: {
    alignSelf: 'center',
    color: colors.textPrimary,
    ...typography.h2,
    lineHeight: undefined,
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  unitText: {
    color: colors.textSecondary,
    ...typography.bodyStrong,
    marginLeft: spacing.sm,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  presetPill: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  presetPillText: {
    color: colors.carbs,
    ...typography.bodyStrong,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.bgBase,
  },
});
