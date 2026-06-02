import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppColors } from "@/hooks/useAppColors";
import { ScreenBackground } from "@/components/layout/ScreenBackground";
import { useStepsStore } from "@/store/statsStore";

interface StepGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StepGoalModal({ visible, onClose }: StepGoalModalProps) {
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const setStepGoal = useStepsStore((state) => state.setStepGoal);

  const [goalInput, setGoalInput] = useState(stepGoal.toString());

  useEffect(() => {
    if (visible) {
      setGoalInput(stepGoal.toString());
    }
  }, [visible, stepGoal]);

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setStepGoal(newGoal);
      onClose();
    }
  };

  const parsedGoalInput = parseInt(goalInput, 10);
  const isGoalValid = !isNaN(parsedGoalInput) && parsedGoalInput > 0;
  const isSaveActive = isGoalValid;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScreenBackground withGlow={true}>
        <View style={styles.fullScreenModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.fullScreenModalTitle}>Điều chỉnh mục tiêu</Text>
          <TouchableOpacity 
            onPress={handleSaveGoal} 
            disabled={!isSaveActive}
            style={styles.headerSaveBtn}
          >
            <Text style={[
              styles.headerSaveText,
              isSaveActive ? styles.headerSaveTextActive : styles.headerSaveTextInactive
            ]}>
              Lưu
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.fullScreenModalBody}>
          {/* Input Row */}
          <View style={styles.inputRow}>
            <Text style={styles.inputRowLabel}>Mục tiêu bước chân</Text>
            <View style={styles.inputRowRight}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputRowField}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  keyboardType="number-pad"
                  placeholder="8000"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Text style={styles.inputRowUnit}>Bước</Text>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.suggestionInfoBanner}>
            <Ionicons name="information-circle" size={22} color={colors.success} />
            <Text style={styles.suggestionInfoText}>
              Dựa vào mức độ vận động bạn đã chọn, Wao gợi ý số bước phù hợp. Bạn vẫn có thể tự điều chỉnh mục tiêu theo nhu cầu.
            </Text>
          </View>

          {/* Suggestions Header */}
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsHeaderText}>Gợi ý mục tiêu bước chân</Text>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
          </View>

          {/* Suggestions List Card */}
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsTableHeader}>
              <Text style={styles.suggestionsTableHeaderText}>Mức độ</Text>
              <Text style={styles.suggestionsTableHeaderText}>Bước chân gợi ý</Text>
            </View>

            <SuggestionRow
              label="Ít vận động"
              value={3000}
              iconName="chair"
              onPress={(val) => setGoalInput(val.toString())}
            />
            <SuggestionRow
              label="Nhẹ nhàng"
              value={5000}
              iconName="walking"
              onPress={(val) => setGoalInput(val.toString())}
            />
            <SuggestionRow
              label="Trung bình"
              value={8000}
              iconName="walking"
              onPress={(val) => setGoalInput(val.toString())}
            />
            <SuggestionRow
              label="Rất năng động"
              value={10000}
              iconName="running"
              onPress={(val) => setGoalInput(val.toString())}
            />
            <SuggestionRow
              label="Cực kỳ năng động"
              value={12000}
              iconName="run-fast"
              iconFamily="MaterialCommunityIcons"
              isLast
              onPress={(val) => setGoalInput(val.toString())}
            />
          </View>
        </ScrollView>
      </ScreenBackground>
    </Modal>
  );
}

// Hàng gợi ý mục tiêu bước chân
const SuggestionRow = ({
  label,
  value,
  iconName,
  iconFamily = "FontAwesome5",
  isLast = false,
  onPress,
}: {
  label: string;
  value: number;
  iconName: string;
  iconFamily?: "FontAwesome5" | "MaterialCommunityIcons";
  isLast?: boolean;
  onPress: (val: number) => void;
}) => {
  const IconComponent = iconFamily === "MaterialCommunityIcons" ? MaterialCommunityIcons : FontAwesome5;
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  return (
    <TouchableOpacity 
      style={[styles.suggestionRow, isLast && { borderBottomWidth: 0 }]}
      activeOpacity={0.7}
      onPress={() => onPress(value)}
    >
      <View style={styles.suggestionRowLeft}>
        <View style={styles.suggestionIconWrapper}>
          <IconComponent name={iconName as any} size={14} color={colors.textSecondary} />
        </View>
        <Text style={styles.suggestionRowLabel}>{label}</Text>
      </View>
      <Text style={styles.suggestionRowValue}>
        {value.toLocaleString("vi-VN")}{" "}
        <Text style={styles.suggestionRowUnit}>bước/ngày</Text>
      </Text>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  // Full-screen Adjust Goal Modal Styles
  fullScreenModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  },
  headerBackBtn: {
    padding: 4,
  },
  fullScreenModalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerSaveText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerSaveTextActive: {
    color: "#FFFFFF",
  },
  headerSaveTextInactive: {
    color: "rgba(255, 255, 255, 0.3)",
  },
  fullScreenModalBody: {
    flex: 1,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
  },
  inputRowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  inputRowRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    backgroundColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  inputRowField: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    padding: 0,
    width: "100%",
  },
  inputRowUnit: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  suggestionInfoBanner: {
    flexDirection: "row",
    backgroundColor: "rgba(22, 101, 52, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.25)",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  suggestionInfoText: {
    color: "#4ADE80",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  suggestionsHeaderText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  suggestionsCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    marginBottom: 40,
  },
  suggestionsTableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    marginBottom: 6,
  },
  suggestionsTableHeaderText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary === "#A56CFF" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  },
  suggestionRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionIconWrapper: {
    width: 24,
    alignItems: "center",
  },
  suggestionRowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  suggestionRowValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  suggestionRowUnit: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "normal",
  },
});
