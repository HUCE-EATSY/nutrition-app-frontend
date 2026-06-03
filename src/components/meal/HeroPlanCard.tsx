import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, typography, radius } from "@/constants";

type Props = {
  title: string;
  subtitle: string;
  calories: string;
  badges: string[];
  imageUrl: string;
  onPress: () => void;
};

export function HeroPlanCard({ title, subtitle, calories, badges, imageUrl, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBg}
        imageStyle={{ borderRadius: radius.lg }}
      >
        <LinearGradient
          colors={["transparent", "rgba(18, 18, 20, 0.7)", "rgba(18, 18, 20, 1)"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.subtitle}>
              {calories} • {subtitle}
            </Text>

            <View style={styles.badgesRow}>
              {badges.map((badge, idx) => (
                <View key={idx} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: 320,
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginVertical: spacing.md,
  },
  imageBg: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  gradient: {
    height: "60%",
    justifyContent: "flex-end",
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: "#cccccc",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    ...typography.caption,
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
});
