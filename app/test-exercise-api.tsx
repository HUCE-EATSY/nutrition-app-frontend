import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { exerciseService } from "@/services/exerciseService";
import { API_BASE } from "@/constants/api";

export default function TestExerciseAPIScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function testGetCategories() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log("Testing GET categories...");
      console.log("API URL:", `${API_BASE}/api/exercises/categories`);
      
      const data = await exerciseService.getCategories();
      console.log("Categories response:", data);
      setResult(data);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || err?.toString() || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function testCreateLog() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log("Testing POST create log...");
      
      // Lấy exercise ID đầu tiên từ categories
      const categories = await exerciseService.getCategories();
      if (!categories || categories.length === 0 || !categories[0].exercises || categories[0].exercises.length === 0) {
        throw new Error("No exercises found");
      }
      
      const firstExercise = categories[0].exercises[0];
      console.log("Using exercise:", firstExercise);
      
      const logData = {
        exerciseId: firstExercise.id,
        logDate: new Date().toISOString().split("T")[0],
        durationMinutes: 30,
        intensity: 2 as 1 | 2 | 3,
        notes: "Test from debug screen",
      };
      
      console.log("Creating log with data:", logData);
      const data = await exerciseService.createLog(logData);
      console.log("Create log response:", data);
      setResult(data);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.response?.data?.message || err?.message || err?.toString() || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function testGetLogs() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      console.log("Testing GET logs...");
      
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startDateISO = startDate.toISOString().split("T")[0];
      
      console.log("Date range:", startDateISO, "to", endDate);
      const data = await exerciseService.getLogs(startDateISO, endDate);
      console.log("Logs response:", data);
      setResult(data);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || err?.toString() || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Test Exercise API</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.infoText}>API Base: {API_BASE}</Text>

        {/* Test Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable
            style={styles.testButton}
            onPress={testGetCategories}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test GET Categories</Text>
          </Pressable>

          <Pressable
            style={styles.testButton}
            onPress={testCreateLog}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test POST Create Log</Text>
          </Pressable>

          <Pressable
            style={styles.testButton}
            onPress={testGetLogs}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>Test GET Logs</Text>
          </Pressable>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Testing...</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons color={colors.danger} name="alert-circle" size={32} />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons color={colors.success} name="checkmark-circle" size={24} />
              <Text style={styles.resultTitle}>Success</Text>
            </View>
            <ScrollView style={styles.resultScroll} horizontal>
              <Text style={styles.resultText}>
                {JSON.stringify(result, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  testButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  testButtonText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
  loadingContainer: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: "rgba(255,107,107,0.1)",
    borderRadius: radius.sm,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
  },
  errorTitle: {
    ...typography.h3,
    color: colors.danger,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
  },
  resultContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.lg,
    gap: spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  resultTitle: {
    ...typography.h3,
    color: colors.success,
  },
  resultScroll: {
    maxHeight: 400,
  },
  resultText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: "monospace",
  },
});
