import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, radius, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";
import { getAgeFromBirthDate } from "@/hooks/utils/date";

export default function AccountScreen() {
  const draft = useOnboardingStore((state) => state.draft);
  const age = draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 15;
  const { isCompact } = useResponsiveLayout();

  const nickname = draft.nickname ?? "KIEN";
  const joinedDate = "19 Thg 04, 2026"; // In a real app, this would come from a user object

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.account.profileTitle}</Text>
          <Pressable style={styles.settingsButton}>
            <Ionicons color={colors.textSecondary} name="settings-outline" size={24} />
          </Pressable>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nickname.charAt(0).toUpperCase()}</Text>
            </View>
            <Pressable style={styles.addAvatarButton}>
              <Ionicons color={colors.textSecondary} name="add" size={16} />
            </Pressable>
          </View>
          <Text style={styles.profileName}>{nickname.toUpperCase()}</Text>
          <Text style={styles.joinedText}>{t.account.joinedDate(joinedDate)}</Text>
        </View>

        {/* Premium Banner */}
        <LinearGradient
          colors={["#FFFFFF", "#FFF5D1", "#FFD28D"]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>{t.account.premium.bannerTitle}</Text>
            <Pressable style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>{t.account.premium.cta}</Text>
            </Pressable>
          </View>
          <View style={styles.premiumIconContainer}>
            <Ionicons color="#FF9500" name="flame" size={64} />
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons color={colors.textSecondary} name="calendar-outline" size={18} />
            <Text style={styles.statChipText}>{age} {t.account.age.toLowerCase()}</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons color={colors.textSecondary} name="man-outline" size={18} />
            <Text style={styles.statChipText}>{draft.heightCm ?? 225} cm</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons color={colors.textSecondary} name="barbell-outline" size={18} />
            <Text style={styles.statChipText}>{draft.currentWeightKg ?? 54.3} kg</Text>
          </View>
        </View>

        {/* Physical Profile Button */}
        <Pressable style={styles.physicalProfileButton}>
          <Text style={styles.physicalProfileButtonText}>{t.account.physicalProfile}</Text>
        </Pressable>

        {/* Your Journey Section */}
        <SectionHeader title={t.account.yourJourney} />
        <View style={styles.journeyCard}>
          <LinearGradient
            colors={["rgba(165,108,255,0.1)", "rgba(165,108,255,0.02)"]}
            style={styles.journeyCardGradient}
          >
            <View style={styles.journeyIconBg}>
              <Ionicons color={colors.primary} name="locate" size={32} />
            </View>
            <Text style={styles.journeyTitle}>{t.account.maintainingWeight}</Text>
            <Text style={styles.journeySubtitle}>{t.account.updateWeightHint}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "40%" }]} />
                <View style={[styles.progressKnob, { left: "40%" }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{draft.currentWeightKg ?? 54.3} kg</Text>
                <Text style={styles.progressLabel}>{draft.targetWeightKg ?? 53.9} kg</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Nutrition Goals Section */}
        <SectionHeader title={t.account.nutritionGoals} />
        <View style={styles.macroCard}>
          <View style={styles.macroContent}>
            <View style={styles.chartContainer}>
              <Svg height="120" width="120">
                <Circle
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke={colors.surfaceAlt}
                  strokeWidth="8"
                />
                <Circle
                  cx="60"
                  cy="60"
                  fill="transparent"
                  r="50"
                  stroke={colors.warning}
                  strokeDasharray={`${(2 * Math.PI * 50) * 0.75} ${2 * Math.PI * 50}`}
                  strokeLinecap="round"
                  strokeWidth="8"
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.chartCenter}>
                <Ionicons color={colors.warning} name="flame" size={20} />
                <Text style={styles.calorieValue}>1.925</Text>
              </View>
            </View>

            <View style={styles.macroList}>
              <MacroItem color={colors.protein} label={t.home.protein} percentage="20%" value="96g" />
              <MacroItem color={colors.carbs} label={t.home.carbs} percentage="50%" value="241g" />
              <MacroItem color={colors.fat} label={t.home.fat} percentage="30%" value="144g" />
            </View>
          </View>

          <Pressable style={styles.customizeGoalButton}>
            <Text style={styles.customizeGoalText}>{t.account.customizeGoal}</Text>
          </Pressable>
        </View>

        {/* Statistic Reports Section */}
        <SectionHeader title={t.account.testReports} />
        <View style={styles.statsIconRow}>
          <StatIconButton color="#FFD95A" icon="restaurant" label={t.account.stats.nutrition} />
          <StatIconButton color="#B07EFF" icon="barbell" label={t.account.stats.workout} />
          <StatIconButton color="#C6FFD0" icon="walk" label={t.account.stats.steps} />
          <StatIconButton color="#85E6FF" icon="speedometer" label={t.account.stats.weight} />
        </View>

        {/* Community Section */}
        <SectionHeader title={t.account.community.title} />
        <View style={styles.communityCard}>
          <LinearGradient
            colors={["#4A1F76", "#2D1B4D"]}
            style={styles.communityGradient}
          >
            <View style={styles.communityInfo}>
              <View style={styles.communityBadge}>
                <Text style={styles.communityBadgeText}>{t.account.community.joinGroup}</Text>
              </View>
              <View style={styles.communityBadgeAlt}>
                <Text style={styles.communityBadgeTextAlt}>{t.account.community.companion}</Text>
              </View>
            </View>

            <Text style={styles.communityJoinTitle}>{t.account.community.joinNow}</Text>

            <Pressable style={styles.communityButton}>
              <Text style={styles.communityButtonText}>{t.account.community.joinCta}</Text>
            </Pressable>
          </LinearGradient>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>{t.account.social.search}</Text>
          <View style={styles.socialRow}>
            <SocialButton icon="logo-tiktok" label={t.account.social.tiktok} />
            <SocialButton icon="logo-facebook" label={t.account.social.facebook} />
            <SocialButton icon="logo-instagram" label={t.account.social.instagram} />
          </View>
        </View>

        {/* Support Center */}
        <Pressable
          onPress={() => router.push("/webview")}
          style={styles.supportButton}
        >
          <View style={styles.supportLeft}>
            <Ionicons color={colors.textSecondary} name="help-buoy-outline" size={24} />
            <Text style={styles.supportText}>{t.account.supportLabel}</Text>
          </View>
          <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}></Text>
          <Text style={styles.versionText}>{t.account.version("1.12.14 (257)", "01c227f7eb7ecaae")}</Text>
          <Text style={styles.copyrightText}>© 2026 All rights reserved.</Text>
          <Text style={styles.disclaimerText}>{t.account.footerDisclaimer}</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </View>
  );
}

