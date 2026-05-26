import { Stack } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";

export default function PublicLayout() {
  const colors = useAppColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgBase } }} />;
}
