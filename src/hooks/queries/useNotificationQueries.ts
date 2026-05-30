import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService, UpdateNotificationSettingRequest } from "../../services/notificationService";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  settings: () => [...NOTIFICATION_QUERY_KEYS.all, "settings"] as const,
  list: (isRead?: boolean) => [...NOTIFICATION_QUERY_KEYS.all, "list", { isRead }] as const,
  unreadCount: () => [...NOTIFICATION_QUERY_KEYS.all, "unreadCount"] as const,
};

export const useGetNotificationSettings = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.settings(),
    queryFn: notificationService.getNotificationSettings,
  });
};

export const useUpdateNotificationSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateNotificationSettingRequest) =>
      notificationService.updateNotificationSetting(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.settings() });
    },
  });
};

export const useGetNotifications = (isRead?: boolean, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(isRead),
    queryFn: () => notificationService.getNotifications(isRead, page, pageSize),
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    // Poll unread count every 30 seconds for real-time experience
    refetchInterval: 30000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) => notificationService.markAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};
