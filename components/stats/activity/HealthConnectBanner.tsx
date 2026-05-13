import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const HealthConnectBanner = () => {
  return (
    <View style={styles.integrationCard}>
      <Ionicons name="fitness" size={24} color="#8B5CF6" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.integrationText}>Kết nối Health Connect để tự động cập nhật</Text>
        <TouchableOpacity>
          <Text style={styles.integrationLink}>Kết nối ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  integrationCard: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  integrationText: { color: "#FFFFFF", fontSize: 14, marginBottom: 4 },
  integrationLink: { color: "#8B5CF6", fontSize: 14, fontWeight: "bold" },
});
