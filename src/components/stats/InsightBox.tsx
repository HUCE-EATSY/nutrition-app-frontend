import React from "react";
import { colors } from "@/constants";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InsightBoxProps {
  message: string;
}

export const InsightBox = ({ message }: InsightBoxProps) => {
  return (
    <View style={styles.insightBox}>
      <Ionicons name="sparkles" size={20} color={colors.primary} />
      <Text style={styles.insightText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  insightBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  insightText: {
    color: "#E0E7FF",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
