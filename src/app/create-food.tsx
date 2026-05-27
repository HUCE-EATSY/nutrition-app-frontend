import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { foodService } from "@/services/foodService";
import { Toast } from "@/components/common/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/constants/i18n";

export default function CreateFoodScreen() {
  const t = useTranslation();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const queryClient = useQueryClient();
  const categories = [
    { id: 1, name: t.categories.riceAndStickyRice },
    { id: 2, name: t.categories.noodleSoup },
    { id: 3, name: t.categories.breadAndPastries },
    { id: 4, name: t.categories.drinks },
    { id: 5, name: t.categories.packagedFood },
    { id: 6, name: t.categories.vegetablesAndFruits },
    { id: 7, name: t.categories.meatAndSeafood },
    { id: 10, name: t.categories.other }
  ];

  const [name, setName] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(10);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  
  // Các chỉ số dinh dưỡng tính trên 100 gram
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToastMsg = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t.createFood.permissionTitle, t.createFood.permissionMsg);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);
      showToastMsg(t.createFood.pickImageError, "error");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToastMsg(t.createFood.nameRequired, "error");
      return;
    }
    if (!calories.trim()) {
      showToastMsg(t.createFood.caloriesRequired, "error");
      return;
    }

    setIsSaving(true);
    try {
      // Chuẩn bị ảnh cho React Native / Web FormData
      let imageFile: any = undefined;
      if (imageUri) {
        const filename = imageUri.split("/").pop() || "food.jpg";
        const match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image/jpeg`;
        if (type === "image/jpg") type = "image/jpeg"; // Fix MIME type cho ảnh jpg
        
        imageFile = {
          uri: imageUri,
          name: filename,
          type,
        };
      }

      // Tạo món ăn mới thông qua foodService
      await foodService.createFood({
        nameVi: name.trim(),
        categoryId: selectedCategoryId,
        servingSizeG: 100, // Theo banner thông tin: Khối lượng tính trên 100 gram
        servingUnitVi: "g",
        image: imageFile,
        nutrition: {
          caloriesKcal: parseFloat(calories) || 0,
          proteinG: parseFloat(protein) || 0,
          fatG: parseFloat(fat) || 0,
          carbsG: parseFloat(carbs) || 0,
        },
      });

      // Invalidate cache to refetch updated food items list immediately
      queryClient.invalidateQueries({ queryKey: ["food"] });

      showToastMsg(t.createFood.createSuccess, "success");

      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Lỗi khi tạo thực phẩm:", JSON.stringify(error?.response?.data || error.message));
      const responseData = error?.response?.data;
      const validationErrors = responseData?.errors ? JSON.stringify(responseData.errors) : "";
      const errMsg = responseData?.message || error?.message || t.createFood.createError;
      showToastMsg(errMsg + " " + validationErrors, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons color={colors.textPrimary} name="chevron-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.createFood.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Section: Hình ảnh */}
          <Text style={styles.sectionTitle}>{t.createFood.image}</Text>
          <View style={styles.imageSection}>
            <View style={styles.imageFrame}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderFrame}>
                  <MaterialCommunityIcons name="bowl-mix" size={64} color="#5e548e" />
                </View>
              )}
            </View>
            <Pressable onPress={handlePickImage} style={styles.uploadBtn}>
              <Ionicons name="add" size={18} color="#a78bfa" />
              <Text style={styles.uploadBtnText}>{t.createFood.uploadBtn}</Text>
            </Pressable>
          </View>

          {/* Section: Thông tin dinh dưỡng */}
          <Text style={styles.sectionTitle}>{t.createFood.nutritionInfo}</Text>
          <View style={styles.formContainer}>
            {/* Tên thực phẩm */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.foodName}</Text>
              <TextInput
                onChangeText={setName}
                placeholder={t.createFood.enterFoodNamePlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[styles.textInput, { textAlign: "right" }]}
                value={name}
              />
            </View>

            {/* Danh mục */}
            <Pressable onPress={() => setIsCategoryModalVisible(true)} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.category}</Text>
              <View style={styles.selectRow}>
                <Text style={styles.selectValue}>
                  {categories.find((c) => c.id === selectedCategoryId)?.name || t.categories.other}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </Pressable>

            {/* Đơn vị tính */}
            <Pressable style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.unit}</Text>
              <View style={styles.selectRow}>
                <Text style={styles.selectValue}>{t.createFood.gramUnit}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </Pressable>

            {/* Info Green Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#10b981" />
              <Text style={styles.infoBannerText}>{t.createFood.weightNotice}</Text>
            </View>

            {/* Calories */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.calories}</Text>
              <View style={styles.numericInputContainer}>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setCalories}
                  placeholder="200"
                  placeholderTextColor={colors.textMuted}
                  style={styles.numericInput}
                  value={calories}
                />
                <Text style={styles.unitText}>cal</Text>
              </View>
            </View>

            {/* Protein */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.protein}</Text>
              <View style={styles.numericInputContainer}>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setProtein}
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  style={styles.numericInput}
                  value={protein}
                />
                <Text style={styles.unitText}>gram</Text>
              </View>
            </View>

            {/* Fat */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.fat}</Text>
              <View style={styles.numericInputContainer}>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setFat}
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  style={styles.numericInput}
                  value={fat}
                />
                <Text style={styles.unitText}>gram</Text>
              </View>
            </View>

            {/* Carbs */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t.createFood.carbs}</Text>
              <View style={styles.numericInputContainer}>
                <TextInput
                  keyboardType="numeric"
                  onChangeText={setCarbs}
                  placeholder="10"
                  placeholderTextColor={colors.textMuted}
                  style={styles.numericInput}
                  value={carbs}
                />
                <Text style={styles.unitText}>gram</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Save Button */}
        <View style={styles.footer}>
          <Pressable
            disabled={isSaving}
            onPress={handleSave}
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.textPrimary} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>{t.createFood.saveBtn}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Modal chọn Danh mục */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.createFood.selectCategory}</Text>
              <Pressable hitSlop={8} onPress={() => setIsCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalList}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategoryId(cat.id);
                    setIsCategoryModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedCategoryId === cat.id && styles.modalItemTextActive]}>
                    {cat.name}
                  </Text>
                  {selectedCategoryId === cat.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast Alert */}
      <Toast
        message={toastMessage}
        onHide={() => setToastVisible(false)}
        type={toastType}
        visible={toastVisible}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase, // Deep dark purple background to match standard dark theme
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "bold",
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  imageSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    backgroundColor: colors.bgElevated,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  imageFrame: {
    width: 130,
    height: 130,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderFrame: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  uploadBtnText: {
    color: "#a78bfa", // Premium violet link text
    fontWeight: "600",
    fontSize: 13,
  },
  formContainer: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 2,
    marginLeft: spacing.lg,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  selectValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  infoBannerText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "500",
  },
  numericInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  numericInput: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    width: 80,
    paddingVertical: 2,
  },
  unitText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  saveBtn: {
    backgroundColor: colors.primary, // Premium purple button
    borderRadius: radius.pill,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: colors.primaryStrong,
    opacity: 0.7,
  },
  saveBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    width: "100%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalList: {
    padding: spacing.md,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  modalItemText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  modalItemTextActive: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
});
