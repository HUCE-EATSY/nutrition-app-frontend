import { ACTIVITIES, ActivityCatalogItem, ActivityIntensity } from "@/constants/activities";

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
