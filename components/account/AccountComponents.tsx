import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors, spacing, radius, typography } from "@/constants";

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </View>
  );
}

export function MacroItem({
  color,
  label,
  percentage,
  value,
}: {
  color: string;
  label: string;
  percentage: string;
  value: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroItemLeft}>
        <Ionicons color={color} name="flash" size={14} />
        <Text style={styles.macroItemLabel}>{label}</Text>
      </View>
      <View style={styles.macroItemRight}>
        <Text style={styles.macroItemPercentage}>{percentage}</Text>
        <Text style={styles.macroItemValue}>({value})</Text>
      </View>
    </View>
  );
}

export function StatIconButton({
  color,
  icon,
  label,
  route,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statIconContainer, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.statIconCircle, { backgroundColor: color }]}>
        <Ionicons color="#111020" name={icon} size={28} />
      </View>
      <Text style={styles.statIconLabel}>{label}</Text>
    </Pressable>
  );
}

export function SocialButton({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable style={styles.socialButton}>
      <Ionicons color={colors.textPrimary} name={icon} size={28} />
      <Text style={styles.socialButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeaderText: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  macroItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  macroItemLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textSecondary,
  },
  macroItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroItemPercentage: {
    ...typography.bodyStrong,
    fontSize: 10,
    color: colors.textPrimary,
  },
  macroItemValue: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  statIconContainer: {
    alignItems: "center",
    gap: spacing.sm,
  },
  statIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  socialButton: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  socialButtonLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
