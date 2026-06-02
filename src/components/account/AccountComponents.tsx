import { View, Text, Pressable, StyleSheet, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { spacing, radius, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { useTranslation } from "@/constants/i18n";

export function SectionHeader({ title, showChevron = true }: { title: string; showChevron?: boolean }) {
  const colors = useAppColors();
  const styles = getStyles(colors);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {showChevron && <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />}
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
  const colors = useAppColors();
  const styles = getStyles(colors);
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
  const colors = useAppColors();
  const styles = getStyles(colors);
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
  url,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  url?: string;
  onPress?: () => void;
}) {
  const colors = useAppColors();
  const styles = getStyles(colors);
  const t = useTranslation();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error("Error opening URL:", error);
        Alert.alert(t.common.error, t.common.cannotOpenLink);
      }
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [styles.socialButton, pressed && { opacity: 0.7 }]}
    >
      <Ionicons color={colors.textPrimary} name={icon} size={28} />
      <Text style={styles.socialButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
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
