import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TargetListItem } from '../../../components/account/targets/TargetListItem';

import { ProgressRingChart } from '../../../components/charts/ProgressRingChart';
import { EnergyMetricsCard } from '../../../components/account/targets/EnergyMetricsCard';
import { useTranslation } from "@/constants/i18n";
import { useGetUserInfo } from '@/hooks/queries/useUserQueries';

export default function TargetCustomizationScreen() {
  const t = useTranslation();
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const { data: userInfo, isLoading } = useGetUserInfo();

  const activeGoal = userInfo?.activeGoal ?? userInfo?.ActiveGoal;
  const targetCalories = Math.round(activeGoal?.targetCalories ?? activeGoal?.TargetCalories ?? 2000);
  const bmr = Math.round(activeGoal?.bmrKcal ?? activeGoal?.BmrKcal ?? 1500);
  const tdee = Math.round(activeGoal?.tdeeKcal ?? activeGoal?.TdeeKcal ?? 2000);
  const addedCalories = targetCalories - tdee;

  // Calculate percentages based on macros if available
  const targetProteinG = activeGoal?.targetProteinG ?? activeGoal?.TargetProteinG ?? 120;
  const targetCarbsG = activeGoal?.targetCarbsG ?? activeGoal?.TargetCarbsG ?? 250;
  const targetFatG = activeGoal?.targetFatG ?? activeGoal?.TargetFatG ?? 67;

  const proteinCal = targetProteinG * 4;
  const carbsCal = targetCarbsG * 4;
  const fatCal = targetFatG * 9;
  const totalCal = proteinCal + carbsCal + fatCal;

  const proteinPct = totalCal > 0 ? Math.round((proteinCal / totalCal) * 100) : 20;
  const carbsPct = totalCal > 0 ? Math.round((carbsCal / totalCal) * 100) : 50;
  const fatPct = totalCal > 0 ? Math.max(0, 100 - proteinPct - carbsPct) : 30;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <ProgressRingChart percentage={proteinPct} color="#FF6B6B" label={t.targets.protein} />
          <ProgressRingChart percentage={carbsPct} color="#4D96FF" label={t.targets.carbs} />
          <ProgressRingChart percentage={fatPct} color="#FFD95A" label={t.targets.fat} />
        </View>

        <EnergyMetricsCard bmr={bmr} tdee={tdee} addedCalories={addedCalories} />


<<<<<<< HEAD

=======
>>>>>>> feature/update-frontend
        {/* Section 3: Other Targets */}
        <Text style={styles.sectionTitle}>{t.targets.otherTargets}</Text>
        <View style={styles.card}>
          <TargetListItem
            icon="footsteps-outline"
            iconColor="#FFB067"
            title={t.targets.stepTarget}
            onPress={() => router.push({ pathname: '/stats/steps', params: { openGoal: 'true' } })}
          />
          <TargetListItem
            icon="water-outline"
            iconColor="#4D96FF"
            title={t.targets.waterTarget}
            onPress={() => router.push('/account/targets/water')}
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

