import { router } from "expo-router";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/domain/onboarding";
import { OnboardingRouteName, OnboardingDraft } from "@/constants/types/contracts";

export function useOnboardingForm<
  TFieldName extends keyof OnboardingDraft,
  TFormData extends FieldValues & Record<TFieldName, any>
>(
  stepName: OnboardingRouteName,
  fieldName: TFieldName,
  schema: z.ZodType<TFormData, any, any>,
  fallbackValue?: TFormData[TFieldName]
) {
  const storeValue = useOnboardingStore((state) => state.draft[fieldName]);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  
  const meta = getOnboardingMeta(stepName);
  
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      [fieldName]: storeValue ?? fallbackValue,
    } as any,
    mode: "onChange",
  });
  
  const onSubmit = (data: TFormData) => {
    updateDraft({ [fieldName]: data[fieldName] });
    markStepCompleted(stepName);
    router.replace(getNextOnboardingPath(stepName));
  };
  
  const fieldError = form.formState.errors[fieldName];
  const error = fieldError?.message as string | undefined;
  
  return {
    control: form.control,
    handleSubmit: form.handleSubmit,
    isValid: form.formState.isValid,
    error,
    watch: form.watch,
    meta,
    onContinue: form.handleSubmit(onSubmit),
    onBack: () => router.replace(getPreviousOnboardingPath(stepName)),
  };
}


