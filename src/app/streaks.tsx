import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { StreakActionCard } from "@/components/streaks/StreakActionCard";
import { StreakChallengeSection } from "@/components/streaks/StreakChallengeSection";
import { StreakHeader } from "@/components/streaks/StreakHeader";
import { StreakStatsRow } from "@/components/streaks/StreakStatsRow";
import { WeeklyProgressCard } from "@/components/streaks/WeeklyProgressCard";
import { spacing } from "@/constants";
import { useStreaks } from "@/hooks/useStreaks";

export default function StreaksScreen() {
  const router = useRouter();
  const { streakDays, currentStreak, shieldCount, weeklyProgress, challengeProgress } = useStreaks();

  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        <StreakHeader streakDays={streakDays} onBack={() => router.back()} />
        <StreakActionCard onPressAdd={() => undefined} />
        <StreakChallengeSection progress={challengeProgress} onPressSeeMore={() => undefined} />
        <WeeklyProgressCard daysOfWeek={daysOfWeek} weeklyProgress={weeklyProgress} />
        <StreakStatsRow currentStreak={currentStreak} shieldCount={shieldCount} />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
});
