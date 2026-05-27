import {
  GoogleSans_400Regular,
  GoogleSans_600SemiBold,
  GoogleSans_700Bold,
  useFonts,
} from "@expo-google-fonts/google-sans";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { View, ActivityIndicator, Text } from "react-native";

import { colors } from "@/constants";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuthStore } from "@/store/authStore";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: Infinity,
    },
  },
});

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    GoogleSans_400Regular,
    GoogleSans_600SemiBold,
    GoogleSans_700Bold,
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

  // Auth protection logic
  useEffect(() => {
    if (!loaded || !hydrated || !authHydrated) return;

    const [firstSegment, secondSegment] = segments as string[];
    const inPublicGroup = firstSegment === "(public)";
    const isMascotIntro = secondSegment === "mascot-intro";

    if (!isAuthenticated && !inPublicGroup) {
      // Redirect to the welcome page if not authenticated and not in public group
      router.replace("/(public)/welcome");
    } else if (isAuthenticated && inPublicGroup && !isMascotIntro) {
      // If we are authenticated but in a public screen (like welcome or social-login), 
      // go back to the index to let it decide where to go (home or onboarding)
      router.replace("/");
    }
  }, [isAuthenticated, segments, loaded, hydrated, authHydrated, router]);

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
          <Stack.Screen name="create-food" options={{ presentation: "modal" }} />
          <Stack.Screen name="create-recipe" options={{ presentation: "modal" }} />
          <Stack.Screen name="webview" options={{ presentation: "modal" }} />
          <Stack.Screen name="detect-food" options={{ presentation: "modal" }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}