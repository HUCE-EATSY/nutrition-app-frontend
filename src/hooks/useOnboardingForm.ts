import { router } from "expo-router";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore } from "@/store/onboardingStore";
import { getNextOnboardingPath, getOnboardingMeta, getPreviousOnboardingPath } from "@/utils/onboarding";
import { OnboardingRouteName, OnboardingDraft } from "@/types/contracts";

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
  
  const onSubmit = async (data: TFormData) => {
    console.log(`[useOnboardingForm] ${stepName} - Submitting:`, { 
      fieldName, 
      value: data[fieldName],
      currentStoreValue: storeValue 
    });
    
    // Update draft - this updates Zustand state synchronously
    updateDraft({ [fieldName]: data[fieldName] });
    markStepCompleted(stepName);
    
    // Log state after update
    console.log(`[useOnboardingForm] ${stepName} - Updated store:`, {
      newValue: useOnboardingStore.getState().draft[fieldName]
    });
    
    // Wait for persist middleware to write to storage
    // Increased timeout to ensure async storage write completes
    await new Promise(resolve => setTimeout(resolve, 100));
    
    router.push(getNextOnboardingPath(stepName));
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


