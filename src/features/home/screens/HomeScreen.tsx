import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/src/components/buttons/GradientButton";
import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { t } from "@/src/i18n";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { colors, spacing, typography } from "@/src/theme";

export function HomeScreen() {
  const nickname = useOnboardingStore((state) => state.draft.nickname ?? t.home.defaultNickname);

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={styles.kicker}>{t.home.kicker}</Text>
        <Text style={styles.title}>{t.home.title(nickname)}</Text>

        <SurfaceCard>
          <Text style={styles.cardTitle}>{t.home.focusTitle}</Text>
          <Text style={styles.cardBody}>{t.home.focusBody}</Text>
        </SurfaceCard>

        <SurfaceCard>
          <Text style={styles.cardTitle}>{t.home.actionsTitle}</Text>
          <Text style={styles.cardBody}>{t.home.actionOne}</Text>
          <Text style={styles.cardBody}>{t.home.actionTwo}</Text>
          <Text style={styles.cardBody}>{t.home.actionThree}</Text>
        </SurfaceCard>

        <GradientButton label={t.home.cta} onPress={() => router.push("/(tabs)/diary")} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  kicker: {
    ...typography.caption,
    color: colors.warning,
    textTransform: "uppercase",
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
