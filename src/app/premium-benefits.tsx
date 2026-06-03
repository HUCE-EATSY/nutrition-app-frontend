import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { PremiumFeatureCard } from "@/components/account/PremiumFeatureCard";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { useMySubscriptionQuery } from "@/hooks/queries/useSubscription";

// Các câu hỏi thường gặp về Premium
const FAQ_ITEMS = [
  {
    q: "Premium có thể dùng trên nhiều thiết bị không?",
    a: "Có! Tài khoản Premium của bạn hoạt động trên tất cả thiết bị đăng nhập cùng tài khoản.",
  },
  {
    q: "Tôi có thể hủy bất cứ lúc nào không?",
    a: "Gói Premium hiện tại không tự gia hạn. Bạn chỉ trả phí một lần và dùng đến hết hạn.",
  },
  {
    q: "Thanh toán có an toàn không?",
    a: "Hoàn toàn an toàn! Chúng tôi dùng VietQR NAPAS, không lưu thông tin thẻ của bạn.",
  },
  {
    q: "Nếu chưa nhận được Premium sau thanh toán?",
    a: "Liên hệ hỗ trợ qua email support@wao.health kèm ảnh chụp màn hình chuyển khoản.",
  },
];

export default function PremiumBenefitsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { data: subInfo, isLoading } = useMySubscriptionQuery();
  const isPremium = subInfo?.isPremium ?? false;

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("info");

  const triggerToast = (msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "🌟 Dùng WAO Premium để theo dõi dinh dưỡng và xây dựng thói quen ăn uống lành mạnh! Tải về ngay.",
      });
    } catch {
      triggerToast("Không thể chia sẻ.", "error");
    }
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Lợi ích Premium
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <LinearGradient
          colors={isPremium ? ["#FFD28D", "#FF9500"] : ["#A56CFF", "#5856D6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <Ionicons
            name={isPremium ? "sparkles" : "ribbon"}
            size={48}
            color="#fff"
            style={{ marginBottom: spacing.md }}
          />
          <Text style={styles.heroTitle}>
            {isPremium ? "Bạn đang là thành viên VIP! 🎉" : "Nâng cấp lên Premium"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isPremium
              ? `Gói của bạn: ${subInfo?.planName ?? "Premium"} — hết hạn ${subInfo?.expiresAt ? new Date(subInfo.expiresAt).toLocaleDateString("vi-VN") : "—"}`
              : "Mở khóa toàn bộ tính năng và xây dựng sức khỏe bền vững hơn"}
          </Text>
        </LinearGradient>

        {/* Premium status box */}
        {isPremium ? (
          <View style={[styles.statusCard, { backgroundColor: "rgba(52,199,89,0.1)", borderColor: "#34C759" }]}>
            <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            <Text style={[styles.statusText, { color: "#34C759" }]}>
              Tài khoản đã được kích hoạt Premium đầy đủ quyền!
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            style={[styles.upgradeCta, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-up-circle" size={22} color="#fff" />
            <Text style={styles.upgradeCtaText}>Nâng cấp ngay chỉ từ 59.000đ</Text>
          </TouchableOpacity>
        )}

        {/* Feature list */}
        <PremiumFeatureCard isPremium={isPremium} />

        {/* Comparison table */}
        <View style={[styles.tableCard, { backgroundColor: colors.surface }]}>
          <View style={styles.tableHeader}>
            <Ionicons name="list" size={18} color={colors.primary} />
            <Text style={[styles.tableTitle, { color: colors.textPrimary }]}>
              So sánh Free vs Premium
            </Text>
          </View>

          {[
            { feature: "Ghi nhật ký ăn uống", free: true, premium: true },
            { feature: "Thống kê hôm nay", free: true, premium: true },
            { feature: "Lịch sử 7 ngày", free: true, premium: true },
            { feature: "Lịch sử không giới hạn", free: false, premium: true },
            { feature: "Phân tích vi lượng", free: false, premium: true },
            { feature: "Báo cáo tuần/tháng", free: false, premium: true },
            { feature: "Thẻ đóng băng Streak", free: false, premium: true },
            { feature: "AI Mascot gợi ý thực đơn", free: false, premium: true },
          ].map((row, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, { borderColor: colors.border ?? "#E0E0E0" }]}
            >
              <Text style={[styles.tableFeature, { color: colors.textPrimary }]}>{row.feature}</Text>
              <Ionicons
                name={row.free ? "checkmark-circle" : "close-circle"}
                size={20}
                color={row.free ? "#34C759" : colors.textSecondary ?? "#999"}
              />
              <Ionicons name="checkmark-circle" size={20} color="#A56CFF" />
            </View>
          ))}

          <View style={styles.tableColumnLabels}>
            <Text style={[styles.colLabel, { color: colors.textSecondary }]}>Tính năng</Text>
            <Text style={[styles.colLabel, { color: colors.textSecondary }]}>Free</Text>
            <Text style={[styles.colLabel, { color: "#A56CFF" }]}>Premium</Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={[styles.faqCard, { backgroundColor: colors.surface }]}>
          <View style={styles.tableHeader}>
            <Ionicons name="help-circle" size={18} color={colors.primary} />
            <Text style={[styles.tableTitle, { color: colors.textPrimary }]}>
              Câu hỏi thường gặp
            </Text>
          </View>
          {FAQ_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              activeOpacity={0.8}
              style={[styles.faqItem, { borderColor: colors.border ?? "#E0E0E0" }]}
            >
              <View style={styles.faqQuestion}>
                <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{item.q}</Text>
                <Ionicons
                  name={expandedFaq === idx ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textSecondary ?? "#999"}
                />
              </View>
              {expandedFaq === idx && (
                <Text style={[styles.faqA, { color: colors.textSecondary }]}>{item.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom CTA */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => router.push("/premium")}
            style={[styles.bottomCta, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="crown" size={22} color="#FFD700" />
            <Text style={styles.bottomCtaText}>Mua Premium ngay</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={2500}
        onHide={() => setShowToast(false)}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { padding: spacing.xs },
  shareBtn: { padding: spacing.xs },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
  },
  heroBanner: {
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  statusText: {
    ...typography.bodyStrong,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  upgradeCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  upgradeCtaText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  tableCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tableTitle: {
    ...typography.bodyStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  tableFeature: {
    ...typography.body,
    fontSize: 13,
    flex: 1,
  },
  tableColumnLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  colLabel: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  faqCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQ: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    paddingRight: spacing.sm,
  },
  faqA: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  bottomCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radius.pill,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomCtaText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
