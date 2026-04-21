import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type OptionCardProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  accent?: string;
  selected?: boolean;
  onPress: () => void;
};

export function OptionCard({ title, subtitle, icon, accent = colors.primary, selected = false, onPress }: OptionCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <Text style={styles.iconText}>{icon ?? "•"}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && { borderColor: accent, backgroundColor: accent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(165,108,255,0.12)",
  },
  pressed: {
    opacity: 0.96,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
});
