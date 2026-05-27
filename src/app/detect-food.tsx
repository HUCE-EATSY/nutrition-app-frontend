import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { colors, spacing, typography, radius } from "@/constants";
import { foodService } from "@/services/foodService";
import { FoodDetailModal } from "@/components/meal/FoodDetailModal";
import { Toast } from "@/components/common/Toast";
import { useDiaryStore } from "@/store/diaryStore";
import { API_BASE } from "@/constants/api";

// ── Types ─────────────────────────────────────────────────────────────────────
type DetectionPhase =
  | "idle"          // Chưa chọn ảnh
  | "analyzing"     // Đang gọi Spoonacular (đã gồm upload trong BE)
  | "result"        // Có kết quả, mở FoodDetailModal
  | "error";        // Có lỗi

export default function DetectFoodScreen() {
  const [phase, setPhase] = useState<DetectionPhase>("idle");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedFood, setDetectedFood] = useState<any>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { addMealEntry, selectedDate } = useDiaryStore();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToastMsg = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // ── Pick image from gallery ──────────────────────────────────────────────
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Cần quyền truy cập thư viện ảnh để tiếp tục.");
      setPhase("error");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    await processImage(result.assets[0].uri);
  };

  // ── Take photo with camera ───────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Cần quyền truy cập Camera để tiếp tục.");
      setPhase("error");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    await processImage(result.assets[0].uri);
  };

  // ── Core processing pipeline ─────────────────────────────────────────────
  const processImage = async (uri: string) => {
    setSelectedImageUri(uri);
    setErrorMsg(null);

    try {
      const filename = uri.split("/").pop() || "food.jpg";

      // Fix lỗi MIME type: image/jpg không hợp lệ, phải là image/jpeg
      let type = "image/jpeg";
      if (filename.toLowerCase().endsWith(".png")) type = "image/png";
      else if (filename.toLowerCase().endsWith(".webp")) type = "image/webp";

      const imageFile = {
        uri,
        name: filename,
        type,
      };

      setPhase("analyzing");
      const estimated = await foodService.estimateNutrients(imageFile);

      if (!estimated) {
        setErrorMsg(
          "Không thể nhận dạng thực phẩm từ ảnh này. Vui lòng thử ảnh khác (ảnh rõ hơn, có 1 món ăn chính)."
        );
        setPhase("error");
        return;
      }

      // Step 3: Map sang FoodItem shape cho FoodDetailModal
      const foodItem = foodService.mapEstimatedToFoodItem(estimated);
      setDetectedFood(foodItem);
      setPhase("result");
    } catch (err: any) {
      console.error("Detection error:", err);
      setErrorMsg(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setPhase("error");
    }
  };

  // ── Save: POST /api/foods → POST /api/logs/food ──────────────────────────
  const handleSaveFood = async (food: any, grams: number) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const raw = food._raw; // EstimatedFoodResponse lưu trong _raw

      // Step 1: Tạo food mới trong DB (source=Community, status=Pending)
      const created = await foodService.createFood({
        nameVi: raw.name_en || "Món ăn nhận diện",
        nameEn: raw.name_en,
        categoryId: 10, // fallback "Khác" — có thể mở rộng sau
        servingSizeG: raw.serving_size_g,
        servingUnitVi: "g",
        imageUrl: raw.image_url || undefined,
        nutrition: {
          caloriesKcal: raw.nutrition.calories_kcal,
          proteinG: raw.nutrition.protein_g,
          carbsG: raw.nutrition.carbs_g,
          fatG: raw.nutrition.fat_g,
          fiberG: raw.nutrition.fiber_g,
          sugarG: raw.nutrition.sugar_g,
          sodiumMg: raw.nutrition.sodium_mg,
        },
      });

      // Step 2: Log vào diary với serving đã chọn
      const currentHour = new Date().getHours();
      const mealTypeId =
        currentHour >= 5 && currentHour <= 10 ? 1 :
          currentHour >= 11 && currentHour <= 14 ? 2 :
            currentHour >= 18 && currentHour <= 22 ? 3 : 4;

      await addMealEntry({
        foodItemId: created.id,
        mealTypeId,
        dateISO: selectedDate || new Date().toISOString().slice(0, 10),
        quantityG: grams,
      });

      showToastMsg("Đã lưu món ăn vào nhật ký!", "success");
      setDetectedFood(null);
      router.replace("/(tabs)/diary");
    } catch (err: any) {
      console.error("Save error:", err);
      showToastMsg(
        err?.response?.data?.message || "Không thể lưu. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setPhase("idle");
    setSelectedImageUri(null);
    setErrorMsg(null);
    setDetectedFood(null);
    setCloudinaryUrl(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Nhận diện món ăn</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Idle: Chọn ảnh */}
        {phase === "idle" && (
          <>
            {/* Hero illustration */}
            <View style={styles.heroBox}>
              <MaterialCommunityIcons name="food-fork-drink" size={80} color={colors.success} />
              <Text style={styles.heroTitle}>Chụp ảnh món ăn</Text>
              <Text style={styles.heroSub}>
                AI sẽ nhận diện và ước tính dinh dưỡng tự động từ ảnh bạn cung cấp.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.actionCard} onPress={handleTakePhoto}>
                <View style={[styles.actionIcon, { backgroundColor: "rgba(100, 220, 100, 0.15)" }]}>
                  <Ionicons name="camera" size={32} color={colors.success} />
                </View>
                <Text style={styles.actionLabel}>Chụp ảnh</Text>
                <Text style={styles.actionSub}>Dùng camera</Text>
              </Pressable>

              <Pressable style={styles.actionCard} onPress={handlePickImage}>
                <View style={[styles.actionIcon, { backgroundColor: "rgba(62, 166, 255, 0.15)" }]}>
                  <Ionicons name="images" size={32} color="#3ea6ff" />
                </View>
                <Text style={styles.actionLabel}>Chọn ảnh</Text>
                <Text style={styles.actionSub}>Từ thư viện</Text>
              </Pressable>
            </View>

            {/* Tips */}
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Mẹo để nhận diện tốt hơn</Text>
              {[
                "Chụp rõ ràng, đủ ánh sáng",
                "1 món ăn chính trong khung hình",
                "Tránh ảnh mờ hoặc góc chụp xiên",
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Processing: Analyzing */}
        {phase === "analyzing" && (
          <View style={styles.processingBox}>
            {selectedImageUri && (
              <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
            )}
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingTitle}>AI đang phân tích...</Text>
              <Text style={styles.processingSubtitle}>Ước tính dinh dưỡng từ hình ảnh</Text>
            </View>
          </View>
        )}

        {/* Error state */}
        {phase === "error" && (
          <View style={styles.errorBox}>
            {selectedImageUri && (
              <Image source={{ uri: selectedImageUri }} style={styles.previewImageSmall} />
            )}
            <Ionicons name="alert-circle-outline" size={56} color={colors.danger} style={{ marginTop: spacing.lg }} />
            <Text style={styles.errorTitle}>Không nhận diện được</Text>
            <Text style={styles.errorDesc}>{errorMsg}</Text>
            <Pressable style={styles.retryBtn} onPress={handleRetry}>
              <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: spacing.xs }} />
              <Text style={styles.retryBtnText}>Thử ảnh khác</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>

      {/* FoodDetailModal — hiện khi có kết quả */}
      <FoodDetailModal
        visible={phase === "result" && !!detectedFood}
        food={detectedFood}
        onClose={() => {
          setDetectedFood(null);
          setPhase("idle");
        }}
        onAdd={handleSaveFood}
        submitButtonText={isSaving ? "Đang lưu..." : "Lưu món ăn"}
        headerTitle="Kết quả nhận diện"
      />

      <Toast
        message={toastMessage}
        onHide={() => setToastVisible(false)}
        type={toastType}
        visible={toastVisible}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  backButton: { padding: 4 },
  title: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 17,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },

  // ── Idle ──
  heroBox: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  actionSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  tipsBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  tipsTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },

  // ── Processing ──
  processingBox: {
    alignItems: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  processingOverlay: {
    alignItems: "center",
    gap: spacing.md,
  },
  processingTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 18,
  },
  processingSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // ── Error ──
  errorBox: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  previewImageSmall: {
    width: 140,
    height: 140,
    borderRadius: radius.lg,
    opacity: 0.5,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  errorDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  retryBtnText: {
    ...typography.bodyStrong,
    color: "#fff",
  },
});
