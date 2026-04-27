import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/components/common/SurfaceCard";
import { SafeScreen } from "@/components/layout/SafeScreen";
import { LoadingStepRow } from "@/components/onboarding/LoadingStepRow";
import { t } from "@/constants/i18n";
import { testimonials } from "@/constants/mocks/data";
import { useOnboardingStore } from "@/hooks/store/onboardingStore";
import { colors, spacing, typography } from "@/constants";
import { trackEvent } from "@/hooks/utils/analytics";

const labels = t.onboarding.calculating.labels;

export default function CalculatingPlanScreen() {
  const [stage, setStage] = useState(0);
  const markStepCompleted = useOnboardingStore((state) => state.markStepCompleted);

  useEffect(() => {
    trackEvent("plan_calculation_started", { screen_name: "calculating" });
    const timers = [
      setTimeout(() => setStage(1), 700),
      setTimeout(() => setStage(2), 1400),
      setTimeout(() => {
        markStepCompleted("Calculating");
        router.replace("/(onboarding)/plan-result");
      }, 2500),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [markStepCompleted]);

  const testimonial = testimonials[stage % testimonials.length];

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

const styles = StyleSheet.create({
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
