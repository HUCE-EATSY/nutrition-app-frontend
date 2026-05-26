import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { useAppColors } from "@/hooks/useAppColors";
import { useSettingsStore } from "@/store/settingsStore";
import { radius, spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";

interface DocSection {
  title: string;
  content: string;
}

const termsVi: DocSection[] = [
  {
    title: "1. Chấp nhận điều khoản",
    content: "Khi truy cập và sử dụng ứng dụng DNT, bạn đồng ý tuân thủ các Điều khoản sử dụng này cũng như tất cả các luật và quy định hiện hành liên quan."
  },
  {
    title: "2. Quyền sở hữu trí tuệ",
    content: "Toàn bộ nội dung, giao diện thiết kế, logo, mã nguồn và dữ liệu cấu trúc trong ứng dụng DNT thuộc sở hữu trí tuệ của chúng tôi hoặc các bên cấp phép liên quan. Bạn không được tự ý sao chép, trích xuất hoặc phân phối lại khi chưa có sự đồng ý bằng văn bản từ chúng tôi."
  },
  {
    title: "3. Tài khoản người dùng",
    content: "Bạn chịu trách nhiệm hoàn toàn về việc bảo mật thông tin tài khoản xã hội và thông tin cá nhân của mình khi sử dụng app. Chúng tôi không chịu trách nhiệm pháp lý cho bất kỳ sự cố hay tổn thất nào phát sinh từ việc tài khoản của bạn bị truy cập trái phép."
  },
  {
    title: "4. Giới hạn trách nhiệm y tế",
    content: "DNT cung cấp các thông số tham khảo về dinh dưỡng, calo và đa lượng (macro). Chúng tôi không phải là tổ chức y tế chuyên nghiệp và nội dung ứng dụng không thay thế cho các đánh giá chuyên khoa, chẩn đoán hay phác đồ điều trị y tế thực tế từ bác sĩ dinh dưỡng."
  },
  {
    title: "5. Thay đổi điều khoản dịch vụ",
    content: "Chúng tôi giữ quyền điều chỉnh, thay đổi hoặc cập nhật các điều khoản này bất kỳ lúc nào để phù hợp với quy định pháp luật và nâng cấp ứng dụng. Mọi thay đổi sẽ có hiệu lực ngay khi phiên bản mới nhất được cập nhật trên ứng dụng."
  }
];

const termsEn: DocSection[] = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using the DNT application, you agree to be bound by these Terms of Service and comply with all applicable local laws and regulations."
  },
  {
    title: "2. Intellectual Property Rights",
    content: "All content, visual design, logos, source code, and structural elements of the DNT app are the intellectual property of DNT or its licensors. You may not copy, extract, or redistribute any materials without our prior written consent."
  },
  {
    title: "3. User Account Security",
    content: "You are fully responsible for maintaining the confidentiality of your social login credentials and personal data within the app. We accept no liability for any loss or unauthorized access resulting from neglect of account security."
  },
  {
    title: "4. Medical Disclaimer",
    content: "DNT provides general nutritional guidelines, calorie estimations, and macronutrient calculators. We are not a medical organization; all tools are for reference only and do not replace professional medical diagnosis, advice, or treatment."
  },
  {
    title: "5. Modifications of Terms",
    content: "We reserve the right to amend or update these terms at any time. Changes will take effect immediately upon being posted in the application. Continued use of the app constitutes acceptance of the new terms."
  }
];

