import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography, shadows } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type OptionCardProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  accent?: string;
  selected?: boolean;
  onPress: () => void;
};

export function OptionCard({ title, subtitle, icon, accent, selected = false, onPress }: OptionCardProps) {
  const appColors = useAppColors();
  const activeAccent = accent || appColors.primary;
  const styles = useMemo(() => getStyles(appColors), [appColors]);
  // Light mode needs a more visible tint since the base is already light
  const selectedBg = `${activeAccent}${appColors.bgBase === '#111020' ? '14' : '26'}`;

  return (
    <Pressable 
      accessibilityRole="button"
      onPress={onPress} 
      pointerEvents="box-only"
      style={({ pressed }) => [
        styles.card,
        !subtitle && styles.cardNoSubtitle,
        selected && {
          borderColor: activeAccent,
          backgroundColor: selectedBg,
          elevation: 0,
          shadowOpacity: 0,
        },
        pressed && styles.pressed
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${activeAccent}22` }]}>
        <Text style={styles.iconText} selectable={false} selectionColor="rgba(0,0,0,0)">{icon ?? "•"}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} selectable={false} selectionColor="rgba(0,0,0,0)">{title}</Text>
        {subtitle ? <Text style={styles.subtitle} selectable={false} selectionColor="rgba(0,0,0,0)">{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && { borderColor: activeAccent, backgroundColor: activeAccent }]} />
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    minHeight: 92,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card,
  },
  cardNoSubtitle: {
    minHeight: 76,
    padding: spacing.md,
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
    borderColor: colors.border,
  },
});
