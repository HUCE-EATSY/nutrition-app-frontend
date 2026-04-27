import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { View, ActivityIndicator, Text } from "react-native";

import { colors } from "@/constants";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";

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

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  
  const hydrated = useOnboardingStore((state: any) => state.hydrated);

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

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.bgBase ?? '#111020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors?.primary ?? '#A56CFF'} size="large" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }
  
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors?.bgBase ?? '#111020', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors?.primary ?? '#A56CFF'} size="large" />
        <Text style={{ color: 'white', marginTop: 10 }}>Hydrating store...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bgBase }, headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quick-add" options={{ presentation: "modal" }} />
        <Stack.Screen name="webview" options={{ presentation: "modal" }} />
      </Stack>
    </PaperProvider>
  );
}
