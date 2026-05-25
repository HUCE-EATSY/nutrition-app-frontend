import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useStepsStore } from "@/store/statsStore";

export const HealthConnectBanner = () => {
  const router = useRouter();
  const { isConnected, checkConnection } = useStepsStore();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.integrationCard}>
      <Ionicons name="footsteps" size={24} color="#22C55E" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.integrationText}>Kích hoạt cảm biến bước chân để tự động cập nhật</Text>
        <TouchableOpacity onPress={() => router.push("/stats/steps")}>
          <Text style={styles.integrationLink}>Kích hoạt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  integrationCard: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  integrationText: { color: "#FFFFFF", fontSize: 14, marginBottom: 4 },
  integrationLink: { color: "#22C55E", fontSize: 14, fontWeight: "bold" },
});
