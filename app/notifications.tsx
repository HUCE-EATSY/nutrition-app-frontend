import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { notificationService, Notification } from "@/services/notificationService";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông báo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }

  async function handleMarkAsRead(id: string) {
    try {
      await notificationService.markAsRead([id]);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch {
      Alert.alert("Lỗi", "Không thể đánh dấu tất cả");
    }
  }

  async function handleDelete(id: string) {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa thông báo này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await notificationService.deleteNotification(id);
              setNotifications(prev => prev.filter(n => n.id !== id));
            } catch {
              Alert.alert("Lỗi", "Không thể xóa thông báo");
            }
          },
        },
      ]
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons color={colors.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>
          Thông báo {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <Pressable hitSlop={12} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllBtn}>Đọc tất cả</Text>
          </Pressable>
        )}
        {unreadCount === 0 && <View style={{ width: 24 }} />}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons color={colors.textMuted} name="notifications-off-outline" size={64} />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => !item.isRead && handleMarkAsRead(item.id)}
            style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
          >
            <View style={styles.notifHeader}>
              <View style={styles.notifTitleRow}>
                {!item.isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                  {item.title}
                </Text>
              </View>
              <Pressable hitSlop={8} onPress={() => handleDelete(item.id)}>
                <Ionicons color={colors.textMuted} name="trash-outline" size={18} />
              </Pressable>
            </View>
            <Text style={styles.notifMessage}>{item.message}</Text>
            <Text style={styles.notifTime}>
              {new Date(item.createdAt).toLocaleString("vi-VN")}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.bodyStrong, color: colors.textPrimary },
  markAllBtn: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  notifCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  notifCardUnread: {
    backgroundColor: "rgba(165,108,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(165,108,255,0.2)",
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flex: 1,
  },
  notifTitleUnread: {
    color: colors.primary,
  },
  notifMessage: {
    ...typography.body,
    color: colors.textSecondary,
  },
  notifTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
