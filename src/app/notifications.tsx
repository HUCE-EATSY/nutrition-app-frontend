import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { radius, spacing, typography } from "@/constants";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { useTranslation } from "@/constants/i18n";
import { useAppColors } from "@/hooks/useAppColors";
import { useSettingsStore } from "@/store/settingsStore";
import {
  useGetNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
  useDeleteNotification,
  useGetUnreadCount,
} from "@/hooks/queries/useNotificationQueries";

interface NotificationItemProps {
  item: {
    id: string;
    notificationTypeId: number;
    notificationTypeCode: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  };
  language: string;
  colors: any;
  styles: any;
  onPress: () => void;
  onDelete: () => void;
  formatTimeAgo: (dateStr: string) => string;
  getNotificationIcon: (code: string) => { name: keyof typeof Ionicons.glyphMap; color: string };
}

function NotificationRow({
  item,
  colors,
  styles,
  onPress,
  onDelete,
  formatTimeAgo,
  getNotificationIcon,
}: NotificationItemProps) {
  const iconConfig = getNotificationIcon(item.notificationTypeCode);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.notifRow,
        !item.isRead && styles.notifRowUnread,
      ]}
    >
      {/* Glow dot for unread */}
      {!item.isRead && <View style={styles.unreadDot} />}

      {/* Icon block */}
      <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + "15" }]}>
        <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
      </View>

      {/* Message content */}
      <View style={styles.contentWrap}>
        <View style={styles.textHeaderRow}>
          <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.messageText} numberOfLines={2}>
          {item.message}
        </Text>
      </View>

      {/* Delete button */}
      <Pressable hitSlop={12} onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

export default function NotificationCenterScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const language = useSettingsStore((state) => state.language);

  const { data: notifications = [], isLoading, refetch, isFetching } = useGetNotifications();
  const { refetch: refetchUnreadCount } = useGetUnreadCount();

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchUnreadCount();
    setRefreshing(false);
  };

  const handleRowPress = (item: any) => {
    if (!item.isRead) {
      markAsReadMutation.mutate([item.id]);
    }
  };

  const handleMarkAllAsRead = () => {
    const hasUnread = notifications.some((n) => !n.isRead);
    if (hasUnread) {
      markAllAsReadMutation.mutate();
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return language === "vi" ? "Vừa xong" : "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return language === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === "vi" ? `${hours} giờ trước` : `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return language === "vi" ? `${days} ngày trước` : `${days}d ago`;

    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationIcon = (code: string) => {
    switch (code) {
      case "MEAL_REMINDER":
        return { name: "restaurant-outline" as const, color: colors.protein || "#3B82F6" };
      case "EXERCISE_REMINDER":
        return { name: "fitness-outline" as const, color: colors.fat || "#EF4444" };
      case "WEIGHT_LOG_REMINDER":
        return { name: "scale-outline" as const, color: colors.warning || "#F59E0B" };
      case "WATER_REMINDER":
        return { name: "water-outline" as const, color: colors.carbs || "#10B981" };
      case "GOAL_ACHIEVED":
        return { name: "trophy-outline" as const, color: "#F59E0B" };
      case "DAILY_SUMMARY":
      case "WEEKLY_REPORT":
        return { name: "analytics-outline" as const, color: colors.primary || "#A56CFF" };
      default:
        return { name: "notifications-outline" as const, color: colors.textMuted || "#9CA3AF" };
    }
  };

  // Grouping notifications for SectionList
  const getGroupedData = () => {
    const todayGroup: any[] = [];
    const yesterdayGroup: any[] = [];
    const olderGroup: any[] = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const tempYest = new Date();
    tempYest.setDate(now.getDate() - 1);
    const yesterdayStr = tempYest.toDateString();

    notifications.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      const itemDateStr = itemDate.toDateString();

      if (itemDateStr === todayStr) {
        todayGroup.push(item);
      } else if (itemDateStr === yesterdayStr) {
        yesterdayGroup.push(item);
      } else {
        olderGroup.push(item);
      }
    });

    const sections = [];
    if (todayGroup.length > 0) {
      sections.push({ title: t.notificationCenter.today, data: todayGroup });
    }
    if (yesterdayGroup.length > 0) {
      sections.push({ title: t.notificationCenter.yesterday, data: yesterdayGroup });
    }
    if (olderGroup.length > 0) {
      sections.push({ title: t.notificationCenter.older, data: olderGroup });
    }

    return sections;
  };

  const sections = getGroupedData();
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.notificationCenter.title}</Text>
          <Pressable
            disabled={!hasUnread || markAllAsReadMutation.isPending}
            onPress={handleMarkAllAsRead}
            style={[styles.markAllBtn, (!hasUnread || markAllAsReadMutation.isPending) && styles.disabledBtn]}
            hitSlop={10}
          >
            <Text style={[styles.markAllText, { color: hasUnread ? colors.primary : colors.textMuted }]}>
              {t.notificationCenter.markAllRead}
            </Text>
          </Pressable>
        </View>

        {/* Content list */}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t.notificationCenter.noNotifications}</Text>
            <Text style={styles.emptySubtitle}>{t.notificationCenter.noNotificationsDesc}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NotificationRow
                item={item}
                language={language}
                colors={colors}
                styles={styles}
                onPress={() => handleRowPress(item)}
                onDelete={() => deleteMutation.mutate(item.id)}
                formatTimeAgo={formatTimeAgo}
                getNotificationIcon={getNotificationIcon}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || isFetching}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgBase,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    backBtn: {
      padding: 4,
      marginLeft: -4,
    },
    headerTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      fontWeight: "700",
    },
    markAllBtn: {
      padding: 4,
    },
    markAllText: {
      ...typography.bodyStrong,
      fontSize: 14,
    },
    disabledBtn: {
      opacity: 0.5,
    },
    listContent: {
      paddingBottom: spacing.xxl,
    },
    sectionHeaderWrap: {
      backgroundColor: colors.bgBase,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xs,
    },
    sectionTitle: {
      ...typography.caption,
      fontWeight: "700",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    notifRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.bgElevated,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.xs,
      borderRadius: radius.md,
      position: "relative",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    notifRowUnread: {
      backgroundColor: colors.primary === "#A56CFF" ? "rgba(165,108,255,0.06)" : "rgba(142,87,245,0.05)",
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    unreadDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      position: "absolute",
      left: 6,
      top: 6,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },
    contentWrap: {
      flex: 1,
      gap: 2,
    },
    textHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.sm,
    },
    notifTitle: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: "500",
      flex: 1,
    },
    notifTitleUnread: {
      ...typography.bodyStrong,
      color: colors.textPrimary,
    },
    timeText: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 10,
    },
    messageText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 16,
    },
    deleteBtn: {
      padding: 8,
      marginLeft: spacing.sm,
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xxl,
      gap: spacing.md,
    },
    emptyIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.textPrimary,
      textAlign: "center",
      fontWeight: "600",
    },
    emptySubtitle: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
    },
  });
