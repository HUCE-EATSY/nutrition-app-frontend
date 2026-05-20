import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { GradientButton } from "@/components/buttons/GradientButton";
import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { BmiCard } from "@/components/onboarding/BmiCard";
import { colors, spacing, typography } from "@/constants";
import { t } from "@/constants/i18n";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  showBmiReferencesAlert,
} from "@/domain/onboarding";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";

const currentWeightSchema = z.object({
  currentWeightKg: z.number().min(35).max(160),
});

export default function CurrentWeightScreen() {
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  
  const { control, isValid, meta, onContinue, onBack } = useOnboardingForm(
    "CurrentWeight",
    "currentWeightKg",
    currentWeightSchema,
    DEFAULT_CURRENT_WEIGHT_KG
  );

  // Read direct value from store for initial localWeight
  const initialWeight = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const [localWeight, setLocalWeight] = useState(initialWeight);

  return (
    <OnboardingStepScaffold
      scrollable={false}
      hideBottomCta={true}
      contentStyle={{ flex: 1, justifyContent: "space-between" }}
      onBack={onBack}
      onContinue={onContinue}
      question={t.onboarding.questions.CurrentWeight}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={styles.container}>
        {/* Ruler picker */}
        <View style={styles.pickerSection}>
          <Controller
            control={control}
            name="currentWeightKg"
            render={({ field: { onChange } }) => (
              <HorizontalRulerPicker
                decimalPlaces={1}
                majorTickEvery={10}
                max={160}
                min={35}
                onChange={onChange}
                onScrollValueChange={(val) => {
                  setLocalWeight(val);
                }}
                step={0.5}
                unit="kg"
                value={localWeight}
              />
            )}
          />
        </View>

        {/* BMI Status Card */}
        <BmiCard heightCm={heightCm} type="current" weightKg={localWeight} />

        {/* References and continue */}
        <View style={styles.bottomSection}>
          <Pressable onPress={showBmiReferencesAlert} style={styles.refButton}>
            <Text style={styles.refText}>Nguồn tham khảo</Text>
          </Pressable>

          <GradientButton
            disabled={!isValid}
            label={t.common.continue}
            onPress={onContinue}
            style={styles.continueButton}
          />
        </View>
      </View>
    </OnboardingStepScaffold>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
  },
  pickerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
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
