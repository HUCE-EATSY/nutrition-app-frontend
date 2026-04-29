import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { colors, radius, spacing, typography } from "@/constants";
import { activityHasDistance, getActivityIcon, getMaxSpeedKmh, getMetValue, type ActivityIntensity } from "@/domain/catalogs/activities";

// Hàm tính toán calo dựa trên khoảng cách và thời gian
const calculateCalories = (distanceKm: number, timeMin: number, activityId: string, intensity: ActivityIntensity) => {
  // Bắt buộc phải nhập thời gian mới tính được lượng Calo tiêu thụ (theo công thức MET)
  if (!timeMin || timeMin <= 0) return 0;
  
  // Kiểm tra tốc độ không tưởng (km/h) cho các môn có khoảng cách
  if (distanceKm > 0) {
    const speedKmH = distanceKm / (timeMin / 60);
    const maxSpeed = getMaxSpeedKmh(activityId);
    if (maxSpeed !== undefined && speedKmH > maxSpeed) return -1; // -1 biểu thị lỗi
  }

  // Giả định cân nặng 70kg 
  const weightKg = 70; 
  const metValue = getMetValue(activityId, intensity);

  const timeHours = timeMin / 60;
  return Math.round(metValue * weightKg * timeHours);
};

export default function ActivityScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const activityId = Array.isArray(id) ? id[0] : id;
  const activityName = Array.isArray(name) ? name[0] : name;

  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [intensity, setIntensity] = useState<ActivityIntensity>("amateur");
  
  const hasDistance = activityHasDistance(activityId);
  
  // Quản lý trạng thái xem user đã thao tác vào ô nhập chưa
  const [isDistanceTouched, setIsDistanceTouched] = useState(false);
  const [isTimeTouched, setIsTimeTouched] = useState(false);

  const numDistance = parseFloat(distance) || 0;
  const numTime = parseInt(time, 10) || 0;

  const calories = useMemo(() => {
    return calculateCalories(hasDistance ? numDistance : 0, numTime, activityId || "other", intensity);
  }, [numDistance, numTime, activityId, intensity, hasDistance]);

  const isValid = calories > 0;
  const isSpeedError = calories === -1;
  
  // Logic bắt lỗi
  const showDistanceError = (isDistanceTouched && distance.trim() === "") || isSpeedError;
  const showTimeError = isTimeTouched && time.trim() === "";

  const handleSave = () => {
    if (isValid) {
      // Thực hiện logic lưu dữ liệu ở đây (Gọi API, update Store...)
      router.back();
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 2. Header */}
        <View style={styles.header}>
          <Pressable hitSlop={15} onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          
          <Text style={styles.headerTitle}>{activityName || "Hoạt động"}</Text>
          
          <Pressable 
            hitSlop={15} 
            onPress={handleSave} 
            disabled={!isValid}
          >
            <Text style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}>Lưu</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 3. Hero Component */}
          <View style={styles.heroBanner}>
            <MaterialCommunityIcons name={getActivityIcon(activityId || "other")} size={80} color={colors.primary} />
          </View>

          {/* 4. Data Input List */}
          <View style={styles.formContainer}>
            
            {/* Cường độ (Nghiệp dư / Chuyên nghiệp) cho môn không có khoảng cách */}
            {!hasDistance && (
              <View style={styles.inputRowWrapper}>
                <View style={[styles.inputRow, styles.intensityRow]}>
                  <Text style={styles.inputLabel}>Mức độ</Text>
                  <View style={styles.intensitySelector}>
                    <Pressable 
                      style={[styles.intensityBtn, intensity === 'amateur' && styles.intensityBtnActive]}
                      onPress={() => setIntensity('amateur')}
                    >
                      <Text style={[styles.intensityText, intensity === 'amateur' && styles.intensityTextActive]}>Nghiệp dư</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.intensityBtn, intensity === 'professional' && styles.intensityBtnActive]}
                      onPress={() => setIntensity('professional')}
                    >
                      <Text style={[styles.intensityText, intensity === 'professional' && styles.intensityTextActive]}>Chuyên nghiệp</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {/* Khoảng cách Input */}
            {hasDistance && (
              <View style={styles.inputRowWrapper}>
                <View style={[styles.inputRow, showDistanceError && styles.inputRowError]}>
                  <Text style={styles.inputLabel}>Khoảng cách</Text>
                  <View style={styles.inputRight}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={distance}
                      onChangeText={setDistance}
                      onFocus={() => setIsDistanceTouched(true)}
                    />
                    <Text style={styles.unitText}>Km</Text>
                  </View>
                </View>
                {showDistanceError && (
                  <Text style={styles.errorText}>
                    {isSpeedError ? "Vận tốc quá lớn, thông số không hợp lệ" : "Vui lòng nhập khoảng cách"}
                  </Text>
                )}
              </View>
            )}

            {/* Thời gian Input */}
            <View style={styles.inputRowWrapper}>
              <View style={[styles.inputRow, showTimeError && styles.inputRowError]}>
                <Text style={styles.inputLabel}>Thời gian</Text>
                <View style={styles.inputRight}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={time}
                    onChangeText={setTime}
                    onFocus={() => setIsTimeTouched(true)}
                  />
                  <Text style={styles.unitText}>Phút</Text>
                </View>
              </View>
              {showTimeError && (
                <Text style={styles.errorText}>Vui lòng nhập thời gian</Text>
              )}
            </View>

            {/* Calo Result */}
            <View style={styles.inputRowWrapper}>
              <View style={[styles.inputRow, styles.inputRowNoBorder]}>
                <Text style={styles.inputLabel}>Calo tiêu thụ</Text>
                <View style={styles.inputRight}>
                  <Text style={[styles.resultText, calories > 0 && styles.resultTextActive]}>
                    {calories > 0 ? calories : "0"}
                  </Text>
                  <Text style={styles.unitText}>Cal</Text>
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  saveBtn: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
  saveBtnDisabled: {
    color: colors.textMuted,
  },
  heroBanner: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "rgba(165,108,255,0.08)", // Nhấn màu primary nhẹ
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    gap: 0,
  },
  inputRowWrapper: {
    minHeight: 85, // Giữ chiều cao cố định để không bị giật khi hiện error text
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  inputRowNoBorder: {
    borderBottomWidth: 0,
  },
  inputRowError: {
    borderBottomColor: colors.danger,
  },
  inputLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  inputRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  textInput: {
    ...typography.h3,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: "right",
    padding: 0,
    margin: 0,
  },
  resultText: {
    ...typography.h3,
    color: colors.textMuted,
  },
  resultTextActive: {
    color: colors.textPrimary,
  },
  unitText: {
    ...typography.body,
    color: colors.textSecondary,
    width: 40,
    textAlign: "right",
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: 4,
  },
  intensityRow: {
    borderBottomWidth: 1,
  },
  intensitySelector: {
    flexDirection: "row",
    backgroundColor: colors.bgBase,
    borderRadius: radius.pill,
    padding: 4,
  },
  intensityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  intensityBtnActive: {
    backgroundColor: colors.surfaceAlt,
  },
  intensityText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  intensityTextActive: {
    color: colors.primary,
  },
});
