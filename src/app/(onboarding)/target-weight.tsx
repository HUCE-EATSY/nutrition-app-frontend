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
import { useSettingsStore } from "@/store/settingsStore";

const createTargetWeightSchema = (goalType: GoalType | null, currentWeightKg: number) => {
  console.log("[Schema Creation]", { goalType, currentWeightKg });
  
  return z.object({
    targetWeightKg: z
      .number()
      .min(20, t.validators.minWeight)
      .max(300, t.validators.maxWeight)
      .refine(
        (val) => {
          console.log("[Validation]", { 
            val, 
            goalType, 
            currentWeightKg,
            check_lose: val < currentWeightKg,
            check_gain: val > currentWeightKg,
            check_maintain: Math.abs(val - currentWeightKg)
          });
          
          // Nếu chưa có goalType, cho phép mọi giá trị hợp lệ (trong khoảng 20-300)
          if (!goalType) return true;
          
          if (goalType === "lose_weight") return val < currentWeightKg;
          if (goalType === "gain_weight") return val > currentWeightKg;
          if (goalType === "maintain_weight") return Math.abs(val - currentWeightKg) <= 5; // Nới lỏng từ 1kg lên 5kg
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
  const fullDraft = useOnboardingStore((state) => state.draft);

  console.log("[TargetWeight] Debug info:", { 
    currentWeightKg, 
    heightCm, 
    goalType,
    hasGoalType: !!goalType,
    fullDraft
  });

  const language = useSettingsStore((state) => state.language);

  const targetWeightSchema = useMemo(() => {
    return createTargetWeightSchema(goalType, currentWeightKg);
  }, [goalType, currentWeightKg, language]);

  const { control, error, isValid, meta, onContinue, onBack, watch } = useOnboardingForm(
    "TargetWeight",
    "targetWeightKg",
    targetWeightSchema,
    DEFAULT_TARGET_WEIGHT_KG
  );

  const formTargetWeight = watch("targetWeightKg");
  const [localTargetWeight, setLocalTargetWeight] = useState(formTargetWeight || DEFAULT_TARGET_WEIGHT_KG);

  console.log("[TargetWeight] Form state:", { 
    formTargetWeight, 
    localTargetWeight, 
    isValid, 
    error 
  });

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
                value={value ?? DEFAULT_TARGET_WEIGHT_KG}
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
        <OnboardingWeightCta isValid={true} onContinue={onContinue} />
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
