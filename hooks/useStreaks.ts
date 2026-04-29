export type StreaksData = {
  streakDays: number;
  currentStreak: number;
  shieldCount: number;
  weeklyProgress: boolean[]; // length = 7 (T2..CN)
  challengeProgress: number; // 0..1
};

/**
 * MVP hook: currently returns mock data.
 * Later: replace implementation with backend fetch/store while keeping the same return shape.
 */
export function useStreaks(): StreaksData {
  return {
    streakDays: 0,
    currentStreak: 0,
    shieldCount: 0,
    weeklyProgress: [false, false, false, false, false, false, false],
    challengeProgress: 0,
  };
}
