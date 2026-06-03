import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { subscriptionService } from "../../services/subscriptionService";
import { useAuthStore } from "../../store/authStore";

export const SUBSCRIPTION_QUERY_KEYS = {
  all: ["subscription"] as const,
  me: () => [...SUBSCRIPTION_QUERY_KEYS.all, "me"] as const,
};

/**
 * Hook lấy trạng thái Premium của user hiện tại.
 * - Chỉ chạy khi isAuthenticated = true
 * - Tự động cập nhật authStore.setPremiumStatus() khi có data
 * - refetchOnWindowFocus: true → khi user mở lại app sau khi admin grant premium, sẽ cập nhật ngay
 */
export const useSubscriptionQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPremiumStatus = useAuthStore((state) => state.setPremiumStatus);

  const query = useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.me(),
    queryFn: subscriptionService.getMySubscription,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: true,  // Refetch khi app được focus lại
    retry: false,
  });

  // Đồng bộ vào authStore mỗi khi data thay đổi
  useEffect(() => {
    if (query.data) {
      setPremiumStatus(
        query.data.isPremium,
        query.data.planCode,
        query.data.expiresAt
      );
    }
  }, [query.data, setPremiumStatus]);

  return query;
};
