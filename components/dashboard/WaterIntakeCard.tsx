import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { t } from "@/constants/i18n";
import { colors, spacing, typography, radius } from "@/constants";
import { SurfaceCard } from "../common/SurfaceCard";

export function WaterIntakeCard() {
  return (
    <SurfaceCard style={styles.container}>
      <View style={styles.left}>
        <MaterialCommunityIcons name="water" size={24} color={colors.carbs} />
        <View>
           <Text style={styles.label}>{t.home.waterTitle}</Text>
           <Text style={styles.value}>0 {t.home.mlSuffix}</Text>
        </View>
      </View>
      
      <View style={styles.controls}>
         <TouchableOpacity style={styles.btn}>
            <MaterialCommunityIcons name="cup-water" size={16} color={colors.textMuted} />
         </TouchableOpacity>
         <View style={styles.divider} />
         <TouchableOpacity style={[styles.btn, styles.btnActive]}>
            <MaterialCommunityIcons name="cup-water" size={16} color={colors.carbs} />
         </TouchableOpacity>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  value: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  controls: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.sm,
    padding: 4,
    alignItems: "center",
  },
  btn: {
    padding: 8,
    borderRadius: radius.sm - 4,
  },
  btnActive: {
    backgroundColor: "rgba(61, 139, 255, 0.15)",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 4,
  },
});
