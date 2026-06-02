import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Dimensions,
  Clipboard,
} from "react-native";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { radius, spacing, typography } from "@/constants";
import { useSettingsStore } from "@/store/settingsStore";
import {
  useMySubscriptionQuery,
  useCreateOrderMutation,
  useOrderStatusQuery,
  useMockCallbackMutation,
  useSubscriptionPlansQuery,
} from "@/hooks/queries/useSubscription";
import { SubscriptionPlan } from "@/services/subscriptionService";

const { width } = Dimensions.get("window");

export default function PremiumScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const themeMode = useSettingsStore((state) => state.theme);

  // Get active subscription info
  const { data: subInfo, isLoading: isLoadingSub, refetch: refetchSub } = useMySubscriptionQuery();
  const { data: plans, isLoading: isLoadingPlans } = useSubscriptionPlansQuery();
  const createOrderMutation = useCreateOrderMutation();
  const mockCallbackMutation = useMockCallbackMutation();

  // Chọn plan mặc định là plan đầu tiên khi plans đã load
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Tự động chọn plan đầu tiên khi data load xong
  useEffect(() => {
    if (plans && plans.length > 0 && selectedPlanId === null) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);
  const [activeOrderAmount, setActiveOrderAmount] = useState<number | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState<any>(null);

  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Monitor AppState to pause polling when backgrounded
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Poll order status if we have a pending order and app is active
  const isPollingActive = !!activeOrderId;
  const { data: orderStatus } = useOrderStatusQuery(
    activeOrderId || "",
    isPollingActive && appState === "active"
  );

  // Monitor order status changes
  useEffect(() => {
    if (orderStatus?.status === "PAID") {
      Alert.alert(
        "🎉 Thành công",
        "Gói cước Premium của bạn đã được kích hoạt thành công!",
        [{ text: "Tuyệt vời", onPress: handlePaymentSuccess }]
      );
    }
  }, [orderStatus]);

  const handlePaymentSuccess = () => {
    setActiveOrderId(null);
    setActiveQrUrl(null);
    setActiveOrderAmount(null);
    setActiveOrderDetails(null);
    refetchSub();
  };

  const handleSelectPlan = (planId: number) => {
    setSelectedPlanId(planId);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) {
      Alert.alert("Thông báo", "Vui lòng chọn một gói cước.");
      return;
    }
    try {
      const response = await createOrderMutation.mutateAsync(selectedPlanId);
      if (response) {
        setActiveOrderId(response.orderId);
        setActiveQrUrl(response.qrUrl);
        setActiveOrderAmount(response.amount);
        setActiveOrderDetails(response);
      }
    } catch (error) {
      console.error("Create order failed:", error);
      Alert.alert("Lỗi", "Không thể tạo đơn hàng thanh toán. Vui lòng thử lại sau.");
    }
  };

  const handleMockTestPayment = async () => {
    if (!activeOrderId) return;
    try {
      const response = await mockCallbackMutation.mutateAsync(activeOrderId);
      if (response && response.success) {
        Alert.alert(
          "🎉 [TEST MOCK]",
          "Đã giả lập thanh toán thành công! Gói Premium đã kích hoạt.",
          [{ text: "OK", onPress: handlePaymentSuccess }]
        );
      }
    } catch (error) {
      console.error("Mock payment failed:", error);
      Alert.alert("Lỗi", "Giả lập thanh toán thất bại.");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("Đã sao chép", `${label} đã được lưu vào khay nhớ tạm.`);
  };

  const handleCancelOrder = () => {
    setActiveOrderId(null);
    setActiveQrUrl(null);
    setActiveOrderAmount(null);
    setActiveOrderDetails(null);
  };

  const isPremium = subInfo?.isPremium;

  if (isLoadingSub || isLoadingPlans) {
    return (
      <SafeScreen>
        <View style={[styles.centered, { flex: 1, backgroundColor: colors.bgBase }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase }}>
      <SafeScreen scrollable contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>WAO Premium</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isPremium ? (
            /* VIP Active Card UI */
            <View style={styles.vipContainer}>
            <LinearGradient
              colors={["#FFD28D", "#FF9500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vipCard}
            >
              <View style={styles.vipHeader}>
                <View>
                  <Text style={styles.vipBadge}>VIP MEMBER</Text>
                  <Text style={styles.vipName}>{subInfo.planName}</Text>
                </View>
                <Ionicons name="sparkles" size={32} color="#4A3400" />
              </View>

              <View style={styles.vipFooter}>
                <Text style={styles.vipExpiryLabel}>HẠN SỬ DỤNG</Text>
                <Text style={styles.vipExpiryValue}>
                  {subInfo.expiresAt
                    ? new Date(subInfo.expiresAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Không xác định"}
                </Text>
              </View>
            </LinearGradient>

            <View style={[styles.statusBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={[styles.statusText, { color: colors.textPrimary }]}>
                Tài khoản của bạn đã được nâng cấp Premium. Hãy tận hưởng mọi tính năng đặc quyền!
              </Text>
            </View>

            <Pressable
              onPress={() => router.replace("/(tabs)/account")}
              style={[styles.backToAccountBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.backToAccountBtnText}>Quay lại cá nhân</Text>
            </Pressable>
          </View>
        ) : activeQrUrl ? (
          /* QR Payment Scanning UI */
          <View style={styles.qrContainer}>
            <Text style={[styles.qrTitle, { color: colors.textPrimary }]}>Quét Mã Để Nâng Cấp</Text>
            <Text style={[styles.qrSubtitle, { color: colors.textSecondary }]}>
              Mở app ngân hàng bất kỳ của bạn để quét mã QR và hoàn tất chuyển khoản tự động.
            </Text>

            {/* QR Wrapper Card */}
            <View style={[styles.qrWrapperCard, { backgroundColor: "#FFFFFF" }]}>
              <Image source={{ uri: activeQrUrl }} style={styles.qrImage} resizeMode="contain" />
              <View style={styles.pendingIndicator}>
                <ActivityIndicator size="small" color="#FF9500" style={{ marginRight: 8 }} />
                <Text style={styles.pendingText}>Đang chờ thanh toán tự động...</Text>
              </View>
            </View>

            {/* Transaction Details */}
            <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Gói cước:</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {activeOrderDetails?.planName}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Số tiền:</Text>
                <Text style={[styles.detailValue, { color: colors.primary, fontWeight: "bold" }]}>
                  {activeOrderAmount?.toLocaleString("vi-VN")} đ
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nội dung chuyển khoản:</Text>
                <View style={styles.copyableValueContainer}>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    Thanh toan {activeOrderId}
                  </Text>
                  <Pressable
                    onPress={() => copyToClipboard(`Thanh toan ${activeOrderId}`, "Nội dung")}
                    style={styles.copyBtn}
                  >
                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tài khoản thụ hưởng:</Text>
                <View style={styles.copyableValueContainer}>
                  <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                    {activeOrderDetails?.accountNo} ({activeOrderDetails?.bankId.toUpperCase()})
                  </Text>
                  <Pressable
                    onPress={() => copyToClipboard(activeOrderDetails?.accountNo || "", "Số tài khoản")}
                    style={styles.copyBtn}
                  >
                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Simulated webhook button for Dev Mode */}
            <Pressable onPress={handleMockTestPayment} style={styles.mockTestBtn}>
              <Ionicons name="flask-outline" size={18} color="#FF9500" style={{ marginRight: 6 }} />
              <Text style={styles.mockTestBtnText}>[Test] Giả lập Webhook Thanh Toán</Text>
            </Pressable>

            {/* Cancel transaction button */}
            <Pressable onPress={handleCancelOrder} style={styles.cancelBtn}>
              <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Hủy giao dịch</Text>
            </Pressable>
          </View>
        ) : (
          /* Subscription Plans & Showcase UI */
          <View>
            {/* Promo Showcase Banner */}
            <LinearGradient
              colors={themeMode === "light" ? ["#FFFFFF", "#FFF5D1"] : ["#1E1B2E", "#2B1A40"]}
              style={styles.promoBanner}
            >
              <Ionicons name="ribbon" size={48} color="#FFD95A" style={{ marginBottom: spacing.md }} />
              <Text style={[styles.promoTitle, { color: colors.textPrimary }]}>
                Mở Khóa Toàn Bộ Quyền Năng
              </Text>
              <Text style={[styles.promoSubtitle, { color: colors.textSecondary }]}>
                Nâng cấp Premium ngay hôm nay để nhận các phân tích sức khỏe nâng cao và các gợi ý chuyên sâu.
              </Text>
            </LinearGradient>

            {/* Feature lists */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconBg, { backgroundColor: "rgba(165,108,255,0.15)" }]}>
                  <Ionicons name="sparkles" size={20} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                    Gợi ý thực đơn cá nhân hóa từ AI Mascot
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    Nhận đề xuất dinh dưỡng chính xác 24/7 từ linh vật mascot của bạn.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBg, { backgroundColor: "rgba(52,199,89,0.15)" }]}>
                  <Ionicons name="analytics" size={20} color="#34C759" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                    Phân tích vi lượng sâu hơn
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    Xem chi tiết chỉ số chất xơ, đường, natri trong từng bữa ăn.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIconBg, { backgroundColor: "rgba(255,149,0,0.15)" }]}>
                  <Ionicons name="infinite" size={20} color="#FF9500" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                    Không giới hạn lịch sử ghi chép
                  </Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                    Xem và tra cứu nhật ký của bạn bất kỳ lúc nào từ trước tới nay.
                  </Text>
                </View>
              </View>
            </View>

            {/* Pricing Section */}
            <Text style={[styles.pricingSectionTitle, { color: colors.textPrimary }]}>
              Chọn Gói Phù Hợp Với Bạn
            </Text>

            <View style={styles.plansRow}>
              {(plans ?? []).map((plan: SubscriptionPlan, index: number) => (
                <Pressable
                  key={plan.id}
                  onPress={() => handleSelectPlan(plan.id)}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.surface },
                    selectedPlanId === plan.id && { borderColor: colors.primary, borderWidth: 2 },
                  ]}
                >
                  {/* Badge "Tiết kiệm" cho plan có thời hạn dài nhất */}
                  {index === (plans?.length ?? 0) - 1 && (plans?.length ?? 0) > 1 && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>TIẾT KIỆM</Text>
                    </View>
                  )}
                  <Text style={[styles.planCardName, { color: colors.textPrimary }]}>{plan.name}</Text>
                  <Text style={[styles.planCardPrice, { color: colors.primary }]}>{formatPrice(plan.price)}</Text>
                  <Text style={[styles.planCardDuration, { color: colors.textMuted }]}>
                    {plan.durationDays >= 365 ? "Mỗi năm" : "Mỗi tháng"}
                  </Text>
                  {selectedPlanId === plan.id && (
                    <View style={[styles.selectedCheck, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Purchase CTA */}
            <Pressable
              onPress={handlePurchase}
              disabled={createOrderMutation.isPending}
              style={[
                styles.purchaseBtn,
                { backgroundColor: colors.primary },
                createOrderMutation.isPending && { opacity: 0.7 },
              ]}
            >
              {createOrderMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.purchaseBtnText}>Nâng cấp ngay</Text>
              )}
            </Pressable>

            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              Hỗ trợ thanh toán an toàn chuyển khoản NAPAS VietQR tự động khớp đơn hàng. Bạn sẽ nhận được
              Premium ngay sau khi thanh toán thành công.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  vipContainer: {
    marginTop: spacing.md,
    alignItems: "center",
  },
  vipCard: {
    width: "100%",
    height: 200,
    borderRadius: radius.lg,
    padding: spacing.xl,
    justifyContent: "space-between",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: spacing.xxl,
  },
  vipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  vipBadge: {
    ...typography.caption,
    fontWeight: "bold",
    color: "#4A3400",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  vipName: {
    ...typography.h2,
    color: "#4A3400",
    fontWeight: "900",
    fontSize: 24,
  },
  vipFooter: {
    alignItems: "flex-start",
  },
  vipExpiryLabel: {
    ...typography.caption,
    fontSize: 10,
    color: "#6F4E00",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  vipExpiryValue: {
    ...typography.bodyStrong,
    color: "#4A3400",
    fontSize: 16,
    fontWeight: "800",
  },
  statusBox: {
    flexDirection: "row",
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: "100%",
  },
  statusText: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  backToAccountBtn: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: spacing.md,
  },
  backToAccountBtnText: {
    ...typography.bodyStrong,
    color: "#FFFFFF",
    fontSize: 16,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  qrTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  qrSubtitle: {
    ...typography.body,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  qrWrapperCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.xl,
    width: 280,
    height: 340,
  },
  qrImage: {
    width: 220,
    height: 220,
    marginBottom: spacing.lg,
  },
  pendingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingText: {
    ...typography.caption,
    color: "#FF9500",
    fontWeight: "bold",
  },
  detailsCard: {
    width: "100%",
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 13,
  },
  detailValue: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  copyableValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  copyBtn: {
    padding: 4,
  },
  mockTestBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,149,0,0.1)",
    borderColor: "#FF9500",
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    marginBottom: spacing.xl,
  },
  mockTestBtnText: {
    ...typography.bodyStrong,
    color: "#FF9500",
    fontSize: 13,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
  },
  cancelBtnText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  promoBanner: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  promoTitle: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  promoSubtitle: {
    ...typography.body,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  featuresList: {
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  featureItem: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyStrong,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  featureDesc: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
  },
  pricingSectionTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  plansRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  planCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 2,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: "#FFD95A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  popularBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: "bold",
    color: "#4A3400",
  },
  planCardName: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: spacing.xs,
  },
  planCardPrice: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  planCardDuration: {
    ...typography.caption,
    fontSize: 12,
  },
  selectedCheck: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseBtn: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    marginBottom: spacing.lg,
  },
  purchaseBtnText: {
    ...typography.bodyStrong,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsText: {
    ...typography.caption,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
