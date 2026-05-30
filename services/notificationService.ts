import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

export type NotificationType = {
  id: number;
  notificationTypeId: number;
  notificationTypeCode: string;
  notificationNameVi: string;
  notificationNameEn: string;
  isEnabled: boolean;
  reminderTime: string | null; // "HH:mm"
  daysOfWeek: string | null; // "2,3,4,5,6"
};

export type UpdateNotificationSettingRequest = {
  notificationTypeId: number;
  isEnabled: boolean;
  reminderTime?: string; // "HH:mm"
  daysOfWeek?: string; // "2,3,4,5,6"
};

export type Notification = {
  id: string;
  notificationTypeId: number;
  notificationTypeCode: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export const notificationService = {
  /** GET /api/notifications/settings - Lấy cài đặt thông báo */
  getSettings: async (): Promise<NotificationType[]> => {
    const response = await apiClient.get(API_URLS.notifications.settings);
    return response.data.data;
  },

  /** PUT /api/notifications/settings - Cập nhật cài đặt */
  updateSetting: async (data: UpdateNotificationSettingRequest): Promise<NotificationType> => {
    const response = await apiClient.put(API_URLS.notifications.settings, data);
    return response.data.data;
  },

  /** GET /api/notifications - Danh sách thông báo */
  getNotifications: async (isRead?: boolean, page = 1, pageSize = 20): Promise<Notification[]> => {
    const params: any = { page, pageSize };
    if (isRead !== undefined) params.isRead = isRead;
    
    const response = await apiClient.get(API_URLS.notifications.list, { params });
    return response.data.data;
  },

  /** POST /api/notifications/mark-as-read - Đánh dấu đã đọc */
  markAsRead: async (notificationIds: string[]): Promise<number> => {
    const response = await apiClient.post(API_URLS.notifications.markAsRead, {
      notificationIds,
    });
    return response.data.data;
  },

  /** POST /api/notifications/mark-all-as-read - Đánh dấu tất cả */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiClient.post(API_URLS.notifications.markAllAsRead);
    return response.data.data;
  },

  /** DELETE /api/notifications/{id} - Xóa thông báo */
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(API_URLS.notifications.delete(id));
  },

  /** GET /api/notifications/unread-count - Số lượng chưa đọc */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get(API_URLS.notifications.unreadCount);
    return response.data.data;
  },

  /** POST /api/notifications/register-token - Đăng ký device token */
  registerToken: async (deviceToken: string, deviceType?: string): Promise<void> => {
    await apiClient.post(API_URLS.notifications.registerToken, {
      deviceToken,
      deviceType: deviceType || 'expo',
    });
  },
};
