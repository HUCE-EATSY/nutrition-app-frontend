import { apiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

export interface SubscriptionStatus {
  isPremium: boolean;
  planCode?: string;
  planName?: string;
  expiresAt?: string;
}

export const subscriptionService = {
  /**
   * GET /api/Subscription/me
   * Lấy trạng thái Premium của user đang đăng nhập.
   * Trả về { isPremium: false } nếu user thường hoặc chưa có gói.
   */
  getMySubscription: async (): Promise<SubscriptionStatus> => {
    try {
      const response = await apiClient.get(API_URLS.subscription.me);
      const data = response.data?.data ?? response.data;
      return {
        isPremium: data?.isPremium === true,
        planCode: data?.planCode,
        planName: data?.planName,
        expiresAt: data?.expiresAt,
      };
    } catch {
      // Nếu lỗi mạng hoặc lỗi khác → mặc định coi là không premium
      return { isPremium: false };
    }
  },
};
