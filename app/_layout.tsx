import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { View, ActivityIndicator, Text, Platform } from "react-native";

import { colors } from "@/constants";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { useAuthStore } from "@/hooks/store/authStore";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import global CSS for web
if (Platform.OS === 'web') {
  require('../global.css');
}

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.primaryDark,
    background: colors.bgBase,
    surface: colors.surface,
  },
};

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const hydrated = useOnboardingStore((state) => state.hydrated);
  const authHydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  useEffect(() => {
    if (colors && colors.bgBase) {
      SystemUI.setBackgroundColorAsync(colors.bgBase).catch(() => undefined);
    }
  }, []);

  const userInfo = useAuthStore((state) => state.userInfo);

  // Auth protection logic — role-based routing
  useEffect(() => {
    if (!loaded || !hydrated || !authHydrated) return;

    const [firstSegment] = segments as string[];
    const inPublicGroup = firstSegment === '(public)';
    const inAdminGroup = firstSegment === 'admin';
    const inOnboardingGroup = firstSegment === '(onboarding)';
    const role = userInfo?.role;

    if (inAdminGroup) {
      // Admin group handles its own auth via useAdminAuth — don't interfere
      return;
    }

    if (!isAuthenticated && !inPublicGroup && !inOnboardingGroup) {
      // Chưa login → về trang welcome
      router.replace('/(public)/welcome');
    } else if (isAuthenticated && inPublicGroup) {
      const [, secondSegment] = segments as string[];
      // Đã login và đang ở public page (ngoại trừ mascot-intro phục vụ onboarding) → redirect về app chính
      if (secondSegment !== 'mascot-intro') {
        router.replace('/');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, segments, userInfo, loaded, hydrated, authHydrated]);

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.bgBase ?? '#111020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors?.primary ?? '#A56CFF'} size="large" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  if (!hydrated || !authHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.bgBase ?? '#111020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors?.primary ?? '#A56CFF'} size="large" />
        <Text style={{ color: 'white', marginTop: 10 }}>Hydrating stores...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bgBase }, headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quick-add" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
          <Stack.Screen name="calendar" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
          <Stack.Screen name="guide/[type]" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
          <Stack.Screen name="log-weight" options={{ presentation: "modal" }} />
          <Stack.Screen name="webview" options={{ presentation: "modal" }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}