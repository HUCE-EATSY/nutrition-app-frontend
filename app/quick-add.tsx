import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { t } from "@/constants/i18n";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { colors, spacing, typography } from "@/constants";

export default function QuickAddModal() {
  const params = useLocalSearchParams<{ selectedDate?: string; hour?: string }>();

  return (
    <SafeScreen>
      <View style={styles.screen}>
        <Text style={styles.title}>{t.quickAdd.title}</Text>
        <SurfaceCard>
          <Text style={styles.cardTitle}>{t.quickAdd.cardTitle}</Text>
          <Text style={styles.cardBody}>{t.quickAdd.selectedDate(params.selectedDate ?? t.common.today)}</Text>
          <Text style={styles.cardBody}>{t.quickAdd.hour(params.hour ?? t.common.none)}</Text>
        </SurfaceCard>
        <GradientButton label={t.common.close} onPress={() => router.back()} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
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
