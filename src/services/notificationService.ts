import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface UserNotificationSettingResponse {
  id: string;
  notificationTypeId: number;
  notificationTypeCode: string;
  notificationNameVi: string;
  notificationNameEn: string;
  isEnabled: boolean;
  reminderTime: string | null;
  daysOfWeek: string | null;
}

export interface UpdateNotificationSettingRequest {
  notificationTypeId: number;
  isEnabled: boolean;
  reminderTime?: string | null;
  daysOfWeek?: string | null;
}

export interface NotificationResponse {
  id: string;
  notificationTypeId: number;
  notificationTypeCode: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// Mock Data for fallback
let mockSettings: UserNotificationSettingResponse[] = [
  { id: "111", notificationTypeId: 1, notificationTypeCode: "MEAL_REMINDER", notificationNameVi: "Nhắc nhở bữa ăn", notificationNameEn: "Meal Reminder", isEnabled: true, reminderTime: "08:00", daysOfWeek: "2,3,4,5,6,7,8" },
  { id: "222", notificationTypeId: 2, notificationTypeCode: "EXERCISE_REMINDER", notificationNameVi: "Nhắc nhở tập luyện", notificationNameEn: "Exercise Reminder", isEnabled: true, reminderTime: "17:00", daysOfWeek: "2,4,6" },
  { id: "333", notificationTypeId: 3, notificationTypeCode: "WEIGHT_LOG_REMINDER", notificationNameVi: "Nhắc nhở cân nặng", notificationNameEn: "Weight Log Reminder", isEnabled: false, reminderTime: "07:00", daysOfWeek: "2" },
  { id: "444", notificationTypeId: 4, notificationTypeCode: "WATER_REMINDER", notificationNameVi: "Nhắc nhở uống nước", notificationNameEn: "Water Reminder", isEnabled: true, reminderTime: "10:00", daysOfWeek: "2,3,4,5,6,7,8" },
  { id: "555", notificationTypeId: 5, notificationTypeCode: "GOAL_ACHIEVED", notificationNameVi: "Đạt mục tiêu", notificationNameEn: "Goal Achieved", isEnabled: true, reminderTime: null, daysOfWeek: null },
  { id: "666", notificationTypeId: 6, notificationTypeCode: "DAILY_SUMMARY", notificationNameVi: "Tổng kết ngày", notificationNameEn: "Daily Summary", isEnabled: true, reminderTime: "21:00", daysOfWeek: "2,3,4,5,6,7,8" },
  { id: "777", notificationTypeId: 7, notificationTypeCode: "WEEKLY_REPORT", notificationNameVi: "Báo cáo tuần", notificationNameEn: "Weekly Report", isEnabled: true, reminderTime: "09:00", daysOfWeek: "8" },
];

let mockNotifications: NotificationResponse[] = [
  {
    id: "n1",
    notificationTypeId: 5,
    notificationTypeCode: "GOAL_ACHIEVED",
    title: "Tuyệt vời!",
    message: "Bạn đã hoàn thành 100% mục tiêu bước chân hôm nay! Hãy tiếp tục phát huy nhé.",
    data: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "n2",
    notificationTypeId: 4,
    notificationTypeCode: "WATER_REMINDER",
    title: "Đã đến lúc uống nước",
    message: "Đã 2 tiếng kể từ lần cuối bạn ghi chép uống nước. Hãy nạp thêm 250ml nước lọc nhé.",
    data: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: "n3",
    notificationTypeId: 1,
    notificationTypeCode: "MEAL_REMINDER",
    title: "Thời gian cho bữa trưa",
    message: "Hãy ghi lại thực đơn bữa trưa của bạn để kiểm soát năng lượng nạp vào thật tốt.",
    data: null,
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
  },
  {
    id: "n4",
    notificationTypeId: 2,
    notificationTypeCode: "EXERCISE_REMINDER",
    title: "Lên lịch tập luyện hôm nay",
    message: "Chỉ cần 20-30 phút tập Cardio nhẹ nhàng hôm nay sẽ giúp thúc đẩy quá trình trao đổi chất của bạn.",
    data: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export const notificationService = {
  getNotificationSettings: async (): Promise<UserNotificationSettingResponse[]> => {
    if (USE_MOCK) {
      await delay(300);
      return [...mockSettings];
    }
    const response = await apiClient.get(API_URLS.notifications.settings);
    return response.data.data;
  },

  updateNotificationSetting: async (request: UpdateNotificationSettingRequest): Promise<UserNotificationSettingResponse> => {
    if (USE_MOCK) {
      await delay(300);
      const index = mockSettings.findIndex(s => s.notificationTypeId === request.notificationTypeId);
      if (index !== -1) {
        mockSettings[index] = {
          ...mockSettings[index],
          isEnabled: request.isEnabled,
          reminderTime: request.reminderTime !== undefined ? request.reminderTime : mockSettings[index].reminderTime,
          daysOfWeek: request.daysOfWeek !== undefined ? request.daysOfWeek : mockSettings[index].daysOfWeek,
        };
        return mockSettings[index];
      }
      throw new Error("Setting not found");
    }
    const response = await apiClient.put(API_URLS.notifications.settings, request);
    return response.data.data;
  },

  getNotifications: async (isRead?: boolean, page = 1, pageSize = 20): Promise<NotificationResponse[]> => {
    if (USE_MOCK) {
      await delay(300);
      let list = [...mockNotifications];
      if (isRead !== undefined) {
        list = list.filter(n => n.isRead === isRead);
      }
      return list.slice((page - 1) * pageSize, page * pageSize);
    }
    const response = await apiClient.get(API_URLS.notifications.list, {
      params: { isRead, page, pageSize },
    });
    return response.data.data;
  },

  markAsRead: async (notificationIds: string[]): Promise<number> => {
    if (USE_MOCK) {
      await delay(200);
      let count = 0;
      mockNotifications = mockNotifications.map(n => {
        if (notificationIds.includes(n.id) && !n.isRead) {
          count++;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
      return count;
    }
    const response = await apiClient.post(API_URLS.notifications.markAsRead, { notificationIds });
    return response.data.data;
  },

  markAllAsRead: async (): Promise<number> => {
    if (USE_MOCK) {
      await delay(200);
      let count = 0;
      mockNotifications = mockNotifications.map(n => {
        if (!n.isRead) {
          count++;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
      return count;
    }
    const response = await apiClient.post(API_URLS.notifications.markAllAsRead);
    return response.data.data;
  },

  deleteNotification: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      mockNotifications = mockNotifications.filter(n => n.id !== id);
      return;
    }
    await apiClient.delete(API_URLS.notifications.delete(id));
  },

  getUnreadCount: async (): Promise<number> => {
    if (USE_MOCK) {
      await delay(100);
      return mockNotifications.filter(n => !n.isRead).length;
    }
    const response = await apiClient.get(API_URLS.notifications.unreadCount);
    return response.data.data;
  },

  registerToken: async (token: string, platform: string): Promise<void> => {
    if (USE_MOCK) return;
    await apiClient.post(API_URLS.notifications.registerToken, { token, platform });
  },
};
