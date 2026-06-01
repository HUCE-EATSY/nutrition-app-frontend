import React, { useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";

interface WaterStepperProps {
  label: string;
  value: number;
  onAdd: (amount: number) => void;
  onSubtract: (amount: number) => void;
  onChange: (text: string) => void;
}

export const WaterStepper: React.FC<WaterStepperProps> = ({
  label,
  value,
  onAdd,
  onSubtract,
  onChange,
}) => {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.inputSection}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.stepperContainer}>
        <Pressable
          style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
          onPress={() => onSubtract(250)}
        >
          <MaterialCommunityIcons name="minus" size={28} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.valueInputContainer}>
          <TextInput
            style={styles.intakeInput}
            value={String(value)}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.mlLabel}>ml</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
          onPress={() => onAdd(250)}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  inputSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnPressed: {
    opacity: 0.7,
  },
  valueInputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  intakeInput: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: 100,
    padding: 0,
    margin: 0,
  },
  mlLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
