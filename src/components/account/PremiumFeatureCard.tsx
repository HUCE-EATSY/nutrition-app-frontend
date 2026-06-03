import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type Feature = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
  title: string;
  desc: string;
  premiumOnly: boolean;
};

const PREMIUM_FEATURES: Feature[] = [
  {
    icon: "sparkles",
    color: "#A56CFF",
    bg: "rgba(165,108,255,0.12)",
    title: "Gợi ý thực đơn AI Mascot",
    desc: "Nhận đề xuất dinh dưỡng cá nhân hóa 24/7.",
    premiumOnly: true,
  },
  {
    icon: "analytics",
    color: "#34C759",
    bg: "rgba(52,199,89,0.12)",
    title: "Phân tích vi lượng sâu",
    desc: "Xem chất xơ, đường, natri, vi khoáng theo từng bữa.",
    premiumOnly: true,
  },
  {
    icon: "infinite",
    color: "#FF9500",
    bg: "rgba(255,149,0,0.12)",
    title: "Lịch sử không giới hạn",
    desc: "Tra cứu nhật ký từ bất kỳ ngày nào trong quá khứ.",
    premiumOnly: true,
  },
  {
    icon: "shield-checkmark",
    color: "#5856D6",
    bg: "rgba(88,86,214,0.12)",
    title: "Thẻ đóng băng Streak",
    desc: "Dùng thẻ để bảo vệ chuỗi ngày khi lỡ một ngày.",
    premiumOnly: true,
  },
  {
    icon: "bar-chart",
    color: "#FF2D55",
    bg: "rgba(255,45,85,0.12)",
    title: "Báo cáo tuần & tháng",
    desc: "Xem tổng kết cân bằng calo và xu hướng dinh dưỡng.",
    premiumOnly: true,
  },
  {
    icon: "notifications",
    color: "#FF9500",
    bg: "rgba(255,149,0,0.12)",
    title: "Nhắc nhở thông minh",
    desc: "Nhận thông báo đúng thời điểm để không bỏ lỡ bữa ăn.",
    premiumOnly: false,
  },
];

type Props = {
  isPremium?: boolean;
};

export function PremiumFeatureCard({ isPremium = false }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="ribbon" size={20} color="#FFD700" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Tính năng Premium
        </Text>
      </View>

      <View style={styles.featureList}>
        {PREMIUM_FEATURES.map((f, idx) => (
          <View key={idx} style={styles.featureRow}>
            <View style={[styles.iconBox, { backgroundColor: f.bg }]}>
              <Ionicons name={f.icon} size={18} color={f.color} />
            </View>
            <View style={styles.featureText}>
              <View style={styles.titleRow}>
                <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
                  {f.title}
                </Text>
                {f.premiumOnly && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>VIP</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                {f.desc}
              </Text>
            </View>
            {isPremium ? (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            ) : f.premiumOnly ? (
              <Ionicons name="lock-closed" size={18} color={colors.textSecondary ?? "#999"} />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  featureList: { gap: spacing.md },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  featureTitle: {
    ...typography.bodyStrong,
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: "700",
    color: "#4A3400",
  },
  featureDesc: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});
