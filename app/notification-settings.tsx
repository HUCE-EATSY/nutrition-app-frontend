import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, typography, radius } from "@/constants";
import { notificationService, NotificationType } from "@/services/notificationService";

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await notificationService.getSettings();
      setSettings(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải cài đặt thông báo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(item: NotificationType) {
    try {
      setUpdating(item.notificationTypeId);
      const updated = await notificationService.updateSetting({
        notificationTypeId: item.notificationTypeId,
        isEnabled: !item.isEnabled,
        reminderTime: item.reminderTime || undefined,
        daysOfWeek: item.daysOfWeek || undefined,
      });
      
      setSettings(prev =>
        prev.map(s =>
          s.notificationTypeId === item.notificationTypeId
            ? { ...s, isEnabled: updated.isEnabled }
            : s
        )
      );
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật cài đặt");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
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
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Chọn loại thông báo bạn muốn nhận
        </Text>

        {settings.map((item) => (
          <View key={item.notificationTypeId} style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.notificationNameVi}</Text>
              {item.reminderTime && (
                <Text style={styles.settingDetail}>
                  ⏰ {item.reminderTime}
                  {item.daysOfWeek && ` • ${formatDaysOfWeek(item.daysOfWeek)}`}
                </Text>
              )}
            </View>
            {updating === item.notificationTypeId ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Switch
                value={item.isEnabled}
                onValueChange={() => handleToggle(item)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            )}
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons color={colors.info} name="information-circle-outline" size={20} />
          <Text style={styles.infoText}>
            Bạn có thể thay đổi giờ nhắc nhở trong phần cài đặt chi tiết
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDaysOfWeek(daysStr: string): string {
  const dayMap: Record<string, string> = {
    "2": "T2",
    "3": "T3",
    "4": "T4",
    "5": "T5",
    "6": "T6",
    "7": "T7",
    "8": "CN",
  };
  
  const days = daysStr.split(",").map(d => dayMap[d] || d);
  return days.join(", ");
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
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.md,
  },
  settingInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  settingTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  settingDetail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "rgba(52,152,219,0.1)",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.info,
    flex: 1,
  },
});
