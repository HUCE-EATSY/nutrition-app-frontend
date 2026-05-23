import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants";
import { WelcomeHeroIllustration } from "@/components/WelcomeHeroIllustration";

type MascotQuestionBubbleProps = {
  text: string;
  size?: "sm" | "md" | "lg";
};

export function MascotQuestionBubble({ text, size = "lg" }: MascotQuestionBubbleProps) {
  const illustrationSize = size === "sm" ? 28 : size === "md" ? 34 : 40;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <WelcomeHeroIllustration size={illustrationSize} />
      </View>
      <View style={styles.bubbleWrap}>
        <View style={styles.bubble}>
          <Text style={styles.text}>{text}</Text>
        </View>
        <View style={styles.tail} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    lineHeight: 30,
  },
  bubbleWrap: {
    flex: 1,
    position: "relative",
  },
  bubble: {
    backgroundColor: colors.bubble,
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  tail: {
    position: "absolute",
    width: 14,
    height: 14,
    left: -6,
    top: 24,
    transform: [{ rotate: "45deg" }],
    backgroundColor: colors.bubble,
  },
  text: {
    ...typography.h2,
    color: colors.bubbleText,
  },
});
