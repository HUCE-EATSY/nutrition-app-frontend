import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Portal, Dialog, Button } from "react-native-paper";
import Svg, { Circle } from "react-native-svg";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { ProgressRingChart } from "@/components/charts/ProgressRingChart";
import { t } from "@/constants/i18n";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { useAuthStore } from "@/hooks/store/authStore";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { colors, radius, spacing, typography } from "@/constants";

import { getAgeFromBirthDate } from "@/hooks/utils/date";
import { DEFAULT_CURRENT_WEIGHT_KG, DEFAULT_HEIGHT_CM, DEFAULT_TARGET_WEIGHT_KG } from "@/domain/onboarding";

export default function AccountScreen() {
  const { draft, serverPlan } = useOnboardingStore();
  const { userInfo } = useAuthStore();
  const { data: userGoalInfo } = useGetUserInfo();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  // Bypass Google Auth to prevent Client ID error during UI development
  // const { logout, deleteAccount } = useGoogleAuth();
  const logout = async () => console.log("Mock logout");
  const deleteAccount = async () => console.log("Mock deleteAccount");

  const profile = userGoalInfo?.activeGoal;
  
  // Profile info (DisplayName, HeightCm, WeightKg, DateOfBirth)
  const profileInfo = userGoalInfo?.profile;
  
  const age = profileInfo?.dateOfBirth
    ? getAgeFromBirthDate(profileInfo.dateOfBirth)
    : draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24;

  const nickname = profileInfo?.displayName ?? draft.nickname ?? userInfo?.email?.split("@")[0] ?? "USER";
  
  const joinedDate = userGoalInfo?.createdAt
    ? new Date(userGoalInfo.createdAt).toLocaleDateString("vi-VN", { year: 'numeric', month: 'short', day: 'numeric' })
    : "12 Thg 05, 2026";

  const plan = profile
    ? {
        targetCalories: Number(profile.targetCalories),
        targetProteinG: Number(profile.targetProteinG),
        targetCarbsG: Number(profile.targetCarbsG),
        targetFatG: Number(profile.targetFatG),
      }
    : serverPlan || {
        targetCalories: 2000,
        targetProteinG: 100,
        targetCarbsG: 250,
        targetFatG: 67,
      };

  const proteinPct = Math.round((plan.targetProteinG * 400) / plan.targetCalories) || 20;
  const carbsPct = Math.round((plan.targetCarbsG * 400) / plan.targetCalories) || 50;
  const fatPct = 100 - proteinPct - carbsPct;

  const [settingsVisible, setSettingsVisible] = React.useState(false);
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<"logout" | "delete" | null>(null);

  const showSettings = () => setSettingsVisible(true);
  const hideSettings = () => setSettingsVisible(false);

  const showConfirm = (type: "logout" | "delete") => {
    setConfirmType(type);
    setSettingsVisible(false);
    setConfirmVisible(true);
  };

  const hideConfirm = () => {
    setConfirmVisible(false);
    setConfirmType(null);
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      hideConfirm();
      await logout();
      resetOnboarding();
      useOnboardingStore.getState().setPublicFlowStep("social-login");
      router.replace("/(public)/social-login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  const handleDeleteData = async () => {
    try {
      console.log("Deleting account data...");
      hideConfirm();
      await deleteAccount();
      resetOnboarding();
      useOnboardingStore.getState().setPublicFlowStep("social-login");
      router.replace("/(public)/social-login");
    } catch (error) {
      console.error("Delete data failed:", error);
      Alert.alert("Lỗi", "Không thể xóa dữ liệu. Vui lòng thử lại.");
    }
  };

  return (
    <SafeScreen scrollable contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.account.profileTitle}</Text>
        <Pressable 
          onPress={showSettings} 
          style={styles.settingsButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons color={colors.textSecondary} name="settings-outline" size={24} />
        </Pressable>
      </View>

      {/* Settings Menu Dialog */}
      <Portal>
        <Dialog onDismiss={hideSettings} visible={settingsVisible} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{t.account.title}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.menuContainer}>
              <Pressable 
                onPress={() => showConfirm("logout")} 
                style={styles.menuItem}
              >
                <Ionicons color={colors.textSecondary} name="log-out-outline" size={24} />
                <Text style={styles.menuItemText}>{t.account.logout}</Text>
              </Pressable>
              
              <View style={styles.divider} />

              <Pressable 
                onPress={() => showConfirm("delete")} 
                style={styles.menuItem}
              >
                <Ionicons color="#FF5A5F" name="trash-outline" size={24} />
                <Text style={[styles.menuItemText, { color: "#FF5A5F" }]}>{t.account.deleteAccount}</Text>
              </Pressable>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideSettings} textColor={colors.textSecondary}>{t.common.close}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog onDismiss={hideConfirm} visible={confirmVisible} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {confirmType === "logout" ? t.account.logoutConfirmTitle : t.account.deleteConfirmTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              {confirmType === "logout" ? t.account.logoutConfirmMessage : t.account.deleteConfirmMessage}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideConfirm} textColor={colors.textSecondary}>{t.common.cancel}</Button>
            <Button 
              onPress={confirmType === "logout" ? handleLogout : handleDeleteData} 
              textColor="#FF5A5F"
            >
              {confirmType === "logout" ? t.account.logout : t.account.deleteAccount}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
          <Text style={styles.statChipText}>{profileInfo?.heightCm ?? draft.heightCm ?? DEFAULT_HEIGHT_CM} cm</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons color={colors.textSecondary} name="barbell-outline" size={18} />
          <Text style={styles.statChipText}>{profileInfo?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG} kg</Text>
        </View>
      </View>

      {/* Physical Profile Button */}
      <Pressable
        style={({ pressed }) => [styles.physicalProfileButton, pressed && { opacity: 0.8 }]}
        onPress={() => router.push("/physical-profile")}
      >
        <Text style={styles.physicalProfileButtonText}>{t.account.physicalProfile}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
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
              <Text style={styles.progressLabel}>{profile?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG} kg</Text>
              <Text style={styles.progressLabel}>{profile?.goalWeightKg ?? draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG} kg</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Nutrition Goals Section */}
      <SectionHeader title={t.account.nutritionGoals} />
      <View style={styles.macroCard}>
        <View style={styles.macroContent}>
          <View style={styles.chartContainer}>
            <ProgressRingChart 
              percentage={75} 
              color={colors.warning} 
              size={120} 
              strokeWidth={8}
              showPercentageText={false}
            />
            <View style={styles.chartCenter}>
              <Ionicons color={colors.warning} name="flame" size={20} />
              <Text style={styles.calorieValue}>{Math.round(plan.targetCalories).toLocaleString()}</Text>
            </View>
          </View>
  
          <View style={styles.macroList}>
            <MacroItem 
              color={colors.protein} 
              label={t.home.protein} 
              percentage={`${proteinPct}%`} 
              value={`${Math.round(plan.targetProteinG)}g`} 
            />
            <MacroItem 
              color={colors.carbs} 
              label={t.home.carbs} 
              percentage={`${carbsPct}%`} 
              value={`${Math.round(plan.targetCarbsG)}g`} 
            />
            <MacroItem 
              color={colors.fat} 
              label={t.home.fat} 
              percentage={`${fatPct}%`} 
              value={`${Math.round(plan.targetFatG)}g`} 
            />
          </View>
        </View>

        <Pressable 
          style={styles.customizeGoalButton}
          onPress={() => router.push('/account/targets')}
        >
          <Text style={styles.customizeGoalText}>{t.account.customizeGoal}</Text>
        </Pressable>
      </View>

      {/* Statistic Reports Section */}
      <SectionHeader title={t.account.testReports} />
      <View style={styles.statsIconRow}>
        <StatIconButton color="#FFD95A" icon="restaurant" label={t.account.stats.nutrition} route="/stats/nutrition" />
        <StatIconButton color="#B07EFF" icon="barbell" label={t.account.stats.workout} route="/stats/activity" />
        <StatIconButton color="#C6FFD0" icon="walk" label={t.account.stats.steps} route="/stats/steps" />
        <StatIconButton color="#85E6FF" icon="speedometer" label={t.account.stats.weight} route="/stats/weight" />
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

function StatIconButton({ color, icon, label, route }: { color: string; icon: keyof typeof Ionicons.glyphMap; label: string; route: string }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [styles.statIconContainer, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.statIconCircle, { backgroundColor: color }]}>
        <Ionicons color="#111020" name={icon} size={28} />
      </View>
      <Text style={styles.statIconLabel}>{label}</Text>
    </Pressable>
  );
}

function SocialButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
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
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  dialogTitle: {
    color: colors.textPrimary,
    ...typography.h3,
  },
  dialogContent: {
    color: colors.textSecondary,
    ...typography.body,
  },
  menuContainer: {
    marginTop: spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  menuItemText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceAlt,
    marginVertical: spacing.xs,
  },
});
