/**
 * Mapping giữa ActivityId (frontend catalog) và Exercise names (backend database)
 * Dùng để pre-select exercise khi click vào icon từ ActivityGrid
 */

import type { ActivityId } from "@/domain/catalogs/activities";

export const ACTIVITY_TO_EXERCISE_NAME: Record<ActivityId, string> = {
  running: "Running",
  cycling: "Cycling",
  badminton: "Badminton",
  pickleball: "Pickleball",
  yoga: "Yoga",
  other: "Other", // Sẽ không match với exercise nào → đi add-exercise
};

/**
 * Lấy tên bài tập từ ActivityId
 */
export function getExerciseNameFromActivity(activityId: ActivityId): string {
  return ACTIVITY_TO_EXERCISE_NAME[activityId] || "Other";
}
