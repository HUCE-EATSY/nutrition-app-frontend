import { apiClient } from "./apiClient";
import { API_BASE } from "../constants/api";

export type SubscriptionPlanMe = {
  isPremium: boolean;
  plan: string;
  status: string;
  planCode: string;
  planName: string;
  expiresAt?: string;
  statusValue?: number;
};

export type SubscriptionPlan = {
  id: number;
  code: string;
  name: string;
  price: number;
  durationDays: number;
};

export type CreateOrderResponse = {
  orderId: string;
  qrUrl: string;
  amount: number;
  planName: string;
  accountName: string;
  accountNo: string;
  bankId: string;
};

export type OrderStatusResponse = {
  status: "PAID" | "PENDING" | "FAILED";
};

export const subscriptionService = {
  getSubscriptionMe: async (): Promise<SubscriptionPlanMe> => {
    const response = await apiClient.get(`${API_BASE}/api/Subscription/me`);
    return response.data.data;
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get(`${API_BASE}/api/Subscription/plans`);
    return response.data.data;
  },

  createVietQrOrder: async (planId: number): Promise<CreateOrderResponse> => {
    const response = await apiClient.post(`${API_BASE}/api/Subscription/vietqr/create-order`, { planId });
    return response.data.data;
  },

  checkOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    const response = await apiClient.get(`${API_BASE}/api/Subscription/vietqr/${orderId}/status`);
    return response.data.data;
  },

  mockWebhookCallback: async (orderId: string): Promise<any> => {
    const response = await apiClient.post(`${API_BASE}/api/Subscription/vietqr/callback`, { orderId, status: "PAID" });
    return response.data;
  },
};
