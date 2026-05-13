import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DateNavigatorProps {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export const DateNavigator = ({ label, onPrev, onNext }: DateNavigatorProps) => {
  return (
    <View style={styles.dateNavigator}>
      <TouchableOpacity onPress={onPrev} style={styles.navButton}>
        <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      <Text style={styles.dateRangeText}>{label}</Text>
      <TouchableOpacity onPress={onNext} style={styles.navButton}>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateNavigator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  dateRangeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  navButton: { padding: 4 },
});
