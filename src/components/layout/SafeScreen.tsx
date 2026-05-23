import { ReactNode } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { layout } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";

type SafeScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  withBackgroundGlow?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function SafeScreen({
  children,
  scrollable = false,
  withBackgroundGlow = true,
  contentContainerStyle,
}: SafeScreenProps) {
  const { horizontalPadding } = useResponsiveLayout();
  const innerContentStyle = [
    styles.contentBase,
    { paddingHorizontal: horizontalPadding },
    scrollable ? styles.scrollContent : styles.staticContent,
    contentContainerStyle,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewport}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenBackground withGlow={withBackgroundGlow}>
          <SafeAreaView style={styles.safeArea}>
            <View style={innerContentStyle}>{children}</View>
          </SafeAreaView>
        </ScreenBackground>
      </ScrollView>
    );
  }

  return (
    <ScreenBackground withGlow={withBackgroundGlow}>
      <SafeAreaView style={styles.safeArea}>
        <View style={innerContentStyle}>{children}</View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollViewport: {
    flexGrow: 1,
  },
  contentBase: {
    width: "100%",
    maxWidth: layout.maxCardWidth,
    alignSelf: "center",
    paddingBottom: layout.safeBottom,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});
