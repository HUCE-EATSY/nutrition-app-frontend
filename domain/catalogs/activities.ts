import type { MaterialCommunityIcons } from "@expo/vector-icons";

export type ActivityId = "running" | "cycling" | "badminton" | "pickleball" | "yoga" | "other";
export type ActivityIntensity = "amateur" | "professional";

export type ActivityCatalogItem = {
  id: ActivityId;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  hasDistance: boolean;
  /** Max plausible speed (km/h) for validation, if distance is provided */
  maxSpeedKmh?: number;
};

export const ACTIVITIES: readonly ActivityCatalogItem[] = [
  { id: "running", label: "Chạy bộ", icon: "run", hasDistance: true, maxSpeedKmh: 25 },
  { id: "cycling", label: "Đạp xe", icon: "bike", hasDistance: true, maxSpeedKmh: 50 },
  { id: "badminton", label: "Cầu lông", icon: "badminton", hasDistance: false },
  { id: "pickleball", label: "Pickleball", icon: "tennis-ball", hasDistance: false },
  { id: "yoga", label: "Yoga", icon: "yoga", hasDistance: false },
  { id: "other", label: "Khác", icon: "dots-horizontal-circle-outline", hasDistance: true },
] as const;

export function getActivityById(id: string | undefined): ActivityCatalogItem | undefined {
  return ACTIVITIES.find((activity) => activity.id === id);
}

export function getActivityIcon(id: string | undefined): ActivityCatalogItem["icon"] {
  return getActivityById(id)?.icon ?? "dumbbell";
}

export function activityHasDistance(id: string | undefined): boolean {
  return getActivityById(id)?.hasDistance ?? false;
}

export function getMaxSpeedKmh(id: string | undefined): number | undefined {
  return getActivityById(id)?.maxSpeedKmh;
}

export function getMetValue(id: string | undefined, intensity: ActivityIntensity): number {
  if (id === "running") return 9.8;
  if (id === "cycling") return 8.0;
  if (id === "yoga") return intensity === "professional" ? 4.0 : 2.5;
  if (id === "badminton") return intensity === "professional" ? 7.0 : 5.5;
  if (id === "pickleball") return intensity === "professional" ? 6.0 : 5.0;
  return 8.0;
}
