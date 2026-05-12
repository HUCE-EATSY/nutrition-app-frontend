import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { t } from "@/constants/i18n";
import { colors } from "@/constants";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { useAuthStore } from "@/hooks/store/authStore";
import { getDraftResumePath, getPublicResumePath } from "@/hooks/utils/onboarding";

export default function IndexScreen() {
  const hydrated = useOnboardingStore((state) => state.hydrated);
  const authHydrated = useAuthStore((state) => state.isAuthenticated !== undefined); // Simple check for hydration if needed, but isAuthenticated is boolean
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const publicFlowStep = useOnboardingStore((state) => state.publicFlowStep);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);
  const draft = useOnboardingStore((state) => state.draft);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase }}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: "white", marginTop: 20 }}>{t.app.initializing}</Text>
      </View>
    );
  }

  // If not authenticated, always go to welcome
  if (!isAuthenticated) {
    return <Redirect href="/(public)/welcome" />;
  }

  // If authenticated but finished onboarding, go to home
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If authenticated but not finished onboarding, resume onboarding
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgBase }}>
       <Redirect href={publicFlowStep !== "done" ? getPublicResumePath(publicFlowStep) : getDraftResumePath(draft)} />
       <Text style={{ color: 'white', marginBottom: 20 }}>Redirecting...</Text>
       <ActivityIndicator color={colors.primary} />
    </View>
  );
}
