import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { SafeScreen } from "@/components/layout/SafeScreen";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { apiClient, publicApiClient } from "@/services/apiClient";

interface PingResponse {
  status: string;
  message: string;
  serverTime: string;
  timestamp: number;
}

interface DbCheckResponse {
  status: string;
  database: string;
  latencyMs: number;
  userCount: number;
  message: string;
}

interface SystemInfoResponse {
  environment: {
    os: string;
    machineName: string;
    processorCount: number;
    runtimeVersion: string;
    workingSetMB: number;
    threadCount: number;
  };
  databaseStats: {
    totalFoods: number;
    totalFoodCategories: number;
    totalExercises: number;
    activeDailyPlans: number;
    totalStreaks: number;
  };
  message: string;
}

export default function DiagnosticsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  // Diagnostics States
  const [pingResult, setPingResult] = useState<PingResponse | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [dbResult, setDbResult] = useState<DbCheckResponse | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfoResponse | null>(null);

  // Connection Diagnostics Status
  const [networkStatus, setNetworkStatus] = useState<"unchecked" | "online" | "offline">("unchecked");
  const [dbStatus, setDbStatus] = useState<"unchecked" | "healthy" | "unhealthy">("unchecked");

  const triggerToast = (msg: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  const runDiagnostics = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setPingLatency(null);
    setPingResult(null);
    setDbResult(null);
    setSystemInfo(null);
    setNetworkStatus("unchecked");
    setDbStatus("unchecked");

    try {
      // 1. Ping test
      const pingStart = Date.now();
      const pingRes = await publicApiClient.get<PingResponse>("/api/diagnostics/ping");
      const pingEnd = Date.now();
      const latency = pingEnd - pingStart;

      setPingResult(pingRes.data);
      setPingLatency(latency);
      setNetworkStatus("online");

      // 2. DB connection test
      try {
        const dbRes = await publicApiClient.get<DbCheckResponse>("/api/diagnostics/db-check");
        setDbResult(dbRes.data);
        setDbStatus(dbRes.data.status === "Healthy" ? "healthy" : "unhealthy");
      } catch (dbErr) {
        console.warn("DB check failed during diagnostics:", dbErr);
        setDbStatus("unhealthy");
      }

      // 3. Get system stats
      try {
        const sysRes = await publicApiClient.get<SystemInfoResponse>("/api/diagnostics/system-info");
        setSystemInfo(sysRes.data);
      } catch (sysErr) {
        console.warn("System info fetch failed during diagnostics:", sysErr);
      }

      triggerToast("Chẩn đoán hệ thống hoàn tất!", "success");
    } catch (err: any) {
      console.error("Connection diagnostics failed:", err);
      setNetworkStatus("offline");
      setDbStatus("unhealthy");
      triggerToast("Không thể kết nối đến máy chủ Backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const triggerMockNotification = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiClient.post<{ message: string; title: string }>("/api/diagnostics/mock-alert");
      Alert.alert(
        "Kích hoạt thành công!",
        `Đã tạo thông báo giả lập trong CSDL: "${res.data.title}".\nBạn sẽ nhận được thông báo trong hộp thư.`,
        [{ text: "Đã hiểu", style: "default" }]
      );
      triggerToast("Đã kích hoạt thông báo!", "success");
    } catch (err: any) {
      console.error("Mock alert trigger failed:", err);
      const errMsg = err.response?.data?.message ?? "Không thể yêu cầu server gửi thông báo. Vui lòng đăng nhập lại.";
      Alert.alert("Lỗi", errMsg);
      triggerToast("Kích hoạt thông báo thất bại", "error");
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getLatencyColor = (latency: number) => {
    if (latency < 120) return "#34C759"; // Green
    if (latency < 300) return "#FF9500"; // Orange/Yellow
    return "#FF3B30"; // Red
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={15}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Chẩn đoán Kết nối
          </Text>
          <TouchableOpacity onPress={runDiagnostics} style={styles.iconBtn} hitSlop={15} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="refresh" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Main Status Card */}
          <LinearGradient
            colors={
              networkStatus === "online" && dbStatus === "healthy"
                ? ["#1C3A27", "#121F16"]
                : networkStatus === "offline"
                ? ["#3B1F21", "#241416"]
                : ["#2C2C2E", "#1C1C1E"]
            }
            style={styles.statusCard}
          >
            <View style={styles.statusRow}>
              <View style={styles.statusBadgeContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        networkStatus === "online" && dbStatus === "healthy"
                          ? "#34C759"
                          : networkStatus === "offline"
                          ? "#FF3B30"
                          : "#FF9500",
                    },
                  ]}
                />
                <Text style={styles.statusHeading}>
                  {networkStatus === "online" && dbStatus === "healthy"
                    ? "Hệ thống Bình thường"
                    : networkStatus === "offline"
                    ? "Mất kết nối Server"
                    : "Lỗi Cơ sở dữ liệu"}
                </Text>
              </View>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {networkStatus === "online"
                  ? `Đã liên kết với máy chủ. Độ trễ: ${pingLatency ?? 0}ms`
                  : "Vui lòng kiểm tra lại kết nối mạng hoặc ngrok bypass."}
              </Text>
            </View>
          </LinearGradient>

          {/* Connection Checklist Section */}
          <View style={[styles.panelCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.panelTitle, { color: colors.textSecondary }]}>
              KIỂM TRA HẠ TẦNG KẾT NỐI
            </Text>

            {/* Step 1: Internet & API Ping */}
            <View style={styles.checklistRow}>
              <Ionicons
                name={
                  networkStatus === "online"
                    ? "checkmark-circle"
                    : networkStatus === "offline"
                    ? "close-circle"
                    : "ellipse-outline"
                }
                size={24}
                color={
                  networkStatus === "online"
                    ? "#34C759"
                    : networkStatus === "offline"
                    ? "#FF3B30"
                    : colors.textMuted
                }
              />
              <View style={styles.checkTextContainer}>
                <Text style={[styles.checkLabel, { color: colors.textPrimary }]}>
                  Kết nối API Gateway (Ping/Pong)
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  {networkStatus === "online"
                    ? `Kết nối trực tuyến. Thông điệp máy chủ: "${pingResult?.message}"`
                    : networkStatus === "offline"
                    ? "Không thể phản hồi gói tin HTTP GET."
                    : "Chưa kiểm tra"}
                </Text>
              </View>
              {pingLatency !== null && (
                <Text style={[styles.latencyBadge, { color: getLatencyColor(pingLatency) }]}>
                  {pingLatency}ms
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Step 2: Database Connectivity */}
            <View style={styles.checklistRow}>
              <Ionicons
                name={
                  dbStatus === "healthy"
                    ? "checkmark-circle"
                    : dbStatus === "unhealthy"
                    ? "close-circle"
                    : "ellipse-outline"
                }
                size={24}
                color={
                  dbStatus === "healthy"
                    ? "#34C759"
                    : dbStatus === "unhealthy"
                    ? "#FF3B30"
                    : colors.textMuted
                }
              />
              <View style={styles.checkTextContainer}>
                <Text style={[styles.checkLabel, { color: colors.textPrimary }]}>
                  Liên kết SQL Server
                </Text>
                <Text style={[styles.checkDesc, { color: colors.textSecondary }]}>
                  {dbStatus === "healthy"
                    ? `Hoạt động tốt. ${dbResult?.database} (${dbResult?.userCount} users)`
                    : dbStatus === "unhealthy"
                    ? "Không kết nối được SQL Server hoặc Entity Framework gặp lỗi."
                    : "Chưa kiểm tra"}
                </Text>
              </View>
              {dbResult?.latencyMs !== undefined && (
                <Text style={[styles.latencyBadge, { color: getLatencyColor(dbResult.latencyMs) }]}>
                  {dbResult.latencyMs}ms
                </Text>
              )}
            </View>
          </View>

          {/* Server Environment Metrics */}
          {systemInfo && (
            <View style={[styles.panelCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.panelTitle, { color: colors.textSecondary }]}>
                THÔNG SỐ MÁY CHỦ BACKEND (.NET)
              </Text>
              
              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Hệ điều hành</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.environment.os}
                </Text>
              </View>
              
              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Bộ xử lý (Cores)</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.environment.processorCount} Cores
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Phiên bản Runtime</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  .NET {systemInfo.environment.runtimeVersion}
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>RAM Working Set</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.environment.workingSetMB} MB
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Số lượng Thread</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.environment.threadCount} Threads
                </Text>
              </View>
            </View>
          )}

          {/* Database Entities Metrics */}
          {systemInfo && (
            <View style={[styles.panelCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.panelTitle, { color: colors.textSecondary }]}>
                DỮ LIỆU ĐANG LƯU TRỮ (SQL SERVER)
              </Text>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Thực phẩm mẫu (Foods)</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.databaseStats.totalFoods} thực phẩm
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Phân loại thực phẩm</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.databaseStats.totalFoodCategories} nhóm
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Bài tập mẫu (Exercises)</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.databaseStats.totalExercises} bài tập
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Nhật ký ngày ăn uống</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.databaseStats.activeDailyPlans} kế hoạch
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: colors.textSecondary }]}>Chuỗi kỷ lục (Streaks)</Text>
                <Text style={[styles.specValue, { color: colors.textPrimary }]}>
                  {systemInfo.databaseStats.totalStreaks} chuỗi
                </Text>
              </View>
            </View>
          )}

          {/* Interaction Actions */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={triggerMockNotification}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#A56CFF", "#6236FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Kích hoạt Thông báo Hệ thống</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={[styles.actionTip, { color: colors.textSecondary }]}>
              Tính năng này gọi API tạo một thông báo chẩn đoán thực tế trên máy chủ Backend lưu vào tài khoản của bạn để xác minh luồng nhận thông báo đẩy tức thì.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Toast popup */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeScreen>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: "#2C2C2E",
    },
    iconBtn: {
      padding: spacing.xs,
    },
    headerTitle: {
      ...typography.h3,
      fontSize: 18,
      fontWeight: "700",
    },
    scrollContainer: {
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
      paddingTop: spacing.md,
    },
    statusCard: {
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: "#2C2C2E",
    },
    statusRow: {
      gap: spacing.xs,
    },
    statusBadgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statusHeading: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "800",
    },
    statusSubtitle: {
      fontSize: 13,
      lineHeight: 18,
    },
    panelCard: {
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.md,
    },
    panelTitle: {
      ...typography.caption,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    checklistRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    checkTextContainer: {
      flex: 1,
      gap: 2,
    },
    checkLabel: {
      ...typography.bodyStrong,
      fontSize: 14,
    },
    checkDesc: {
      ...typography.caption,
      fontSize: 12,
      lineHeight: 16,
    },
    latencyBadge: {
      fontSize: 14,
      fontWeight: "800",
    },
    divider: {
      height: 1,
      backgroundColor: "#2C2C2E",
    },
    specRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    specLabel: {
      ...typography.body,
      fontSize: 14,
    },
    specValue: {
      ...typography.bodyStrong,
      fontSize: 14,
    },
    actionSection: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    actionButton: {
      borderRadius: radius.md,
      overflow: "hidden",
      shadowColor: "#6236FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    actionGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    actionBtnText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
    actionTip: {
      ...typography.caption,
      fontSize: 11,
      lineHeight: 16,
      textAlign: "center",
      paddingHorizontal: spacing.sm,
    },
  });
