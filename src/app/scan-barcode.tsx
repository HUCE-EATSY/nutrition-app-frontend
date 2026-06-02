import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "@/constants";
import { foodService } from "@/services/foodService";
import { FoodDetailModal } from "@/components/meal/FoodDetailModal";
import { FoodSelectorModal } from "@/components/meal/FoodSelectorModal";
import { useDiaryStore } from "@/store/diaryStore";
import { useAppColors } from "@/hooks/useAppColors";

export default function ScanBarcodeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const colors = useAppColors();

  const { addMealEntry, selectedDate } = useDiaryStore();
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);

  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
        <Text style={styles.permissionText}>Chúng tôi cần quyền truy cập Camera để quét mã vạch.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Cấp quyền Camera</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      // Dùng hàm map sẵn từ service thay vì map ở UI
      const food = await foodService.getFoodForUIByBarcode(result.data);
      setIsProcessing(false);

      if (food) {
        setScannedFood(food);
      } else {
        // Không tìm thấy -> Hiển thị UI tuỳ chỉnh thay vì Alert
        setNotFoundBarcode(result.data);
      }
    } catch (error) {
      setIsProcessing(false);
      console.error("Lỗi khi quét mã:", error);
      // Hiển thị UI lỗi thay vì Alert
      setErrorMessage("Có lỗi xảy ra khi tìm kiếm thông tin sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleSaveMeal = async (food: any, grams: number) => {
    try {
      const currentHour = new Date().getHours();
      // Chuyển giờ -> mealTypeId (1: Sáng, 2: Trưa, 3: Tối, 4: Phụ)
      const mealTypeId =
        currentHour >= 5 && currentHour <= 10 ? 1 :
          currentHour >= 11 && currentHour <= 14 ? 2 :
            currentHour >= 18 && currentHour <= 22 ? 3 : 4;

      await addMealEntry({
        foodItemId: food.id,
        mealTypeId,
        dateISO: selectedDate || new Date().toISOString().slice(0, 10),
        quantityG: grams,
      });

      setScannedFood(null);
      router.replace("/(tabs)/diary");
    } catch (error) {
      console.error("Lỗi khi lưu bữa ăn:", error);
      setErrorMessage("Không thể lưu bữa ăn. Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Quét Mã Vạch</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "qr", "code128", "code39"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Overlay scanning area */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.processingText}>Đang tra cứu...</Text>
          </View>
        )}

        {/* Not Found Overlay */}
        {notFoundBarcode && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorBox}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.errorTitle}>Không tìm thấy</Text>
              <Text style={styles.errorDesc}>
                Mã vạch [{notFoundBarcode}] chưa có trong dữ liệu. Bạn muốn làm gì tiếp theo?
              </Text>
              <View style={styles.errorButtons}>
                <Pressable
                  style={[styles.errorBtn, { backgroundColor: colors.surface }]}
                  onPress={() => { setNotFoundBarcode(null); setScanned(false); }}
                >
                  <Text style={[styles.errorBtnText, { color: colors.textPrimary }]}>Quét lại</Text>
                </Pressable>
                <Pressable
                  style={[styles.errorBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setNotFoundBarcode(null);
                    setShowFoodSelector(true);
                  }}
                >
                  <Text style={styles.errorBtnText}>Tìm kiếm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Error Overlay */}
        {errorMessage && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
              <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
              <Text style={styles.errorDesc}>{errorMessage}</Text>
              <Pressable
                style={[styles.errorBtn, { backgroundColor: colors.primary, width: "100%", marginTop: spacing.md }]}
                onPress={() => { setErrorMessage(null); setScanned(false); }}
              >
                <Text style={styles.errorBtnText}>Đóng</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <FoodDetailModal
        visible={!!scannedFood}
        food={scannedFood}
        onClose={() => {
          setScannedFood(null);
          setScanned(false); // Cho phép quét lại
        }}
        onAdd={handleSaveMeal}
        submitButtonText="Thêm vào nhật ký"
        headerTitle="Thêm món quét được"
      />

      <FoodSelectorModal
        visible={showFoodSelector}
        onClose={() => {
          setShowFoodSelector(false);
          setScanned(false);
        }}
        onSelectFood={(food) => {
          setShowFoodSelector(false);
          setScannedFood(food);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: colors.bgBase,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgBase,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "transparent",
    borderRadius: radius.md,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  processingText: {
    ...typography.bodyStrong,
    color: "#FFF",
    marginTop: spacing.md,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    width: "100%",
    alignItems: "center",
  },
  permissionButtonText: {
    ...typography.bodyStrong,
    color: "#FFF",
  },
  cancelButton: {
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    ...typography.bodyStrong,
    color: colors.textMuted,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: spacing.xl,
  },
  errorBox: {
    backgroundColor: colors.bgElevated,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  errorButtons: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  errorBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBtnText: {
    ...typography.bodyStrong,
    color: "#FFF",
  },
});
