import React from "react";
import { colors } from "@/constants";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface FilterTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onChange(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.bgElevated, // Surface/Card color
    borderRadius: 20,
    padding: 4,
    marginVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: colors.primary, // Accent color (Purple)
  },
  tabText: {
    color: colors.textSecondary, // Secondary text
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
});
