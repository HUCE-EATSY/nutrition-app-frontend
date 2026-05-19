import { router } from "expo-router";
import { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  DEFAULT_TARGET_WEIGHT_KG,
  getNextOnboardingPath,
  getOnboardingMeta,
  getPreviousOnboardingPath,
  showBmiReferencesAlert,
} from "@/domain/onboarding";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { GoalType } from "@/constants/types/contracts";

const createTargetWeightSchema = (goalType: GoalType | null, currentWeightKg: number) => {
  return z.object({
    targetWeightKg: z
      .number()
      .min(35, "Cân nặng tối thiểu là 35kg")
      .max(160, "Cân nặng tối đa là 160kg")
      .refine(
        (val) => {
          if (!goalType) return false;
          if (goalType === "lose_weight") return val < currentWeightKg;
          if (goalType === "gain_weight" && val <= currentWeightKg) return false; // wait, let's keep the exact original logic: val > currentWeightKg
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

type TargetWeightFormData = {
  targetWeightKg: number;
};

export default function TargetWeightScreen() {
  const currentWeightKg = useOnboardingStore((state) => state.draft.currentWeightKg ?? DEFAULT_CURRENT_WEIGHT_KG);
  const targetWeightKg = useOnboardingStore((state) => state.draft.targetWeightKg ?? DEFAULT_TARGET_WEIGHT_KG);
  const heightCm = useOnboardingStore((state) => state.draft.heightCm ?? DEFAULT_HEIGHT_CM);
  const goalType = useOnboardingStore((state) => state.draft.goalType);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const meta = getOnboardingMeta("TargetWeight");

  // Track local weight dynamically
  const [localTargetWeight, setLocalTargetWeight] = useState(targetWeightKg);

  const targetWeightSchema = useMemo(() => {
    return createTargetWeightSchema(goalType, currentWeightKg);
  }, [goalType, currentWeightKg]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TargetWeightFormData>({
    resolver: zodResolver(targetWeightSchema),
    defaultValues: {
      targetWeightKg,
    },
    mode: "onChange",
  });

  const error = errors.targetWeightKg?.message;

  const onSubmit = (data: TargetWeightFormData) => {
    updateDraft({ targetWeightKg: data.targetWeightKg });
    markStepCompleted("TargetWeight");
    router.replace(getNextOnboardingPath("TargetWeight"));
  };

  return (
    <OnboardingStepScaffold
      scrollable={false}
      hideBottomCta={true}
      contentStyle={{ flex: 1, justifyContent: "space-between" }}
      onBack={() => router.replace(getPreviousOnboardingPath("TargetWeight"))}
      onContinue={handleSubmit(onSubmit)}
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
            render={({ field: { onChange } }) => (
              <HorizontalRulerPicker
                decimalPlaces={1}
                majorTickEvery={10}
                max={160}
                min={35}
                onChange={onChange}
                onScrollValueChange={(val) => {
                  setLocalTargetWeight(val);
                }}
                step={0.5}
                unit="kg"
                value={localTargetWeight}
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
        <View style={styles.bottomSection}>
          <Pressable onPress={showBmiReferencesAlert} style={styles.refButton}>
            <Text style={styles.refText}>Nguồn tham khảo</Text>
          </Pressable>

          <GradientButton
            disabled={!isValid}
            label={t.common.continue}
            onPress={handleSubmit(onSubmit)}
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
