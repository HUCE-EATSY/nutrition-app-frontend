import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TargetListItem } from '../../../components/account/targets/TargetListItem';

import { ProgressRingChart } from '../../../components/charts/ProgressRingChart';
import { EnergyMetricsCard } from '../../../components/account/targets/EnergyMetricsCard';
import { useTranslation } from "@/constants/i18n";

export default function TargetCustomizationScreen() {
  const t = useTranslation();
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Mock data for display
  const targetCalories = 2229;
  const bmr = 1461;
  const tdee = 2009;
  const addedCalories = 220;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.targets.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Nutritional Information Card */}
        <View style={styles.macroRingContainer}>
          <View style={styles.caloCircle}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.caloValue}>{targetCalories}</Text>
            <Text style={styles.caloLabel}>{t.targets.calorieGoal}</Text>
          </View>
          <ProgressRingChart percentage={20} color="#FF6B6B" label={t.targets.protein} />
          <ProgressRingChart percentage={50} color="#4D96FF" label={t.targets.carbs} />
          <ProgressRingChart percentage={30} color="#FFD95A" label={t.targets.fat} />
        </View>

        <EnergyMetricsCard bmr={bmr} tdee={tdee} addedCalories={addedCalories} />

        
        {/* Section 2: Nutrition Target Customization */}
        <Text style={styles.sectionTitle}>{t.targets.nutritionCustomize}</Text>
        <View style={styles.card}>
          <TargetListItem
            icon="flame-outline"
            iconColor="#FF6B6B"
            title={t.targets.calorieTarget}
            onPress={() => router.push('/account/targets/calories')}
          />
          <TargetListItem
            icon="pie-chart-outline"
            iconColor="#4ECDC4"
            title={t.targets.macroRatio}
            onPress={() => router.push('/account/targets/macros')}
            showDivider={false}
          />
        </View>

        {/* Section 3: Other Targets */}
        <Text style={styles.sectionTitle}>{t.targets.otherTargets}</Text>
        <View style={styles.card}>
          <TargetListItem
            icon="water-outline"
            iconColor="#4D96FF"
            title={t.targets.waterTarget}
            onPress={() => router.push('/account/targets/water')}
          />
          <TargetListItem
            icon="footsteps-outline"
            iconColor="#FFB067"
            title={t.targets.stepTarget}
            onPress={() => router.push('/account/targets/steps')}
            showDivider={false}
          />
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32, // To balance the back button
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    overflow: 'hidden',
  },
  macroRingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  caloCircle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  caloLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
});

