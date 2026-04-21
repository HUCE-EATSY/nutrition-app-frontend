import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type TrialBannerProps = {
  title: string;
  ctaLabel: string;
  onPress: () => void;
};

export function TrialBanner({ title, ctaLabel, onPress }: TrialBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.kicker}>DNT PRO</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable onPress={onPress} style={styles.cta}>
        <Text style={styles.ctaLabel}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.xl,
    backgroundColor: "rgba(165,108,255,0.16)",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 180,
    gap: 6,
  },
  kicker: {
    ...typography.caption,
    color: colors.warning,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cta: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignSelf: "flex-start",
  },
  ctaLabel: {
    ...typography.caption,
    color: colors.bgBase,
    fontWeight: "700",
  },
});
