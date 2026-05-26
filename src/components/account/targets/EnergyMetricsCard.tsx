import React from 'react';
import { colors } from "@/constants";
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from "@/constants/i18n";

interface EnergyMetricsCardProps {
  bmr: number;
  tdee: number;
  addedCalories: number;
}

export function EnergyMetricsCard({ bmr, tdee, addedCalories }: EnergyMetricsCardProps) {
  const t = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{t.targets.bmrLabel}</Text>
        <Text style={styles.value}>{bmr}</Text>
      </View>
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>{t.targets.tdeeLabel}</Text>
        <Text style={styles.value}>{tdee}</Text>
      </View>
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>{t.targets.addedCalLabel}</Text>
        <Text style={styles.value}>{addedCalories}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
    paddingRight: 16,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },
});
