import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GradientButton } from "@/components/buttons/GradientButton";
import { spacing, typography } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import { showBmiReferencesAlert } from "@/utils/onboarding";
import { useAppColors } from "@/hooks/useAppColors";

interface OnboardingWeightCtaProps {
  isValid: boolean;
  onContinue: () => void;
}

export function OnboardingWeightCta({ isValid, onContinue }: OnboardingWeightCtaProps) {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.bottomSection}>
      <Pressable onPress={showBmiReferencesAlert} style={styles.refButton}>
        <Text style={styles.refText}>{t.nutrition.referenceSource}</Text>
      </Pressable>

      <GradientButton
        disabled={!isValid}
        label={t.common.continue}
        onPress={onContinue}
        style={styles.continueButton}
      />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: spacing.sm,
  },
  refButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  refText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  continueButton: {
    width: "100%",
  },
});
