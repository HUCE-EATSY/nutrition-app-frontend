import { vi, getActivityLevelLabel as getViActivityLevelLabel, getBmiStatusLabel as getViBmiStatusLabel, getGoalTypeLabel as getViGoalTypeLabel } from "./vi";
import { en, getActivityLevelLabel as getEnActivityLevelLabel, getBmiStatusLabel as getEnBmiStatusLabel, getGoalTypeLabel as getEnGoalTypeLabel } from "./en";
import { useSettingsStore } from "@/store/settingsStore";
import { ActivityLevel, BMIStatus, GoalType } from "@/types/contracts";

export function getActivityLevelLabel(activity: ActivityLevel): string {
  const lang = useSettingsStore.getState?.()?.language || "vi";
  return lang === "en" ? getEnActivityLevelLabel(activity) : getViActivityLevelLabel(activity);
}

export function getBmiStatusLabel(status: BMIStatus): string {
  const lang = useSettingsStore.getState?.()?.language || "vi";
  return lang === "en" ? getEnBmiStatusLabel(status) : getViBmiStatusLabel(status);
}

export function getGoalTypeLabel(goalType: GoalType | null | undefined): string {
  const lang = useSettingsStore.getState?.()?.language || "vi";
  return lang === "en" ? getEnGoalTypeLabel(goalType) : getViGoalTypeLabel(goalType);
}

const locales = {
  vi,
  en,
};

function getLocaleValue(path: string[]): any {
  const lang = useSettingsStore.getState?.()?.language || "vi";
  const localeObj = locales[lang] || vi;
  let current: any = localeObj;
  for (const key of path) {
    if (current && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, key)) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function createLocaleProxy(path: string[]): any {
  return new Proxy(
    (() => {}) as any,
    {
      get(target, prop, receiver) {
        if (typeof prop === "symbol" || prop === "then") {
          return undefined;
        }
        const nextPath = [...path, prop as string];
        const val = getLocaleValue(nextPath);
        if (val !== undefined) {
          if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            return createLocaleProxy(nextPath);
          }
          if (typeof val === "function") {
            return val;
          }
          return val;
        }
        return Reflect.get(target, prop, receiver);
      },
      apply(target, thisArg, argumentsList) {
        const val = getLocaleValue(path);
        if (typeof val === "function") {
          return val(...argumentsList);
        }
        return "";
      }
    }
  );
}

export const t = new Proxy({} as typeof vi, {
  get(target, prop, receiver) {
    if (typeof prop === "symbol" || prop === "then") {
      return undefined;
    }
    const val = getLocaleValue([prop as string]);
    if (val !== undefined) {
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return createLocaleProxy([prop as string]);
      }
      if (typeof val === "function") {
        return val;
      }
      return val;
    }
    return Reflect.get(target, prop, receiver);
  },
});

export function useTranslation() {
  useSettingsStore((state) => state.language);
  return t;
}

