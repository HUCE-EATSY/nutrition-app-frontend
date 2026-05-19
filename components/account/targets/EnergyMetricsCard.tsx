import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EnergyMetricsCardProps {
  bmr: number;
  tdee: number;
  addedCalories: number;
}

export function EnergyMetricsCard({ bmr, tdee, addedCalories }: EnergyMetricsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Tỷ lệ trao đổi chất cơ bản (BMR)</Text>
        <Text style={styles.value}>{bmr}</Text>
      </View>
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>Tổng năng lượng tiêu thụ mỗi ngày (TDEE)</Text>
        <Text style={styles.value}>{tdee}</Text>
      </View>
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>Calo cộng thêm</Text>
        <Text style={styles.value}>{addedCalories}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F1A3A',
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
    color: '#9E9E9E',
    fontSize: 14,
    flex: 1,
    paddingRight: 16,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D274E',
  },
});
