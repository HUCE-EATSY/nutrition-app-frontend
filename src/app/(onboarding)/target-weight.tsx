import { useState, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Controller } from "react-hook-form";
import * as z from "zod";

import { HorizontalRulerPicker } from "@/components/onboarding/HorizontalRulerPicker";
import { OnboardingStepScaffold } from "@/components/onboarding/OnboardingStepScaffold";
import { BmiCard } from "@/components/onboarding/BmiCard";
import { OnboardingWeightCta } from "@/components/onboarding/OnboardingWeightCta";
import { spacing } from "@/constants";
import { t, useTranslation } from "@/constants/i18n";
import {
  DEFAULT_CURRENT_WEIGHT_KG,
  DEFAULT_HEIGHT_CM,
  DEFAULT_TARGET_WEIGHT_KG,
} from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { GoalType } from "@/types/contracts";

const createTargetWeightSchema = (goalType: GoalType | null, currentWeightKg: number) => {
  return z.object({
    targetWeightKg: z
      .number()
      .min(20, t.validators.minWeight)
      .max(300, t.validators.maxWeight)
      .refine(
        (val) => {
          if (!goalType) return false;
          if (goalType === "lose_weight") return val < currentWeightKg;
          if (goalType === "gain_weight") return val > currentWeightKg;
          if (goalType === "maintain_weight") return Math.abs(val - currentWeightKg) <= 1;
          return true;
        },
        {
          message:
            goalType === "lose_weight"
              ? t.validators.loseWeightInvalid
              : goalType === "gain_weight"
              ? t.validators.gainWeightInvalid
              : t.validators.maintainWeightInvalid,
        }
      ),
  });
};

export default function TargetWeightScreen() {
  const t = useTranslation();
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const goalType = useOnboardingStore((state) => state.draft.goalType);

  const targetWeightSchema = useMemo(() => {
    return createTargetWeightSchema(goalType, currentWeightKg);
  }, [goalType, currentWeightKg]);

  const { control, error, isValid, meta, onContinue, onBack, watch } = useOnboardingForm(
    "TargetWeight",
    "targetWeightKg",
    targetWeightSchema,
    DEFAULT_TARGET_WEIGHT_KG
  );

  const formTargetWeight = watch("targetWeightKg");
  const [localTargetWeight, setLocalTargetWeight] = useState(formTargetWeight || DEFAULT_TARGET_WEIGHT_KG);

  useEffect(() => {
    if (formTargetWeight !== undefined && formTargetWeight !== null) {
      setLocalTargetWeight(formTargetWeight);
    }
  }, [formTargetWeight]);

  return (
    <OnboardingStepScaffold
      scrollable={false}
      hideBottomCta={true}
      contentStyle={{ flex: 1, justifyContent: "space-between" }}
      onBack={onBack}
      onContinue={onContinue}
      question={t.onboarding.questions.TargetWeight}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <View style={styles.container}>
        {/* Ruler picker */}
        <View style={styles.pickerSection}>
          <Controller
            control={control}
            name="targetWeightKg"
            render={({ field: { onChange, value } }) => (
              <HorizontalRulerPicker
                decimalPlaces={1}
                majorTickEvery={10}
                max={300}
                min={20}
                onChange={onChange}
                onScrollValueChange={(val) => {
                  setLocalTargetWeight(val);
                }}
                step={0.5}
                unit="kg"
                value={value}
              />
            )}
          />
        </View>

        {/* BMI Status Card or Error Card */}
        <BmiCard
          error={error}
          heightCm={heightCm}
          type="target"
          weightKg={localTargetWeight}
        />

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
