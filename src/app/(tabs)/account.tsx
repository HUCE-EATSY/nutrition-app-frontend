import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, View, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { MacroRingChart } from "@/components/charts/MacroRingChart";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useQueryClient } from "@tanstack/react-query";
import { radius, spacing, typography } from "@/constants";
import { userService } from "@/services/userService";
import { useAppColors } from "@/hooks/useAppColors";
import { useSettingsStore } from "@/store/settingsStore";

import { getAgeFromBirthDate } from "@/utils/date";
import { DEFAULT_CURRENT_WEIGHT_KG, DEFAULT_HEIGHT_CM, DEFAULT_TARGET_WEIGHT_KG } from "@/constants/onboarding";
import { SectionHeader, MacroItem, StatIconButton, SocialButton } from "@/components/account/AccountComponents";

export default function AccountScreen() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { draft, serverPlan } = useOnboardingStore();
  const { userInfo } = useAuthStore();
  const { data: serverUserInfo } = useGetUserInfo();

  const colors = useAppColors();
  const unit = useSettingsStore((state) => state.unit);
  // Subscribe to settings to trigger UI re-renders on theme/lang/unit change:
  const themeMode = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const formatWeightVal = (kg: number) => {
    if (unit === "lbs") {
      const lbs = kg * 2.20462;
      return `${Math.round(lbs * 10) / 10} lbs`;
    }
    return `${kg} kg`;
  };

  // Avatar state: ưu tiên avatarUrl từ server
  const [avatarUri, setAvatarUri] = useState<string | null>(
    serverUserInfo?.profile?.avatarUrl ?? null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Đồng bộ hóa avatarUri khi dữ liệu người dùng được tải về từ server
  React.useEffect(() => {
    if (serverUserInfo?.profile?.avatarUrl) {
      setAvatarUri(serverUserInfo.profile.avatarUrl);
    }
  }, [serverUserInfo?.profile?.avatarUrl]);

  const profile = serverUserInfo?.profile;
  const activeGoal = serverUserInfo?.activeGoal ?? serverUserInfo?.ActiveGoal;

  const age = profile?.dateOfBirth
    ? getAgeFromBirthDate(profile.dateOfBirth)
    : (draft.birthDateISO ? getAgeFromBirthDate(draft.birthDateISO) : 24);

  const nickname = profile?.displayName ?? draft.nickname ?? userInfo?.email?.split("@")[0] ?? "USER";

  const joinedDate = serverUserInfo?.createdAt
    ? new Date(serverUserInfo.createdAt).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "12 Thg 05, 2026";

  const plan = activeGoal
    ? {
      targetCalories: Number(activeGoal.targetCalories ?? activeGoal.TargetCalories),
      targetProteinG: Number(activeGoal.targetProteinG ?? activeGoal.TargetProteinG),
      targetCarbsG: Number(activeGoal.targetCarbsG ?? activeGoal.TargetCarbsG),
      targetFatG: Number(activeGoal.targetFatG ?? activeGoal.TargetFatG),
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

  /** Upload avatar: chọn ảnh rồi gửi lên /api/User/avatar */
  const handleUploadAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          t.account.journey.permissionDenied,
          t.account.journey.grantPhotoAccess
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;

      setIsUploadingAvatar(true);
      const asset = result.assets[0];
      const { avatarUrl } = await userService.uploadAvatar(
        asset.uri,
        asset.mimeType ?? 'image/jpeg'
      );
      setAvatarUri(avatarUrl);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (err) {
      console.error("Lỗi upload avatar:", err);
      Alert.alert(
        t.common.error,
        t.account.journey.uploadAvatarError
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SafeScreen scrollable contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.account.profileTitle}</Text>
        <Pressable
          onPress={() => router.push("/account/settings")}
          style={styles.settingsButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons color={colors.textSecondary} name="settings-outline" size={24} />
        </Pressable>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 100, height: 100, borderRadius: radius.pill }}
              />
            ) : (
              <Text style={styles.avatarText}>{nickname.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Pressable
            style={styles.addAvatarButton}
            onPress={handleUploadAvatar}
            disabled={isUploadingAvatar}
          >
            <Ionicons
              color={colors.textSecondary}
              name={isUploadingAvatar ? "hourglass-outline" : "add"}
              size={16}
            />
          </Pressable>
        </View>
        <Text style={styles.profileName}>{nickname.toUpperCase()}</Text>
        <Text style={styles.joinedText}>{t.account.joinedDate(joinedDate)}</Text>
      </View>

      {/* Premium Banner */}
      <LinearGradient
        colors={themeMode === "light" ? ["#FFFFFF", "#FFFDF0", "#FFEAC2"] : ["#FFFFFF", "#FFF5D1", "#FFD28D"]}
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
          <Text style={styles.statChipText}>{profile?.heightCm ?? draft.heightCm ?? DEFAULT_HEIGHT_CM} cm</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons color={colors.textSecondary} name="barbell-outline" size={18} />
          <Text style={styles.statChipText}>{formatWeightVal(profile?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG)}</Text>
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
      <SectionHeader title={t.account.yourJourney} showChevron={false} />
      {(() => {
        const startWeight = activeGoal?.weightKg ?? profile?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
        const currentWeightVal = profile?.weightKg ?? activeGoal?.weightKg ?? draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG;
        const targetWeightVal = activeGoal?.goalWeightKg ?? draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG;

        let progressPct = 0;
        const totalChangeNeeded = Math.abs(startWeight - targetWeightVal);

        if (totalChangeNeeded > 0) {
          const isLosing = startWeight > targetWeightVal;
          if (isLosing) {
            const currentChange = startWeight - currentWeightVal;
            progressPct = Math.min(Math.max((currentChange / totalChangeNeeded) * 100, 0), 100);
          } else {
            const currentChange = currentWeightVal - startWeight;
            progressPct = Math.min(Math.max((currentChange / totalChangeNeeded) * 100, 0), 100);
          }
        } else {
          progressPct = 100;
        }

        const progressStr = `${progressPct.toFixed(0)}%`;

        let journeyTitle: string = t.account.maintainingWeight;
        if (startWeight > targetWeightVal) {
          if (currentWeightVal <= targetWeightVal) {
            journeyTitle = t.account.journey.congratsLose;
          } else {
            const lost = (startWeight - currentWeightVal) * (unit === "lbs" ? 2.20462 : 1);
            journeyTitle = lost >= 0
              ? t.account.journey.lostWeight(lost.toFixed(1), unit)
              : t.account.journey.gainedWeightFromStart(Math.abs(lost).toFixed(1), unit);
          }
        } else if (startWeight < targetWeightVal) {
          if (currentWeightVal >= targetWeightVal) {
            journeyTitle = t.account.journey.congratsGain;
          } else {
            const gained = (currentWeightVal - startWeight) * (unit === "lbs" ? 2.20462 : 1);
            journeyTitle = gained >= 0
              ? t.account.journey.gainedWeight(gained.toFixed(1), unit)
              : t.account.journey.lostWeightFromStart(Math.abs(gained).toFixed(1), unit);
          }
        }

        const journeySubtitle = startWeight === targetWeightVal
          ? t.account.journey.maintenanceTarget(formatWeightVal(targetWeightVal), formatWeightVal(currentWeightVal))
          : t.account.journey.journeyProgress(formatWeightVal(startWeight), formatWeightVal(currentWeightVal), formatWeightVal(targetWeightVal));

        return (
          <View style={styles.journeyCard}>
            <LinearGradient
              colors={themeMode === "light" ? ["rgba(165,108,255,0.06)", "rgba(165,108,255,0.01)"] : ["rgba(165,108,255,0.1)", "rgba(165,108,255,0.02)"]}
              style={styles.journeyCardGradient}
            >
              <View style={styles.journeyIconBg}>
                <Ionicons color={colors.primary} name="locate" size={32} />
              </View>
              <Text style={styles.journeyTitle}>{journeyTitle}</Text>
              <Text style={styles.journeySubtitle}>{journeySubtitle}</Text>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: progressStr as any }]} />
                  <View style={[styles.progressKnob, { left: progressStr as any }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>{formatWeightVal(startWeight)}</Text>
                  <Text style={styles.progressLabel}>{formatWeightVal(targetWeightVal)}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        );
      })()}


      {/* Nutrition Goals Section */}
      <SectionHeader title={t.account.nutritionGoals} showChevron={false} />
      <View style={styles.macroCard}>
        <View style={styles.macroContent}>
          <View style={styles.chartContainer}>
            <MacroRingChart
              proteinPct={proteinPct}
              carbsPct={carbsPct}
              fatPct={fatPct}
              proteinColor={colors.protein}
              carbsColor={colors.carbs}
              fatColor={colors.fat}
              size={120}
              strokeWidth={8}
              calories={plan.targetCalories}
              iconColor={colors.warning}
              textColor={colors.textPrimary}
            />
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
      <SectionHeader title={t.account.testReports} showChevron={false} />
      <View style={styles.statsIconRow}>
        <StatIconButton color="#FFD95A" icon="restaurant" label={t.account.stats.nutrition} route="/stats/nutrition" />
        <StatIconButton color="#B07EFF" icon="barbell" label={t.account.stats.workout} route="/stats/activity" />
        <StatIconButton color="#C6FFD0" icon="walk" label={t.account.stats.steps} route="/stats/steps" />
        <StatIconButton color="#85E6FF" icon="speedometer" label={t.account.stats.weight} route="/stats/weight" />
      </View>

      {/* Community Section */}
      <SectionHeader title={t.account.community.title} showChevron={false} />
      <View style={styles.communityCard}>
        <LinearGradient
          colors={themeMode === "light" ? ["#EFE5FD", "#DFCBFA"] : ["#4A1F76", "#2D1B4D"]}
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

          <Pressable 
            onPress={async () => {
              try {
                await Linking.openURL("https://www.facebook.com/share/g/1Efu6WHc6a/");
              } catch (error) {
                console.error("Error opening community URL:", error);
                Alert.alert("Lỗi", "Không thể mở trang liên kết này");
              }
            }}
            style={styles.communityButton}
          >
            <Text style={styles.communityButtonText}>{t.account.community.joinCta}</Text>
          </Pressable>
        </LinearGradient>
      </View>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>{t.account.social.search}</Text>
        <View style={styles.socialRow}>
          <SocialButton 
            icon="logo-tiktok" 
            label={t.account.social.tiktok} 
            url="https://www.facebook.com/share/g/1Efu6WHc6a/"
          />
          <SocialButton 
            icon="logo-facebook" 
            label={t.account.social.facebook} 
            url="https://www.facebook.com/share/g/1Efu6WHc6a/"
          />
          <SocialButton 
            icon="logo-instagram" 
            label={t.account.social.instagram} 
            url="https://www.facebook.com/share/g/1Efu6WHc6a/"
          />
        </View>
      </View>

      {/* Support Center */}
      <Pressable
        onPress={() => router.push("/account/support")}
        style={styles.supportButton}
      >
        <View style={styles.supportLeft}>
          <Ionicons color={colors.textSecondary} name="help-buoy-outline" size={24} />
          <Text style={styles.supportText}>{t.account.supportLabel}</Text>
        </View>
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

const getStyles = (colors: any) => StyleSheet.create({
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
    backgroundColor: colors.surfaceAlt,
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
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
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

  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
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
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerLogo: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  copyrightText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 14,
  },
});
