import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

type SegmentedPillTabsProps = {
  items: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function SegmentedPillTabs({ items, activeKey, onChange }: SegmentedPillTabsProps) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={[styles.tab, active && styles.activeTab]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  activeTab: {
    backgroundColor: "rgba(165,108,255,0.18)",
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: "center",
  },
  activeLabel: {
    color: colors.textPrimary,
  },
});