function MacroItem({ color, label, percentage, value }: { color: string; label: string; percentage: string; value: string }) {
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroItemLeft}>
        <Ionicons color={color} name="flash" size={14} />
        <Text style={styles.macroItemLabel}>{label}</Text>
      </View>
      <View style={styles.macroItemRight}>
        <Text style={styles.macroItemPercentage}>{percentage}</Text>
        <Text style={styles.macroItemValue}>({value})</Text>
      </View>
    </View>
  );
}

function StatIconButton({ color, icon, label }: { color: string; icon: any; label: string }) {
  return (
    <View style={styles.statIconContainer}>
      <View style={[styles.statIconCircle, { backgroundColor: color }]}>
        <Ionicons color="#111020" name={icon} size={28} />
      </View>
      <Text style={styles.statIconLabel}>{label}</Text>
    </View>
  );
}

function SocialButton({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.socialButton}>
      <Ionicons color={colors.textPrimary} name={icon} size={28} />
      <Text style={styles.socialButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: "#17A2B8", // Cyan-ish like image
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...typography.h1,
    fontSize: 48,
    color: colors.textPrimary,
  },
  addAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: "#3A3852",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bgBase,
  },
  profileName: {
    ...typography.h2,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  joinedText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  premiumBanner: {
    flexDirection: "row",
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    ...typography.bodyStrong,
    color: "#2D2D2D",
    marginBottom: spacing.md,
  },
  premiumButton: {
    backgroundColor: "#FFD95A",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  premiumButtonText: {
    ...typography.bodyStrong,
    color: "#4A3400",
  },
  premiumIconContainer: {
    marginLeft: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  statChipText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.textPrimary,
  },
  physicalProfileButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  physicalProfileButtonText: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  journeyCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated,
  },
  journeyCardGradient: {
    padding: spacing.xl,
    alignItems: "center",
  },
  journeyIconBg: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165,108,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  journeyTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  journeySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.pill,
    position: "relative",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    opacity: 0.3,
  },
  progressKnob: {
    position: "absolute",
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: "rgba(165,108,255,0.3)",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  macroCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  macroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  chartContainer: {
    position: "relative",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
  },
  calorieValue: {
    ...typography.h1,
    fontSize: 18,
    color: colors.textPrimary,
  },
  macroList: {
    flex: 1,
    gap: spacing.sm,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  macroItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  macroItemLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  macroItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroItemPercentage: {
    ...typography.bodyStrong,
    fontSize: 10,
    color: colors.textPrimary,
  },
  macroItemValue: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  customizeGoalButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  customizeGoalText: {
    ...typography.bodyStrong,
    fontSize: 15,
    color: colors.textSecondary,
  },
  statsIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  statIconContainer: {
    alignItems: "center",
    gap: spacing.sm,
  },
  statIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  communityCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.xxl,
  },
  communityGradient: {
    padding: spacing.xxl,
  },
  communityInfo: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  communityBadge: {
    backgroundColor: "rgba(100,255,150,0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  communityBadgeText: {
    ...typography.caption,
    color: "#64FF96",
    fontWeight: "700",
  },
  communityBadgeAlt: {
    backgroundColor: "rgba(165,108,255,0.2)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  communityBadgeTextAlt: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  communityJoinTitle: {
    ...typography.bodyStrong,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  communityButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  communityButtonText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  socialSection: {
    marginBottom: spacing.xl,
  },
  socialTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  socialRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  socialButton: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  socialButtonLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    marginBottom: spacing.xxl,
  },
  supportLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  supportText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  footer: {
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  footerLogo: {
    ...typography.h1,
    fontSize: 32,
    color: colors.textPrimary,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  copyrightText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  disclaimerText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 14,
    marginTop: spacing.sm,
  },
});
