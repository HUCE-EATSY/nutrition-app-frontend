import { useMemo } from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "@/constants/i18n";
import { AuthProvider } from "@/types/contracts";
import { radius, shadows, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type SocialAuthButtonProps = {
  provider: AuthProvider;
  label: string;
  loading?: boolean;
  onPress: () => void;
};

function SocialIcon({ provider }: { provider: AuthProvider }) {
  if (provider === "google") {
    return <Ionicons color="#EA4335" name="logo-google" size={20} />;
  }

  return <FontAwesome color="#1877F2" name="facebook" size={20} />;
}

export function SocialAuthButton({ provider, label, loading = false, onPress }: SocialAuthButtonProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <Pressable disabled={loading} onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <SocialIcon provider={provider} />
      </View>
      <Text style={styles.label}>{loading ? t.common.loadingConnection : label}</Text>
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 58,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.bgBase,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flexShrink: 1,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.94,
  },
});
