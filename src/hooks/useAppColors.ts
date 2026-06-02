import { useSettingsStore } from "@/store/settingsStore";
import { lightColors, darkColors } from "@/constants";

export { lightColors };

export function useAppColors() {
  const theme = useSettingsStore((state) => state.theme);
  return theme === "light" ? lightColors : darkColors;
}