const privacyVi: DocSection[] = [
  {
    title: "1. Thông tin chúng tôi thu thập",
    content: "- Thông tin thể chất: Biệt danh, giới tính, ngày sinh, chiều cao, cân nặng nhằm tính toán chính xác chỉ số nhu cầu dinh dưỡng cá nhân.\n- Thông tin tài khoản: Địa chỉ email và tên hiển thị liên kết từ tài khoản Google/Facebook.\n- Dữ liệu hoạt động: Lịch sử ăn uống, nhật ký ghi calo, tiến trình cân nặng và số bước chân đếm được."
  },
  {
    title: "2. Mục đích sử dụng dữ liệu",
    content: "- Cung cấp các tính năng cốt lõi (theo dõi calo, macro, vẽ đồ thị tiến trình).\n- Cá nhân hóa các gợi ý dinh dưỡng phù hợp với thể trạng của riêng bạn.\n- Cải thiện chất lượng dịch vụ ứng dụng và khắc phục các sự cố kỹ thuật kịp thời."
  },
  {
    title: "3. Bảo mật và chia sẻ dữ liệu",
    content: "Chúng tôi cam kết không bán, không phân phối thông tin cá nhân của bạn cho bên thứ ba. Dữ liệu chỉ được đồng bộ hóa bảo mật trên hệ thống cloud của DNT phục vụ việc lưu trữ lịch sử cá nhân của bạn."
  },
  {
    title: "4. Quyền kiểm soát của người dùng",
    content: "Bạn hoàn toàn có quyền chỉnh sửa hồ sơ thể chất hoặc chủ động thực hiện chức năng 'Xóa toàn bộ dữ liệu' trong cài đặt để xóa vĩnh viễn tất cả thông tin lịch sử của bạn trên hệ thống của chúng tôi."
  },
  {
    title: "5. Các cập nhật chính sách bảo mật",
    content: "Chính sách bảo mật này có thể được cập nhật định kỳ. Chúng tôi khuyến khích người dùng kiểm tra thường xuyên để nắm được các thay đổi liên quan đến cách thức chúng tôi bảo vệ thông tin của bạn."
  }
];

const privacyEn: DocSection[] = [
  {
    title: "1. Information We Collect",
    content: "- Physical Profile: Nickname, gender, birth date, height, and weight to calculate daily nutritional needs.\n- Account details: Email and display name provided by your Google/Facebook login.\n- Activity log: Meal records, calorie logs, weight progress, and daily steps tracked."
  },
  {
    title: "2. Purpose of Data Processing",
    content: "- To deliver core features (calorie tracking, macronutrient balance, progress charts).\n- To personalize nutritional suggestions based on your physical metrics.\n- To analyze system performance and fix bugs to improve application reliability."
  },
  {
    title: "3. Data Security and Sharing",
    content: "We do not sell, rent, or share your personal data with third-parties. Your data is synced securely using cloud database configurations solely to preserve your personal history across sessions."
  },
  {
    title: "4. User Ownership and Control",
    content: "You retain full ownership of your data. You may edit your profile or use the 'Delete Account Data' function within settings to permanently wipe all stored history from our database servers."
  },
  {
    title: "5. Changes to this Policy",
    content: "We may update this Privacy Policy from time to time. We encourage users to frequently check this page for any updates regarding how we protect the collected information."
  }
];

export default function WebviewPlaceholderScreen() {
  const t = useTranslation();
  const params = useLocalSearchParams<{ title?: string; url?: string; type?: "terms" | "privacy" }>();
  const colors = useAppColors();
  const language = useSettingsStore((state) => state.language);
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const isTerms = params.type === "terms";
  const isPrivacy = params.type === "privacy";
  
  let docSections: DocSection[] = [];
  let docTitle = params.title ?? t.webview.title;
  let lastUpdated = t.webview.lastUpdated(language === "vi" ? "25/05/2026" : "May 25, 2026");

  if (isTerms) {
    docSections = language === "vi" ? termsVi : termsEn;
  } else if (isPrivacy) {
    docSections = language === "vi" ? privacyVi : privacyEn;
  }

  return (
    <SafeScreen contentContainerStyle={styles.screen}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {docTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isTerms || isPrivacy ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.lastUpdated}>{lastUpdated}</Text>
            {docSections.map((section, idx) => (
              <View key={idx} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.content}</Text>
              </View>
            ))}
            
            <View style={styles.footerNoteContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
              <Text style={styles.footerNoteText}>
                {t.webview.footerNote}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.fallbackContainer}>
          <View style={styles.fallbackCard}>
            <Ionicons name="globe-outline" size={48} color={colors.primary} style={styles.fallbackIcon} />
            <Text style={styles.fallbackTitle}>{t.webview.cardTitle}</Text>
            <Text style={styles.fallbackBody}>{t.webview.url(params.url ?? t.common.none)}</Text>
            <Text style={styles.fallbackDescription}>{t.webview.description}</Text>
          </View>
        </View>
      )}
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontStyle: "italic",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyStrong,
    color: colors.primary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  footerNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footerNoteText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  fallbackCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  fallbackIcon: {
    marginBottom: spacing.md,
  },
  fallbackTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  fallbackBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  fallbackDescription: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
});
