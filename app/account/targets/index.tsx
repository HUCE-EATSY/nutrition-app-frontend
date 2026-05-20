import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TargetListItem } from '../../../components/account/targets/TargetListItem';

import { ProgressRingChart } from '../../../components/charts/ProgressRingChart';
import { EnergyMetricsCard } from '../../../components/account/targets/EnergyMetricsCard';

export default function TargetCustomizationScreen() {
  const router = useRouter();

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
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tuỳ chỉnh mục tiêu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Nutritional Information Card */}
        <View style={styles.macroRingContainer}>
          <View style={styles.caloCircle}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.caloValue}>{targetCalories}</Text>
            <Text style={styles.caloLabel}>CALO MỤC TIÊU</Text>
          </View>
          <ProgressRingChart percentage={20} color="#FF6B6B" label="Chất đạm" />
          <ProgressRingChart percentage={50} color="#4D96FF" label="Đường bột" />
          <ProgressRingChart percentage={30} color="#FFD95A" label="Chất béo" />
        </View>

        <EnergyMetricsCard bmr={bmr} tdee={tdee} addedCalories={addedCalories} />

        
        {/* Section 2: Nutrition Target Customization */}
        <Text style={styles.sectionTitle}>Tuỳ chỉnh mục tiêu dinh dưỡng</Text>
        <View style={styles.card}>
          <TargetListItem
            icon="flame-outline"
            iconColor="#FF6B6B"
            title="Calo mục tiêu"
            onPress={() => router.push('/account/targets/calories')}
          />
          <TargetListItem
            icon="pie-chart-outline"
            iconColor="#4ECDC4"
            title="Tỷ lệ dinh dưỡng đa lượng"
            onPress={() => router.push('/account/targets/macros')}
            showDivider={false}
          />
        </View>

        {/* Section 3: Other Targets */}
        <Text style={styles.sectionTitle}>Mục tiêu khác</Text>
        <View style={styles.card}>
          <TargetListItem
            icon="water-outline"
            iconColor="#4D96FF"
            title="Lượng nước"
            onPress={() => router.push('/account/targets/water')}
          />
          <TargetListItem
            icon="footsteps-outline"
            iconColor="#FFB067"
            title="Bước chân mục tiêu"
            onPress={() => router.push('/account/targets/steps')}
            showDivider={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120E24',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 24,
  },
  card: {
    backgroundColor: '#1F1A3A',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  caloLabel: {
    color: '#9E9E9E',
    fontSize: 11,
    textAlign: 'center',
  },
});

