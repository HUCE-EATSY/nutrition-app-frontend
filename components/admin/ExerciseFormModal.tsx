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
import { AdminExercise } from '../../services/adminApiMock';

interface ExerciseFormModalProps {
  visible: boolean;
  exercise?: AdminExercise | null;
  onClose: () => void;
  onSubmit: (data: Omit<AdminExercise, 'id' | 'calPerKgPerHour'>) => Promise<void>;
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

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  visible,
  exercise,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    nameVi: '',
    nameEn: '',
    category: '',
    metValue: '',
    isVisible: true,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (exercise) {
      setFormData({
        nameVi: exercise.nameVi,
        nameEn: exercise.nameEn,
        category: exercise.category,
        metValue: exercise.metValue.toString(),
        isVisible: exercise.isVisible,
        imageUrl: exercise.imageUrl || '',
      });
    } else {
      setFormData({
        nameVi: '',
        nameEn: '',
        category: 'Cardio',
        metValue: '',
        isVisible: true,
        imageUrl: '',
      });
    }
    setErrors({});
  }, [exercise, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nameVi.trim()) newErrors.nameVi = 'Tên tiếng Việt là bắt buộc';
    if (!formData.nameEn.trim()) newErrors.nameEn = 'Tên tiếng Anh là bắt buộc';
    if (!formData.category.trim()) newErrors.category = 'Danh mục là bắt buộc';
    if (!formData.metValue || isNaN(Number(formData.metValue))) {
      newErrors.metValue = 'Chỉ số MET phải là một số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data: Omit<AdminExercise, 'id' | 'calPerKgPerHour'> = {
        nameVi: formData.nameVi.trim(),
        nameEn: formData.nameEn.trim(),
        category: formData.category.trim(),
        metValue: Number(formData.metValue),
        isVisible: formData.isVisible,
        imageUrl: formData.imageUrl.trim() || null,
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
              {exercise ? 'Chỉnh sửa Bài tập' : 'Thêm Bài tập mới'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeBtn}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={{ gap: 16 }}>
            {/* Name fields */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Tên tiếng Việt *</Text>
                <TextInput
                  style={[styles.input, errors.nameVi && styles.inputError]}
                  placeholder="Ví dụ: Đạp xe"
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
                  placeholder="Ví dụ: Cycling"
                  value={formData.nameEn}
                  onChangeText={(text) => setFormData({ ...formData, nameEn: text })}
                  editable={!loading}
                />
                {errors.nameEn && <Text style={styles.errorText}>{errors.nameEn}</Text>}
              </View>
            </View>

            {/* Category & MET Value */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Danh mục bài tập *</Text>
                <TextInput
                  style={[styles.input, errors.category && styles.inputError]}
                  placeholder="Ví dụ: Cardio, Sức mạnh, Linh hoạt..."
                  value={formData.category}
                  onChangeText={(text) => setFormData({ ...formData, category: text })}
                  editable={!loading}
                />
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Chỉ số MET *</Text>
                <TextInput
                  style={[styles.input, errors.metValue && styles.inputError]}
                  placeholder="Ví dụ: 6.0"
                  value={formData.metValue}
                  onChangeText={(text) => setFormData({ ...formData, metValue: text })}
                  keyboardType="numeric"
                  editable={!loading}
                />
                {errors.metValue && <Text style={styles.errorText}>{errors.metValue}</Text>}
              </View>
            </View>

            {/* Image URL */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Đường dẫn ảnh bài tập (Image URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/cycling.jpg"
                value={formData.imageUrl}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                editable={!loading}
              />
            </View>

            {/* Calculation helper */}
            <View style={styles.calcHelper}>
              <Text style={styles.calcHelperTitle}>💡 Thông tin chỉ số MET:</Text>
              <Text style={styles.calcHelperText}>
                Số Kcal tiêu hao = Cân nặng (kg) × MET × Thời gian tập (giờ).
              </Text>
              {formData.metValue ? (
                <Text style={styles.calcHelperResult}>
                  Với MET = {formData.metValue}, 1 người 60kg tập 1 giờ tiêu hao{' '}
                  <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>
                    {(60 * Number(formData.metValue || 0)).toFixed(0)} Kcal
                  </Text>
                  .
                </Text>
              ) : null}
            </View>

            {/* Visibility Toggle */}
            <View style={styles.switchGroup}>
              <View>
                <Text style={styles.switchTitle}>Hiển thị trên ứng dụng</Text>
                <Text style={styles.switchSub}>Người dùng có thể tìm kiếm và chọn bài tập này</Text>
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
                  {exercise ? 'Lưu cập nhật' : 'Thêm bài tập'}
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
  calcHelper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  calcHelperTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  calcHelperText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  calcHelperResult: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
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

export default ExerciseFormModal;
