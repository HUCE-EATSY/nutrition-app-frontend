import { router } from "expo-router";
import { useEffect, useState, useMemo } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { LoadingStepRow } from "@/components/onboarding/LoadingStepRow";
import { useTranslation } from "@/constants/i18n";
import { useOnboardingStore } from "@/store/onboardingStore";
import { spacing, typography } from "@/constants";
import { trackEvent } from "@/utils/analytics";
import { useOnboardUser } from "@/hooks/queries/useUserQueries";
import { useAppColors } from "@/hooks/useAppColors";

export default function CalculatingPlanScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const labels = t.onboarding.calculating.labels;
  const [stage, setStage] = useState(0);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);
  const setServerPlan = useOnboardingStore((state) => state.setServerPlan);
  const draft = useOnboardingStore((state) => state.draft);

  const { mutate: submitOnboarding } = useOnboardUser();

  const handleSuccess = (result: any) => {
    setServerPlan(result);
    
    // Chờ ít nhất 2.5s để hiệu ứng đẹp (kể từ lúc bắt đầu)
    // Lưu ý: timers bên dưới vẫn chạy để cập nhật UI stage
    setTimeout(() => {
      markStepCompleted("Calculating");
      router.replace("/(onboarding)/plan-result");
    }, 2500);
  };

  const handleError = (error: unknown) => {
    console.error("Onboarding API failed:", error);
    Alert.alert(t.common.error, t.onboarding.calculating.error, [
      { text: t.common.back, onPress: () => router.back() }
    ]);
  };

  useEffect(() => {
    trackEvent("plan_calculation_started", { screen_name: "calculating" });
    
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 2800),
    ];

    submitOnboarding(draft, {
      onSuccess: handleSuccess,
      onError: handleError,
    });

    return () => {
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitOnboarding, draft]);

  const testimonials = t.onboarding.calculating.testimonials || [];
  const testimonial = testimonials[stage % testimonials.length] || {
    title: "",
    content: "",
    authorName: "",
    rating: 5,
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.screen}>
        <Text style={styles.title}>{t.onboarding.calculating.title}</Text>
        <Text style={styles.description}>{t.onboarding.calculating.description}</Text>

        <View style={styles.steps}>
          {labels.map((label, index) => (
            <LoadingStepRow
              key={label}
              label={label}
              progress={index < stage ? 1 : index === stage ? 0.66 : 0.12}
              status={index < stage ? "done" : index === stage ? "loading" : "idle"}
            />
          ))}
        </View>

        <SurfaceCard>
          <Text style={styles.testimonialKicker}>{t.onboarding.calculating.testimonialKicker}</Text>
          <Text style={styles.testimonialTitle}>{testimonial.title}</Text>
          <Text style={styles.testimonialBody}>{testimonial.content}</Text>
          <Text style={styles.testimonialMeta}>
            {t.onboarding.calculating.testimonialMeta(testimonial.authorName, testimonial.rating)}
          </Text>
        </SurfaceCard>
      </View>
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.xxl,
    paddingTop: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  steps: {
    gap: spacing.md,
  },
  testimonialKicker: {
    ...typography.caption,
    color: colors.warning,
  },
  testimonialTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  testimonialBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  testimonialMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
