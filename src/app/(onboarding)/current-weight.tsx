import { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { BmiCard } from "@/components/onboarding/BmiCard";
import { OnboardingWeightCta } from "@/components/onboarding/OnboardingWeightCta";
import { spacing } from "@/constants";
import { useTranslation } from "@/constants/i18n";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
} from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";

const currentWeightSchema = z.object({
  currentWeightKg: z.number().min(20).max(300),
});

export default function CurrentWeightScreen() {
  const t = useTranslation();
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const fullDraft = useOnboardingStore((state) => state.draft);
  
  console.log("[CurrentWeight] Component mounted:", {
    heightCm,
    fullDraft,
    currentWeightFromStore: fullDraft.currentWeightKg
  });
  
  const { control, isValid, meta, onContinue, onBack, watch } = useOnboardingForm(
    "CurrentWeight",
    "currentWeightKg",
    currentWeightSchema,
    DEFAULT_CURRENT_WEIGHT_KG
  );

  const formWeight = watch("currentWeightKg");
  const [localWeight, setLocalWeight] = useState(formWeight || DEFAULT_CURRENT_WEIGHT_KG);

  console.log("[CurrentWeight] Form state:", {
    formWeight,
    localWeight,
    isValid
  });

  useEffect(() => {
    if (formWeight !== undefined && formWeight !== null) {
      setLocalWeight(formWeight);
    }
  }, [formWeight]);

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
            render={({ field: { onChange, value } }) => (
              <HorizontalRulerPicker
                decimalPlaces={1}
                majorTickEvery={10}
                max={300}
                min={20}
                onChange={onChange}
                onScrollValueChange={(val) => {
                  setLocalWeight(val);
                }}
                step={0.5}
                unit="kg"
                value={value}
              />
            )}
          />
        </View>

        {/* BMI Status Card */}
        <BmiCard heightCm={heightCm} type="current" weightKg={localWeight} />

        {/* References and continue */}
        <OnboardingWeightCta isValid={isValid} onContinue={onContinue} />
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
});
