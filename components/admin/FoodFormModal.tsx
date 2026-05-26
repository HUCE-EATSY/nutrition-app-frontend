import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { AdminFood } from '../../services/adminApiMock';

interface FoodFormModalProps {
  visible: boolean;
  food?: AdminFood | null;
  onClose: () => void;
  onSubmit: (data: Omit<AdminFood, 'id'>) => Promise<void>;
}

const COLORS = {
  primary: '#10B981',       // Emerald 500
  primaryLight: '#D1FAE5',  // Emerald 100
  bg: '#F8FAFC',           // Slate 50
  white: '#FFFFFF',
  text: '#1E293B',         // Slate 800
  textMuted: '#64748B',    // Slate 500
  border: '#E2E8F0',       // Slate 200
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

const FoodFormModal: React.FC<FoodFormModalProps> = ({
  visible,
  food,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    category: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
    unit: '',
    isVisible: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (food) {
      setFormData({
        nameVi: food.nameVi,
        nameEn: food.nameEn,
        category: food.category,
        calories: food.calories.toString(),
        protein: food.protein.toString(),
        carbs: food.carbs.toString(),
        fat: food.fat.toString(),
        servingSize: food.servingSize.toString(),
        unit: food.unit,
        isVisible: food.isVisible,
      });
    } else {
      setFormData({
        nameVi: '',
        nameEn: '',
        category: 'Tinh bột',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        servingSize: '100',
        unit: 'g',
        isVisible: true,
      });
    }
    setErrors({});
  }, [food, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameVi.trim()) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc';
    if (!formData.nameEn.trim()) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc';
    if (!formData.category.trim()) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.calories || isNaN(Number(formData.calories))) {
      newErrors.calories = 'Calories phải là số';
    }
    if (!formData.protein || isNaN(Number(formData.protein))) {
      newErrors.protein = 'Protein phải là số';
    }
    if (!formData.carbs || isNaN(Number(formData.carbs))) {
      newErrors.carbs = 'Carbs phải là số';
    }
    if (!formData.fat || isNaN(Number(formData.fat))) {
      newErrors.fat = 'Fat phải là số';
    }
    if (!formData.servingSize || isNaN(Number(formData.servingSize))) {
      newErrors.servingSize = 'Khẩu phần phải là số';
    }
    if (!formData.unit.trim()) newErrors.unit = 'Đơn vị là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: Omit<AdminFood, 'id'> = {
        nameVi: formData.nameVi.trim(),
        nameEn: formData.nameEn.trim(),
        category: formData.category.trim(),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        servingSize: Number(formData.servingSize),
        unit: formData.unit.trim(),
        isVisible: formData.isVisible,
      };
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {food ? 'Chỉnh sửa Món ăn' : 'Thêm Món ăn mới'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={{ gap: 16 }}>
            {/* Names */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Tên tiếng Việt *</Text>
                <TextInput
                  style={[styles.input, errors.nameVi && styles.inputError]}
                  placeholder="Ví dụ: Cơm trắng"
                  value={formData.nameVi}
                  onChangeText={(text) => setFormData({ ...formData, nameVi: text })}
                  editable={!loading}
                />
                {errors.nameVi && <Text style={styles.errorText}>{errors.nameVi}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Tên tiếng Anh *</Text>
                <TextInput
                  style={[styles.input, errors.nameEn && styles.inputError]}
                  placeholder="Ví dụ: White Rice"
                  value={formData.nameEn}
                  onChangeText={(text) => setFormData({ ...formData, nameEn: text })}
                  editable={!loading}
                />
                {errors.nameEn && <Text style={styles.errorText}>{errors.nameEn}</Text>}
              </View>
            </View>

            {/* Category & Unit */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Danh mục thực phẩm *</Text>
                <TextInput
                  style={[styles.input, errors.category && styles.inputError]}
                  placeholder="Ví dụ: Tinh bột, Hải sản..."
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  editable={!loading}
                />
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Đơn vị định lượng *</Text>
                <TextInput
                  style={[styles.input, errors.unit && styles.inputError]}
                  placeholder="Ví dụ: g, bát, tô, quả..."
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  editable={!loading}
                />
                {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
              </View>
            </View>

            {/* Calories & Serving Size */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Calories (kcal) *</Text>
                <TextInput
                  style={[styles.input, errors.calories && styles.inputError]}
                  placeholder="130"
                  value={formData.calories}
                  onChangeText={(text) => setFormData({ ...formData, calories: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.calories && <Text style={styles.errorText}>{errors.calories}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Khẩu phần tính *</Text>
                <TextInput
                  style={[styles.input, errors.servingSize && styles.inputError]}
                  placeholder="100"
                  value={formData.servingSize}
                  onChangeText={(text) => setFormData({ ...formData, servingSize: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.servingSize && <Text style={styles.errorText}>{errors.servingSize}</Text>}
              </View>
            </View>

            {/* Macros: Protein, Carbs, Fat */}
            <Text style={styles.sectionLabel}>Thành phần dinh dưỡng (Macros)</Text>
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Protein (g) *</Text>
                <TextInput
                  style={[styles.input, errors.protein && styles.inputError]}
                  placeholder="2.7"
                  value={formData.protein}
                  onChangeText={(text) => setFormData({ ...formData, protein: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.protein && <Text style={styles.errorText}>{errors.protein}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Carbs (g) *</Text>
                <TextInput
                  style={[styles.input, errors.carbs && styles.inputError]}
                  placeholder="28"
                  value={formData.carbs}
                  onChangeText={(text) => setFormData({ ...formData, carbs: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.carbs && <Text style={styles.errorText}>{errors.carbs}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Fat (g) *</Text>
                <TextInput
                  style={[styles.input, errors.fat && styles.inputError]}
                  placeholder="0.3"
                  value={formData.fat}
                  onChangeText={(text) => setFormData({ ...formData, fat: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.fat && <Text style={styles.errorText}>{errors.fat}</Text>}
              </View>
            </View>

            {/* Visibility Toggle */}
            <View style={styles.switchGroup}>
              <View>
                <Text style={styles.switchTitle}>Hiển thị trên ứng dụng</Text>
                <Text style={styles.switchSub}>Người dùng có thể tìm kiếm món ăn này</Text>
              </View>
              <Switch
                value={formData.isVisible}
                onValueChange={(val) => setFormData({ ...formData, isVisible: val })}
                disabled={loading}
                trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
                thumbColor={formData.isVisible ? COLORS.primary : '#94A3B8'}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {food ? 'Lưu cập nhật' : 'Thêm món ăn'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  form: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 11,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FoodFormModal;
