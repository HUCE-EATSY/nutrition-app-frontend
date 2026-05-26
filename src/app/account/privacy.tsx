import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View, Switch } from "react-native";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { t } from "@/constants/i18n";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppColors } from "@/hooks/useAppColors";
import { radius, spacing, typography } from "@/constants";

export default function PrivacyScreen() {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const privacySettings = useSettingsStore((state) => state.privacySettings);
  const setPrivacySettings = useSettingsStore((state) => state.setPrivacySettings);

  return (
    <SafeScreen scrollable contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings.privacy.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Description */}
      <Text style={styles.introText}>
        {t.settings.privacy.intro}
      </Text>

      {/* Preferences Container */}
      <View style={styles.card}>
        {/* Share Profile */}
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>{t.settings.privacy.shareProfile}</Text>
            <Text style={styles.rowDescription}>
              {t.settings.privacy.shareProfileDesc}
            </Text>
          </View>
          <Switch
            value={privacySettings.shareProfile}
            onValueChange={(val) => setPrivacySettings({ shareProfile: val })}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={privacySettings.shareProfile ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.divider} />

        {/* Data Analytics */}
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>{t.settings.privacy.collectUsage}</Text>
            <Text style={styles.rowDescription}>
              {t.settings.privacy.collectUsageDesc}
            </Text>
          </View>
          <Switch
            value={privacySettings.collectAnalytics}
            onValueChange={(val) => setPrivacySettings({ collectAnalytics: val })}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={privacySettings.collectAnalytics ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>

        <View style={styles.divider} />

        {/* Personalized Ads */}
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>{t.settings.privacy.personalizedAds}</Text>
            <Text style={styles.rowDescription}>
              {t.settings.privacy.personalizedAdsDesc}
            </Text>
          </View>
          <Switch
            value={privacySettings.personalizedAds}
            onValueChange={(val) => setPrivacySettings({ personalizedAds: val })}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={privacySettings.personalizedAds ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
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
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  introText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  rowDescription: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginHorizontal: spacing.md,
  },
});
