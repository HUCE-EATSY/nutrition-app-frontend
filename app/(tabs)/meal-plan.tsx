import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { SegmentedPillTabs } from "@/components/meal/SegmentedPillTabs";
import { t } from "@/constants/i18n";
import { colors, spacing, typography } from "@/constants";
import { useResponsiveLayout } from "@/constants/responsive";

const tabs = [
  { key: "explore", label: t.mealPlan.tabs.explore },
  { key: "saved", label: t.mealPlan.tabs.saved },
  { key: "history", label: t.mealPlan.tabs.history },
];

export default function MealPlanScreen() {
  const [activeTab, setActiveTab] = useState("explore");
  const { isNarrowWidth } = useResponsiveLayout();

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={[styles.title, isNarrowWidth && styles.titleCompact]}>{t.mealPlan.title}</Text>
        <Text style={styles.description}>{t.mealPlan.description}</Text>

        <SegmentedPillTabs activeKey={activeTab} items={tabs} onChange={setActiveTab} />

        <SurfaceCard style={[styles.emptyCard, isNarrowWidth && styles.emptyCardCompact]}>
          <Text style={styles.emoji}>{t.mealPlan.emptyEmoji}</Text>
          <Text style={[styles.emptyTitle, isNarrowWidth && styles.emptyTitleCompact]}>{t.mealPlan.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{t.mealPlan.emptyBody}</Text>
        </SurfaceCard>

        <GradientButton label={t.mealPlan.createCta} onPress={() => undefined} />
        <GradientButton disabled label={t.mealPlan.savedCta} onPress={() => undefined} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  titleCompact: {
    ...typography.h1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
  },
  emptyCardCompact: {
    minHeight: 250,
  },
  emoji: {
    fontSize: 64,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptyTitleCompact: {
    ...typography.h3,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
