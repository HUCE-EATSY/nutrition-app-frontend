import React, { useMemo } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppColors } from "@/hooks/useAppColors";
import { spacing, typography, radius } from "@/constants";

interface QuantityStepperProps {
  label: string;
  value: number;
  unit: string;
  step: number;
  compact?: boolean;
  onAdd: (amount: number) => void;
  onSubtract: (amount: number) => void;
  onChange: (text: string) => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  label,
  value,
  unit,
  step,
  onAdd,
  onSubtract,
  onChange,
  compact = false,
}) => {
  const colors = useAppColors();
  const styles = useMemo(() => getStyles(colors, compact), [colors, compact]);

  return (
    <View style={styles.inputSection}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.stepperContainer}>
        <Pressable
          style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
          onPress={() => onSubtract(step)}
        >
          <MaterialCommunityIcons name="minus" size={compact ? 20 : 28} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.valueInputContainer}>
          <TextInput
            style={styles.intakeInput}
            value={String(value)}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.mlLabel}>{unit}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
          onPress={() => onAdd(step)}
        >
          <MaterialCommunityIcons name="plus" size={compact ? 20 : 28} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (colors: any, compact: boolean) => StyleSheet.create({
  inputSection: {
    gap: compact ? spacing.xs : spacing.md,
  },
  sectionLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    fontSize: compact ? 12 : 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: compact ? spacing.xs : spacing.sm,
    borderRadius: radius.md,
  },
  stepperBtn: {
    width: compact ? 36 : 48,
    height: compact ? 36 : 48,
    borderRadius: compact ? 18 : 24,
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
    ...(compact ? typography.h3 : typography.display),
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: compact ? 40 : 80,
    padding: 0,
    margin: 0,
  },
  mlLabel: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
    marginLeft: 4,
    fontSize: compact ? 12 : undefined,
  },
});
