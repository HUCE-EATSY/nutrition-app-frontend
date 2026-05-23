import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { t } from "@/constants/i18n";
import { colors } from "@/constants";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { getDraftResumePath, getPublicResumePath } from "@/utils/onboarding";

export default function IndexScreen() {
  // Lấy trạng thái hydrated từ cả hai store để tránh race condition
  const onboardingHydrated = useOnboardingStore((state) => state.hydrated);
  const authHydrated = useAuthStore((state) => state.hydrated);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const publicFlowStep = useOnboardingStore((state) => state.publicFlowStep);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const draft = useOnboardingStore((state) => state.draft);

  // Đợi cho đến khi cả hai store được khôi phục dữ liệu đầy đủ
  if (!onboardingHydrated || !authHydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: "white", marginTop: 20 }}>{t.app.initializing}</Text>
      </View>
    );
  }

  // Nếu chưa đăng nhập, chuyển đến màn hình chào mừng
  if (!isAuthenticated) {
    return <Redirect href="/(public)/welcome" />;
  }

  // Nếu đã đăng nhập và hoàn thành onboarding, vào màn hình chính
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Nếu đã đăng nhập nhưng chưa hoàn thành onboarding, tiếp tục tiến trình tương ứng
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase }}>
      <Redirect href={publicFlowStep !== "done" ? getPublicResumePath(publicFlowStep) : getDraftResumePath(draft)} />
      <Text style={{ color: 'white', marginBottom: 20 }}>Redirecting...</Text>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}