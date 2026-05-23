import { Controller } from "react-hook-form";
import { View } from "react-native";
import * as z from "zod";

import { OptionCard } from "./OptionCard";
import { OnboardingStepScaffold } from "./OnboardingStepScaffold";
import { useOnboardingForm } from "@/hooks/useOnboardingForm";

interface Option {
  value: string;
  title: string;
  subtitle?: string;
  accent?: string;
}

interface OnboardingOptionSelectionProps {
  stepName: any;
  fieldName: any;
  schema: z.ZodType<any, any, any>;
  options: Option[];
  question: string;
  getIcon: (value: string) => string;
}

export function OnboardingOptionSelection({
  stepName,
  fieldName,
  schema,
  options,
  question,
  getIcon,
}: OnboardingOptionSelectionProps) {
  const { control, isValid, meta, onContinue, onBack } = useOnboardingForm(
    stepName,
    fieldName,
    schema
  );

  return (
    <OnboardingStepScaffold
      continueDisabled={!isValid}
      onBack={onBack}
      onContinue={onContinue}
      question={question}
      step={meta.step}
      totalSteps={meta.totalSteps}
    >
      <Controller
        control={control}
        name={fieldName}
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 16 }}>
            {options.map((option) => (
              <OptionCard
                key={option.value}
                accent={option.accent}
                icon={getIcon(option.value)}
                onPress={() => onChange(option.value)}
                selected={value === option.value}
                subtitle={option.subtitle}
                title={option.title}
              />
            ))}
          </View>
        )}
      />
    </OnboardingStepScaffold>
  );
}
