import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Portal, Dialog, Button, TextInput as PaperTextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { SafeScreen } from "@/components/layout/SafeScreen";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

interface CustomReminder {
  id: string;
  title: string;
  body: string;
  time: string; // "HH:MM"
  isEnabled: boolean;
  category: "water" | "meal" | "exercise" | "weight";
  triggerId?: string;
}

const STORAGE_KEY = "WAO_LOCAL_REMINDERS";

const CATEGORIES = [
  { key: "water", label: "Nước uống", icon: "water", color: "#34C759" },
  { key: "meal", label: "Bữa ăn", icon: "restaurant", color: "#FF9500" },
  { key: "exercise", label: "Luyện tập", icon: "fitness", color: "#FF2D55" },
  { key: "weight", label: "Cân nặng", icon: "scale", color: "#5856D6" }
] as const;

export default function RemindersScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [reminders, setReminders] = useState<CustomReminder[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  // Add/Edit Modal States
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"water" | "meal" | "exercise" | "weight">("water");
  const [timeValue, setTimeValue] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const triggerToast = (msg: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  // Load reminders on mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setReminders(JSON.parse(stored));
        } else {
          // Initialize default reminders
          const defaults: CustomReminder[] = [
            { id: "def_water", title: "🥛 Đã đến lúc uống nước!", body: "Nhắc nhở uống nước mỗi sáng để thanh lọc cơ thể.", time: "08:00", isEnabled: false, category: "water" },
            { id: "def_meal", title: "🥗 Bữa trưa ăn sạch", body: "Ăn đúng giờ để duy trì năng lượng làm việc nhé.", time: "12:00", isEnabled: false, category: "meal" },
            { id: "def_weight", title: "⚖️ Ghi nhận cân nặng", body: "Cập nhật cân nặng mỗi tuần để theo dõi sát sao mục tiêu.", time: "20:00", isEnabled: false, category: "weight" }
          ];
          setReminders(defaults);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
      } catch (err) {
        console.error("Failed to load reminders:", err);
      }
    };

    loadReminders();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "web") return;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    } catch (e) {
      console.warn("Notification permission request failed", e);
    }
  };

  // In-app mock notifier interval to trigger alerts/toasts when reminders match current time
  useEffect(() => {
    let lastCheckedMinute = "";
    
    const interval = setInterval(() => {
      const now = new Date();
      const currentMinStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      if (currentMinStr === lastCheckedMinute) return;
      
      // Find any enabled reminder matching current time
      const matchingReminders = reminders.filter(
        (r) => r.isEnabled && r.time === currentMinStr
      );
      
      if (matchingReminders.length > 0) {
        lastCheckedMinute = currentMinStr;
        matchingReminders.forEach((reminder) => {
          Alert.alert(
            reminder.title,
            reminder.body,
            [{ text: "Đã hiểu", style: "default" }]
          );
          triggerToast(`⏰ Nhắc nhở: ${reminder.title}`, "success");
        });
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [reminders]);

  const saveToStorage = async (list: CustomReminder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save reminders:", err);
    }
  };

  // Schedule or cancel local notification based on state
  const handleToggleReminder = async (id: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    
    // Optimistic UI update
    const updated = reminders.map((r) => (r.id === id ? { ...r, isEnabled: nextVal } : r));
    setReminders(updated);
    
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    try {
      if (nextVal) {
        // Schedule new notification
        let triggerId: string | undefined;
        if (Platform.OS !== "web") {
          try {
            const [hStr, mStr] = reminder.time.split(":");
            const hour = parseInt(hStr, 10);
            const minute = parseInt(mStr, 10);
            
            triggerId = await Notifications.scheduleNotificationAsync({
              content: {
                title: reminder.title,
                body: reminder.body,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
              } as any,
            });
          } catch (nativeErr) {
            console.warn("Native scheduling failed, using mock trigger:", nativeErr);
            triggerId = "mock_" + Date.now() + "_" + Math.random().toString().substring(2, 6);
          }
        } else {
          // Mock trigger on web
          triggerId = "web_" + Math.random().toString();
        }

        const finalUpdated = updated.map((r) => (r.id === id ? { ...r, triggerId } : r));
        setReminders(finalUpdated);
        await saveToStorage(finalUpdated);
        triggerToast("Đã kích hoạt báo thức thành công! ⏰", "success");
      } else {
        // Cancel existing notification
        if (reminder.triggerId) {
          if (Platform.OS !== "web" && !reminder.triggerId.startsWith("mock_") && !reminder.triggerId.startsWith("web_")) {
            try {
              await Notifications.cancelScheduledNotificationAsync(reminder.triggerId);
            } catch (cancelErr) {
              console.warn("Failed to cancel native notification:", cancelErr);
            }
          }
        }
        const finalUpdated = updated.map((r) => (r.id === id ? { ...r, triggerId: undefined } : r));
        setReminders(finalUpdated);
        await saveToStorage(finalUpdated);
        triggerToast("Đã tắt báo thức", "info");
      }
    } catch (error) {
      console.error("Error scheduling notification", error);
      triggerToast("Không thể thiết lập báo thức", "error");
    }
  };

  const handleTestNotification = async () => {
    try {
      triggerToast("Báo thức thử nghiệm sẽ xuất hiện sau 3 giây...", "info");
      let success = false;
      
      if (Platform.OS !== "web") {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🔔 Báo thức thử nghiệm từ Wao!",
              body: "Tính năng nhắc nhở và báo thức hoạt động hoàn hảo!",
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 3,
            } as any,
          });
          success = true;
        } catch (nativeErr) {
          console.warn("Native test notification failed, falling back to alert:", nativeErr);
        }
      }
      
      if (!success) {
        setTimeout(() => {
          Alert.alert("🔔 Báo thức thử nghiệm từ Wao!", "Tính năng nhắc nhở và báo thức hoạt động hoàn hảo!");
        }, 3000);
      }
    } catch (err) {
      triggerToast("Lỗi khi gửi thông báo", "error");
    }
  };

  const openAddDialog = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setCategory("water");
    setTimeValue(new Date());
    setDialogVisible(true);
  };

  const openEditDialog = (item: CustomReminder) => {
    setEditingId(item.id);
    setTitle(item.title);
    setBody(item.body);
    setCategory(item.category);
    
    const [h, m] = item.time.split(":");
    const d = new Date();
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    setTimeValue(d);
    
    setDialogVisible(true);
  };

  const handleSaveReminder = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    const hours = String(timeValue.getHours()).padStart(2, "0");
    const minutes = String(timeValue.getMinutes()).padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    let updatedList: CustomReminder[];

    if (editingId) {
      // Editing
      const existing = reminders.find((r) => r.id === editingId);
      if (existing && existing.isEnabled && existing.triggerId && Platform.OS !== "web") {
        // Cancel old scheduled notification
        await Notifications.cancelScheduledNotificationAsync(existing.triggerId);
      }

      updatedList = reminders.map((r) => {
        if (r.id === editingId) {
          return {
            ...r,
            title,
            body,
            category,
            time: timeStr,
            isEnabled: false, // Turn off by default to let them re-enable
            triggerId: undefined
          };
        }
        return r;
      });
      triggerToast("Đã cập nhật nhắc nhở! Hãy bật lại để kích hoạt. 📝", "success");
    } else {
      // Adding new
      const newItem: CustomReminder = {
        id: "reminder_" + Date.now(),
        title,
        body,
        category,
        time: timeStr,
        isEnabled: false,
      };
      updatedList = [...reminders, newItem];
      triggerToast("Đã thêm nhắc nhở mới thành công! ➕", "success");
    }

    setReminders(updatedList);
    await saveToStorage(updatedList);
    setDialogVisible(false);
  };

  const handleDeleteReminder = async (id: string) => {
    Alert.alert("Xóa báo thức", "Bạn có chắc muốn xóa báo thức nhắc nhở này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const item = reminders.find((r) => r.id === id);
          if (item?.triggerId && Platform.OS !== "web") {
            await Notifications.cancelScheduledNotificationAsync(item.triggerId);
          }
          const updated = reminders.filter((r) => r.id !== id);
          setReminders(updated);
          await saveToStorage(updated);
          triggerToast("Đã xóa báo thức", "info");
        }
      }
    ]);
  };

  const getCategoryDetails = (catKey: string) => {
    return CATEGORIES.find((c) => c.key === catKey) ?? CATEGORIES[0];
  };

  return (
    <SafeScreen>
      <View style={styles.container}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} hitSlop={15}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Nhắc nhở Cá nhân
          </Text>
          <TouchableOpacity onPress={handleTestNotification} style={styles.iconBtn} hitSlop={15}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Floating Test Trigger */}
        <View style={styles.testBanner}>
          <LinearGradient
            colors={["#A56CFF33", "#6236FF11"]}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <Ionicons name="sparkles-outline" size={20} color="#A56CFF" />
              <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
                Nhấp nút chuông phía trên để gửi thông báo đẩy thử nghiệm sau 3 giây!
              </Text>
            </View>
          </LinearGradient>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Create Alarm Card */}
          <TouchableOpacity
            style={styles.createCard}
            onPress={openAddDialog}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#A56CFF", "#6236FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createGradient}
            >
              <Ionicons name="time-outline" size={24} color="#fff" />
              <Text style={styles.createText}>Thiết lập báo thức mới +</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* List of custom alarms */}
          <View style={styles.alarmListSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              BÁO THỨC & NHẮC NHỞ CỦA BẠN ({reminders.length})
            </Text>
            
            {reminders.map((item) => {
              const cat = getCategoryDetails(item.category);
              
              return (
                <View
                  key={item.id}
                  style={[styles.alarmCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.alarmTopRow}>
                    <View style={[styles.categoryCircle, { backgroundColor: cat.color + "15" }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <Text style={styles.alarmTime}>{item.time}</Text>
                    <Switch
                      value={item.isEnabled}
                      onValueChange={() => handleToggleReminder(item.id, item.isEnabled)}
                      trackColor={{ false: "#333", true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View style={styles.alarmBody}>
                    <Text
                      style={[styles.alarmTitle, { color: colors.textPrimary }, !item.isEnabled && styles.alarmMuted]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.alarmDesc, { color: colors.textSecondary }, !item.isEnabled && styles.alarmMuted]}
                      numberOfLines={2}
                    >
                      {item.body}
                    </Text>
                  </View>

                  <View style={styles.alarmFooterRow}>
                    <Text style={[styles.categoryLabel, { color: cat.color }]}>
                      • {cat.label}
                    </Text>
                    <View style={styles.actionsGroup}>
                      <TouchableOpacity
                        onPress={() => openEditDialog(item)}
                        style={styles.actionBtn}
                        hitSlop={8}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteReminder(item.id)}
                        style={styles.actionBtn}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}

            {reminders.length === 0 && (
              <Text style={{ textAlign: "center", color: colors.textSecondary, marginTop: spacing.xxl }}>
                Chưa có báo thức nào được lập.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Dialog for Add/Edit Reminder */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={[styles.dialogContainer, { backgroundColor: colors.bgElevated }]}
        >
          <Dialog.Title style={{ color: colors.textPrimary, ...typography.h3 }}>
            {editingId ? "Sửa Nhắc Nhở" : "Thêm Nhắc Nhở Mới"}
          </Dialog.Title>
          
          <Dialog.Content style={styles.dialogContent}>
            <PaperTextInput
              mode="outlined"
              label="Tiêu đề thông báo"
              value={title}
              onChangeText={setTitle}
              theme={{ colors: { primary: colors.primary } }}
              textColor={colors.textPrimary}
              placeholder="Ví dụ: 🥛 Uống cốc nước lớn"
              style={styles.dialogInput}
            />

            <PaperTextInput
              mode="outlined"
              label="Nội dung thông báo"
              value={body}
              onChangeText={setBody}
              theme={{ colors: { primary: colors.primary } }}
              textColor={colors.textPrimary}
              placeholder="Uống nước lọc để cấp ẩm cho cơ thể..."
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
            />

            <Text style={[styles.dialogSubTitle, { color: colors.textSecondary }]}>
              Chọn phân loại:
            </Text>
            
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.catChip,
                    category === cat.key && { borderColor: cat.color, backgroundColor: cat.color + "15" }
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={category === cat.key ? cat.color : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      { color: category === cat.key ? cat.color : colors.textSecondary }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {Platform.OS === "web" ? (
              <View style={styles.webTimePicker}>
                <Text style={[styles.dialogSubTitle, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Thời gian báo thức (Giờ : Phút):
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <PaperTextInput
                    mode="outlined"
                    label="Giờ"
                    value={String(timeValue.getHours()).padStart(2, "0")}
                    onChangeText={(val) => {
                      const h = Math.min(23, Math.max(0, parseInt(val, 10) || 0));
                      const d = new Date(timeValue);
                      d.setHours(h);
                      setTimeValue(d);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{ flex: 1, backgroundColor: "transparent" }}
                    textColor={colors.textPrimary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                  <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: "700" }}>:</Text>
                  <PaperTextInput
                    mode="outlined"
                    label="Phút"
                    value={String(timeValue.getMinutes()).padStart(2, "0")}
                    onChangeText={(val) => {
                      const m = Math.min(59, Math.max(0, parseInt(val, 10) || 0));
                      const d = new Date(timeValue);
                      d.setMinutes(m);
                      setTimeValue(d);
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{ flex: 1, backgroundColor: "transparent" }}
                    textColor={colors.textPrimary}
                    theme={{ colors: { primary: colors.primary } }}
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.timeSelectorRow}>
                  <Text style={{ color: colors.textPrimary, ...typography.bodyStrong }}>
                    Thời gian báo thức:
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={styles.timeDisplayBtn}
                  >
                    <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 18 }}>
                      {String(timeValue.getHours()).padStart(2, "0")}:{String(timeValue.getMinutes()).padStart(2, "0")}
                    </Text>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                {showTimePicker && (
                  <DateTimePicker
                    value={timeValue}
                    mode="time"
                    is24Hour
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      setShowTimePicker(Platform.OS === "ios");
                      if (date) setTimeValue(date);
                    }}
                  />
                )}
              </>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor={colors.textSecondary}>
              Hủy
            </Button>
            <Button onPress={handleSaveReminder} textColor={colors.primary} labelStyle={{ fontWeight: "700" }}>
              Lưu
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Toast popup */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </SafeScreen>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: "#2C2C2E",
    },
    iconBtn: {
      padding: spacing.xs,
    },
    headerTitle: {
      ...typography.h3,
      fontSize: 18,
      fontWeight: "700",
    },
    testBanner: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      borderRadius: radius.md,
      overflow: "hidden",
    },
    bannerGradient: {
      padding: spacing.md,
    },
    bannerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    bannerText: {
      ...typography.caption,
      fontSize: 12,
      lineHeight: 16,
      flex: 1,
    },
    scrollContainer: {
      paddingBottom: spacing.xxl,
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
      paddingTop: spacing.md,
    },
    createCard: {
      borderRadius: radius.md,
      overflow: "hidden",
      shadowColor: "#A56CFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    createGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    createText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    alarmListSection: {
      gap: spacing.md,
    },
    sectionTitle: {
      ...typography.caption,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    alarmCard: {
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    alarmTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    categoryCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    alarmTime: {
      ...typography.display,
      fontSize: 28,
      fontWeight: "800",
      color: "#fff",
      flex: 1,
      marginLeft: spacing.md,
    },
    alarmBody: {
      gap: 2,
    },
    alarmTitle: {
      ...typography.bodyStrong,
      fontSize: 15,
    },
    alarmDesc: {
      ...typography.caption,
      fontSize: 13,
      lineHeight: 18,
    },
    alarmMuted: {
      opacity: 0.5,
    },
    alarmFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: "#333",
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
    },
    categoryLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    actionsGroup: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    actionBtn: {
      padding: 4,
    },
    dialogContainer: {
      borderRadius: radius.md,
    },
    dialogContent: {
      gap: spacing.md,
    },
    dialogInput: {
      backgroundColor: "transparent",
    },
    dialogSubTitle: {
      ...typography.bodyStrong,
      fontSize: 13,
      marginTop: spacing.xs,
    },
    categoryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    catChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: "#444",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },
    catChipText: {
      fontSize: 12,
      fontWeight: "600",
    },
    timeSelectorRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sm,
    },
    timeDisplayBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: "#444",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
    },
    webTimePicker: {
      marginTop: spacing.sm,
      gap: spacing.xs,
    }
  });
