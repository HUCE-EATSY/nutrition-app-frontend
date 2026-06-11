import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "../../services/subscriptionService";

export const SUBSCRIPTION_QUERY_KEYS = {
  all: ["subscription"] as const,
  me: () => [...SUBSCRIPTION_QUERY_KEYS.all, "me"] as const,
  plans: () => [...SUBSCRIPTION_QUERY_KEYS.all, "plans"] as const,
  status: (orderId: string) => [...SUBSCRIPTION_QUERY_KEYS.all, "status", orderId] as const,
};

export const useMySubscriptionQuery = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.me(),
    queryFn: subscriptionService.getSubscriptionMe,
  });
};

export const useSubscriptionPlansQuery = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.plans(),
    queryFn: subscriptionService.getSubscriptionPlans,
    staleTime: 1000 * 60 * 10, // Cache 10 phút vì plans ít thay đổi
  });
};

export const useCreateOrderMutation = () => {
  return useMutation({
    mutationFn: (planId: number) => subscriptionService.createVietQrOrder(planId),
  });
};

export const useOrderStatusQuery = (orderId: string, enabled: boolean) => {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.status(orderId),
    queryFn: () => subscriptionService.checkOrderStatus(orderId),
    enabled: enabled && !!orderId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
};

export const useMockCallbackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => subscriptionService.mockWebhookCallback(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEYS.me() });
    },
  });
};
