import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "@/src/i18n";
import { colors, radius } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";

function TabIcon({ color, name }: { color: string; name: keyof typeof Ionicons.glyphMap }) {
  return <Ionicons color={color} name={name} size={22} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isCompactWidth } = useResponsiveLayout();
  const tabBarHeight = (isCompactWidth ? 72 : 84) + Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: isCompactWidth ? 8 : 10,
          },
        ],
        tabBarLabelStyle: [styles.tabLabel, isCompactWidth && styles.tabLabelCompact],
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t.navigation.home,
          tabBarIcon: ({ color }) => <TabIcon color={color} name="sparkles-outline" />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t.navigation.diary,
          tabBarIcon: ({ color }) => <TabIcon color={color} name="calendar-outline" />,
        }}
      />
      <Tabs.Screen
        name="quick-add-trigger"
        options={{
          title: "",
          tabBarButton: () => (
            <View style={[styles.quickAddWrap, isCompactWidth && styles.quickAddWrapCompact]}>
              <Pressable onPress={() => router.push("/quick-add")} style={[styles.quickAddButton, isCompactWidth && styles.quickAddButtonCompact]}>
                <Ionicons color={colors.textPrimary} name="add" size={28} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: t.navigation.mealPlan,
          tabBarIcon: ({ color }) => <TabIcon color={color} name="restaurant-outline" />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t.navigation.account,
          tabBarIcon: ({ color }) => <TabIcon color={color} name="person-outline" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#141223",
    borderTopColor: colors.borderSoft,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabLabelCompact: {
    fontSize: 10,
  },
  quickAddWrap: {
    top: -18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAddWrapCompact: {
    top: -12,
  },
  quickAddButton: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: colors.bgBase,
  },
  quickAddButtonCompact: {
    width: 56,
    height: 56,
  },
});
