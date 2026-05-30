import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  Switch,
} from "react-native";
import { Portal, Dialog, Button, RadioButton } from "react-native-paper";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { useTranslation } from "@/constants/i18n";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useGetUserInfo } from "@/hooks/queries/useUserQueries";
import { useSettingsStore } from "@/store/settingsStore";
import { useAppColors } from "@/hooks/useAppColors";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useGetNotificationSettings, useUpdateNotificationSetting } from "@/hooks/queries/useNotificationQueries";
import { radius, spacing, typography } from "@/constants";
import { setStringAsync } from "expo-clipboard";

export default function SettingsScreen() {
  const t = useTranslation();
  const { userInfo } = useAuthStore();
  const { data: serverUserInfo } = useGetUserInfo();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const { logout, deleteAccount } = useGoogleAuth();

  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  // Settings Store State
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const unit = useSettingsStore((state) => state.unit);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);

  const setTheme = useSettingsStore((state) => state.setTheme);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setUnit = useSettingsStore((state) => state.setUnit);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);

  const { data: serverSettings = [], isLoading: isLoadingSettings } = useGetNotificationSettings();
  const updateSettingMutation = useUpdateNotificationSetting();

  // Dialog visibility states
  const [langDialogVisible, setLangDialogVisible] = useState(false);
  const [unitDialogVisible, setUnitDialogVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmType, setConfirmType] = useState<"logout" | "delete" | null>(null);

  const uid = serverUserInfo?.id ?? userInfo?.id ?? "f776695e-d733-4b71-b062-8b8bc9ebc3a0";
  const userEmail = serverUserInfo?.email ?? userInfo?.email ?? "kien762005@gmail.com";

  const handleCopyUID = async () => {
    try {
      await setStringAsync(uid);
      Alert.alert(t.common.close, t.settings.copySuccess);
    } catch (err) {
      console.warn("Failed to copy using native Expo Clipboard, showing fallback alert:", err);
      Alert.alert("UID", uid);
    }
  };

  const handleLogout = async () => {
    try {
      setConfirmVisible(false);
      setConfirmType(null);
      await logout();
      resetOnboarding();
      useOnboardingStore.getState().setPublicFlowStep("social-login");
      router.replace("/(public)/social-login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert(t.common.error, t.settings.logoutError);
    }
  };

  const handleDeleteData = async () => {
    try {
      setConfirmVisible(false);
      setConfirmType(null);
      await deleteAccount();
      resetOnboarding();
      useOnboardingStore.getState().setPublicFlowStep("social-login");
      router.replace("/(public)/social-login");
    } catch (error) {
      console.error("Delete data failed:", error);
      Alert.alert(t.common.error, t.settings.deleteDataError);
    }
  };

  return (
    <SafeScreen scrollable contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* THÔNG TIN CƠ BẢN */}
      <Text style={styles.sectionHeader}>{t.settings.basicInfo}</Text>
      <View style={styles.card}>
        {/* UID */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.uid}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="middle">
              {uid}
            </Text>
            <Pressable onPress={handleCopyUID} style={styles.iconBtn}>
              <Ionicons color={colors.textSecondary} name="copy-outline" size={20} />
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Email */}
        <Pressable style={styles.row} onPress={() => Alert.alert("Email", userEmail)}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.email}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">
              {userEmail}
            </Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Gói đăng ký */}
        <Pressable style={styles.row} onPress={() => Alert.alert(t.settings.subscription, "DNT Standard Edition")}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.subscription}</Text>
          </View>
          <View style={styles.rowRight}>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Điều khoản sử dụng */}
        <Pressable
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: "/webview",
              params: { title: t.settings.terms, type: "terms" },
            })
          }
        >
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.terms}</Text>
          </View>
          <View style={styles.rowRight}>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Chính sách riêng tư */}
        <Pressable
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: "/webview",
              params: { title: t.settings.privacyPolicy, type: "privacy" },
            })
          }
        >
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.privacyPolicy}</Text>
          </View>
          <View style={styles.rowRight}>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>
      </View>

      {/* CÀI ĐẶT ỨNG DỤNG */}
      <Text style={styles.sectionHeader}>{t.settings.appSettings}</Text>
      <View style={styles.card}>
        {/* Dark Mode */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.darkMode}</Text>
          </View>
          <View style={styles.rowRight}>
            <Switch
              value={theme === "dark"}
              onValueChange={(val) => setTheme(val ? "dark" : "light")}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={theme === "dark" ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Language */}
        <Pressable style={styles.row} onPress={() => setLangDialogVisible(true)}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.language}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{t.settings.languages[language]}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Unit */}
        <Pressable style={styles.row} onPress={() => setUnitDialogVisible(true)}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.unit}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{t.settings.units[unit]}</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Privacy Screen */}
        <Pressable style={styles.row} onPress={() => router.push("/account/privacy")}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.privacySettings}</Text>
          </View>
          <View style={styles.rowRight}>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Notifications */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.rowTitle}>{t.settings.notifications}</Text>
          </View>
          <View style={styles.rowRight}>
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => setNotificationsEnabled(val)}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Dynamic child notification configurations */}
        {notificationsEnabled && (
          <View style={styles.notificationChildren}>
            {isLoadingSettings ? (
              <Text style={[styles.childRowTitle, { paddingVertical: spacing.xs, opacity: 0.7 }]}>
                {language === "vi" ? "Đang tải cài đặt..." : "Loading settings..."}
              </Text>
            ) : (
              serverSettings.map((item) => {
                const displayName = language === "vi" ? item.notificationNameVi : item.notificationNameEn;
                return (
                  <View key={item.id || item.notificationTypeId} style={styles.childRow}>
                    <Text style={styles.childRowTitle}>{displayName}</Text>
                    <Switch
                      value={item.isEnabled}
                      onValueChange={(val) =>
                        updateSettingMutation.mutate({
                          notificationTypeId: item.notificationTypeId,
                          isEnabled: val,
                        })
                      }
                      trackColor={{ false: "#767577", true: colors.primary }}
                      thumbColor="#FFFFFF"
                      disabled={updateSettingMutation.isPending}
                    />
                  </View>
                );
              })
            )}
          </View>
        )}
      </View>

      {/* TÀI KHOẢN VÀ BẢO MẬT */}
      <Text style={styles.sectionHeader}>{t.settings.accountAndSecurity}</Text>
      <View style={styles.card}>
        {/* Xoá dữ liệu */}
        <Pressable
          style={styles.row}
          onPress={() => {
            setConfirmType("delete");
            setConfirmVisible(true);
          }}
        >
          <View style={styles.rowLeftIcon}>
            <Ionicons color="#FF5A5F" name="trash-outline" size={22} />
            <Text style={[styles.rowTitle, { color: "#FF5A5F" }]}>{t.account.deleteAccount}</Text>
          </View>
          <View style={styles.rowRight} />
        </Pressable>

        <View style={styles.divider} />

        {/* Đăng xuất */}
        <Pressable
          style={styles.row}
          onPress={() => {
            setConfirmType("logout");
            setConfirmVisible(true);
          }}
        >
          <View style={styles.rowLeftIcon}>
            <Ionicons color={colors.textSecondary} name="log-out-outline" size={22} />
            <Text style={styles.rowTitle}>{t.account.logout}</Text>
          </View>
          <View style={styles.rowRight} />
        </Pressable>
      </View>

      {/* Dialogs */}
      <Portal>
        {/* Language Dialog */}
        <Dialog onDismiss={() => setLangDialogVisible(false)} visible={langDialogVisible} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{t.settings.language}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(val) => {
                setLanguage(val as any);
                setLangDialogVisible(false);
              }}
              value={language}
            >
              <RadioButton.Item label={t.settings.languages.vi} value="vi" labelStyle={styles.radioLabel} color={colors.primary} />
              <RadioButton.Item label={t.settings.languages.en} value="en" labelStyle={styles.radioLabel} color={colors.primary} />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLangDialogVisible(false)} textColor={colors.textSecondary}>{t.common.close}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Unit Dialog */}
        <Dialog onDismiss={() => setUnitDialogVisible(false)} visible={unitDialogVisible} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>{t.settings.unit}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(val) => {
                setUnit(val as any);
                setUnitDialogVisible(false);
              }}
              value={unit}
            >
              <RadioButton.Item label={t.settings.units.kg} value="kg" labelStyle={styles.radioLabel} color={colors.primary} />
              <RadioButton.Item label={t.settings.units.lbs} value="lbs" labelStyle={styles.radioLabel} color={colors.primary} />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUnitDialogVisible(false)} textColor={colors.textSecondary}>{t.common.close}</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Confirm Action Dialog */}
        <Dialog onDismiss={() => setConfirmVisible(false)} visible={confirmVisible} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {confirmType === "logout" ? t.account.logoutConfirmTitle : t.account.deleteConfirmTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              {confirmType === "logout" ? t.account.logoutConfirmMessage : t.account.deleteConfirmMessage}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)} textColor={colors.textSecondary}>{t.common.cancel}</Button>
            <Button
              onPress={confirmType === "logout" ? handleLogout : handleDeleteData}
              textColor="#FF5A5F"
            >
              {confirmType === "logout" ? t.account.logout : t.account.deleteAccount}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  sectionHeader: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
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
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowLeftIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "flex-end",
    maxWidth: "60%",
  },
  rowTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  rowValue: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 2,
    flexShrink: 1,
  },
  iconBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginHorizontal: spacing.md,
  },
  dialog: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
  },
  dialogTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  dialogContent: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  radioLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  notificationChildren: {
    backgroundColor: colors.surface,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  childRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  childRowTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
});
