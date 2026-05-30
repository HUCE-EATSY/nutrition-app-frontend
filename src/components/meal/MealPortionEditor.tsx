import { View, Text, Pressable, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "@/constants";
import { useTranslation } from "@/constants/i18n";

interface Nutrition {
  calories: number;
  protein: number;
  carb: number;
  fat: number;
}

interface MealPortionEditorProps {
  foodName: string;
  grams: string;
  setGrams: (val: string) => void;
  nutrition: Nutrition | null;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  selectedHour?: number;
  setSelectedHour?: (h: number | ((prev: number) => number)) => void;
}

export function MealPortionEditor({
  foodName,
  grams,
  setGrams,
  nutrition,
  onSave,
  onCancel,
  isSaving = false,
  selectedHour,
  setSelectedHour,
}: MealPortionEditorProps) {
  const t = useTranslation();
  const gramNum = parseFloat(grams) || 0;

  return (
    <View style={styles.container}>
      {/* Tên món đã chọn */}
      <View style={styles.selectedRow}>
        <Ionicons color={colors.warning} name="restaurant-outline" size={20} />
        <Text style={styles.selectedName} numberOfLines={1}>
          {foodName}
        </Text>
        <Pressable hitSlop={8} onPress={onCancel}>
          <Ionicons color={colors.textMuted} name="close" size={20} />
        </Pressable>
      </View>

      {/* Input gram */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t.mealEntry.gramsLabel}</Text>
        <View style={styles.inputWrap}>
          <Pressable
            onPress={() => setGrams(String(Math.max(1, (parseFloat(grams) || 0) - 10)))}
            style={styles.stepBtn}
          >
            <Ionicons color={colors.textPrimary} name="remove" size={18} />
          </Pressable>
          <TextInput
            keyboardType="numeric"
            onChangeText={setGrams}
            style={styles.input}
            value={grams}
          />
          <Pressable
            onPress={() => setGrams(String((parseFloat(grams) || 0) + 10))}
            style={styles.stepBtn}
          >
            <Ionicons color={colors.textPrimary} name="add" size={18} />
          </Pressable>
        </View>
      </View>

      {/* Chọn khung giờ */}
      {selectedHour !== undefined && (
        <View style={styles.rowBetween}>
          <Text style={styles.label}>{t.mealEntry.timeSlot}</Text>
          {setSelectedHour ? (
            <View style={styles.inputWrap}>
              <Pressable
                onPress={() => setSelectedHour((h) => Math.max(7, h - 1))}
                style={styles.stepBtn}
              >
                <Ionicons color={colors.textPrimary} name="chevron-back" size={20} />
              </Pressable>
              <View style={styles.hourDisplay}>
                <Ionicons color={colors.warning} name="time-outline" size={16} />
                <Text style={styles.hourText}>
                  {selectedHour.toString().padStart(2, "0")}:00
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedHour((h) => Math.min(23, h + 1))}
                style={styles.stepBtn}
              >
                <Ionicons color={colors.textPrimary} name="chevron-forward" size={20} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.staticHourWrap}>
              <Ionicons color={colors.warning} name="time-outline" size={16} />
              <Text style={styles.staticHourText}>
                {selectedHour.toString().padStart(2, "0")}:00
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Preview Dinh dưỡng */}
      {nutrition && (
        <View style={styles.nutritionGrid}>
          {[
            { label: t.diary.calories, val: `${nutrition.calories} kcal`, color: colors.primary },
            { label: t.macros.protein, val: `${nutrition.protein}g`, color: colors.protein },
            { label: t.macros.carb, val: `${nutrition.carb}g`, color: colors.carbs },
            { label: t.macros.fat, val: `${nutrition.fat}g`, color: colors.fat },
          ].map((n) => (
            <View key={n.label} style={styles.nutritionCell}>
              <Text style={[styles.nutritionVal, { color: n.color }]}>{n.val}</Text>
              <Text style={styles.nutritionLabel}>{n.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Nút lưu & hủy */}
      <View style={styles.buttonsRow}>
        <Pressable onPress={onCancel} style={[styles.btn, styles.btnCancel]}>
          <Text style={styles.btnCancelText}>{t.common.cancel}</Text>
        </Pressable>
        <Pressable
          disabled={isSaving || gramNum <= 0}
          onPress={onSave}
          style={[styles.btn, styles.btnSave, (isSaving || gramNum <= 0) && { opacity: 0.6 }]}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnSaveText}>{t.mealEntry.title}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  selectedName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    width: 64,
    height: 44,
    textAlign: "center",
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  hourDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 90,
    justifyContent: "center",
  },
  hourText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 16,
  },
  staticHourWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  staticHourText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  nutritionGrid: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  nutritionCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.borderSoft,
  },
  nutritionVal: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  nutritionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancel: {
    backgroundColor: colors.surface,
  },
  btnCancelText: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  btnSave: {
    backgroundColor: colors.primary,
  },
  btnSaveText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
});
