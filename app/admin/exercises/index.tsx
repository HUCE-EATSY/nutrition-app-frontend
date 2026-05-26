import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { adminExercises, AdminExercise } from '../../../services/adminApiMock';
import ExerciseFormModal from '../../../components/admin/ExerciseFormModal';
import Toast from '../../../components/common/Toast';
import { useToast } from '../../../hooks/utils/useToast';

const COLORS = {
  primary: '#10B981',       // Emerald 500
  primaryLight: '#D1FAE5',  // Emerald 100
  bg: '#F8FAFC',           // Slate 50
  white: '#FFFFFF',
  text: '#1E293B',         // Slate 800
  textMuted: '#64748B',    // Slate 500
  border: '#E2E8F0',       // Slate 200
  activeBg: '#ECFDF5',     // Emerald 50
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  info: '#3B82F6',
  grayLight: '#F1F5F9',
};

export default function ExercisesManagement() {
  const { toast, showToast, hideToast } = useToast();
  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, categories: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<AdminExercise | null>(null);

  useEffect(() => {
    fetchExercises();
    fetchStats();
    fetchCategories();
  }, [page, searchQuery, selectedCategory, visibilityFilter]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await adminExercises.getAll({
        page,
        pageSize: 15,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
      });
      setExercises(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      showToast(error.message || 'Không thể tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await adminExercises.getStats();
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch exercise stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await adminExercises.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleToggleVisibility = async (ex: AdminExercise) => {
    try {
      const updated = await adminExercises.toggleVisibility(ex.id);
      showToast(
        `Đã ${updated.isVisible ? 'hiển thị' : 'ẩn'} bài tập "${updated.nameVi}"`,
        'success'
      );
      setExercises(exercises.map((e) => (e.id === ex.id ? updated : e)));
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (Platform.OS === 'web') {
      if (!confirm('Bạn có chắc chắn muốn xóa bài tập này?')) return;
    }
    try {
      await adminExercises.delete(id);
      showToast('Đã xóa bài tập thành công', 'success');
      fetchExercises();
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Lỗi xóa bài tập', 'error');
    }
  };

  const handleOpenForm = (ex: AdminExercise | null = null) => {
    setSelectedExercise(ex);
    setShowFormModal(true);
  };

  const handleSubmitExerciseForm = async (data: Omit<AdminExercise, 'id' | 'calPerKgPerHour'>) => {
    try {
      if (selectedExercise) {
        await adminExercises.update(selectedExercise.id, data);
        showToast('Cập nhật bài tập thành công', 'success');
      } else {
        await adminExercises.create({ ...data, calPerKgPerHour: data.metValue });
        showToast('Thêm bài tập thành công', 'success');
      }
      fetchExercises();
      fetchStats();
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
      throw error;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý Bài tập</Text>
          <Text style={styles.subtitle}>Danh sách các bài tập hỗ trợ tính lượng Kcal tiêu hao trong ứng dụng</Text>
        </View>
        <TouchableOpacity
          style={styles.btnCreate}
          onPress={() => handleOpenForm(null)}
        >
          <Text style={styles.btnCreateText}>+ Thêm bài tập</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>💪 Tổng số bài tập</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
          <Text style={[styles.statVal, { color: COLORS.primary }]}>{stats.visible}</Text>
          <Text style={styles.statLabel}>👁️ Đang hiển thị</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.danger }]}>
          <Text style={[styles.statVal, { color: COLORS.danger }]}>{stats.total - stats.visible}</Text>
          <Text style={styles.statLabel}>🙈 Đang ẩn</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.info }]}>
          <Text style={[styles.statVal, { color: COLORS.info }]}>{stats.categories}</Text>
          <Text style={styles.statLabel}>📁 Danh mục</Text>
        </View>
      </View>

      {/* Math Formula Card Helper */}
      <View style={styles.calcFormulaCard}>
        <Text style={styles.calcFormulaTitle}>💡 Hướng dẫn công thức lượng tiêu hao Calories:</Text>
        <Text style={styles.calcFormulaText}>
          <Text style={{ fontWeight: 'bold' }}>Calories tiêu hao = Trọng lượng (kg) × MET × Thời gian (giờ)</Text>
          {'\n'}Ví dụ: Một người nặng <Text style={{ fontWeight: 'bold' }}>60kg</Text> thực hiện bài tập chạy bộ (MET = <Text style={{ fontWeight: 'bold' }}>8.0</Text>) trong <Text style={{ fontWeight: 'bold' }}>0.5 giờ</Text> (30 phút) sẽ tiêu hao:{'\n'}
          60 × 8.0 × 0.5 = <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>240 kcal</Text>.
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchFilterCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm bài tập (Tiếng Việt hoặc Tiếng Anh)..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setPage(1);
              }}
            />
          </View>
        </View>

        <View style={styles.filtersGroup}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Danh mục:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterBtn, selectedCategory === 'all' && styles.filterBtnActive]}
                onPress={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
              >
                <Text style={[styles.filterBtnText, selectedCategory === 'all' && styles.filterBtnTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterBtn, selectedCategory === cat && styles.filterBtnActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                >
                  <Text style={[styles.filterBtnText, selectedCategory === cat && styles.filterBtnTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.filterItem, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 }]}>
            <Text style={styles.filterLabel}>Trạng thái:</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {([
                { id: 'all', label: 'Tất cả' },
                { id: 'visible', label: 'Đang hiện' },
                { id: 'hidden', label: 'Đang ẩn' },
              ] as const).map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.filterBtn, visibilityFilter === v.id && styles.filterBtnActive]}
                  onPress={() => {
                    setVisibilityFilter(v.id);
                    setPage(1);
                  }}
                >
                  <Text style={[styles.filterBtnText, visibilityFilter === v.id && styles.filterBtnTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Main Table / Grid list */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu tập luyện...</Text>
        </View>
      ) : exercises.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyIcon}>💪</Text>
          <Text style={styles.emptyText}>Không tìm thấy bài tập nào phù hợp</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        /* Web Layout Table */
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 3 }]}>Bài tập (Tiếng Việt)</Text>
            <Text style={[styles.th, { flex: 3 }]}>Tên tiếng Anh</Text>
            <Text style={[styles.th, { flex: 2 }]}>Danh mục</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Chỉ số MET</Text>
            <Text style={[styles.th, { flex: 2 }]}>Cal / kg / giờ</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Hiển thị</Text>
            <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Hành động</Text>
          </View>

          {exercises.map((ex) => (
            <View key={ex.id} style={[styles.tableRow, !ex.isVisible && styles.rowHidden]}>
              <Text style={[styles.td, { flex: 3, fontWeight: '600' }]}>{ex.nameVi}</Text>
              <Text style={[styles.td, { flex: 3, color: COLORS.textMuted }]}>{ex.nameEn}</Text>
              <Text style={[styles.td, { flex: 2 }]}>{ex.category}</Text>
              <Text style={[styles.td, { flex: 1.5, fontWeight: 'bold', color: COLORS.primary }]}>
                {ex.metValue.toFixed(1)}
              </Text>
              <Text style={[styles.td, { flex: 2 }]}>{ex.calPerKgPerHour.toFixed(1)} kcal</Text>
              <View style={{ flex: 1.5 }}>
                <TouchableOpacity onPress={() => handleToggleVisibility(ex)}>
                  <View style={[styles.badge, ex.isVisible ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={ex.isVisible ? styles.badgeActiveText : styles.badgeInactiveText}>
                      {ex.isVisible ? 'Hiện' : 'Ẩn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnEdit]}
                  onPress={() => handleOpenForm(ex)}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnDelete]}
                  onPress={() => handleDeleteExercise(ex.id)}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        /* Mobile Layout Cards */
        <View style={styles.mobileList}>
          {exercises.map((ex) => (
            <View key={ex.id} style={[styles.card, !ex.isVisible && styles.cardHidden]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardName}>{ex.nameVi}</Text>
                  <Text style={styles.cardNameEn}>{ex.nameEn}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggleVisibility(ex)}>
                  <View style={[styles.badge, ex.isVisible ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={ex.isVisible ? styles.badgeActiveText : styles.badgeInactiveText}>
                      {ex.isVisible ? 'Đang hiện' : 'Đang ẩn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Danh mục:</Text>
                  <Text style={styles.infoVal}>{ex.category}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chỉ số MET:</Text>
                  <Text style={[styles.infoVal, { color: COLORS.primary, fontWeight: 'bold' }]}>
                    {ex.metValue.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Năng lượng tiêu hao:</Text>
                  <Text style={styles.infoVal}>{ex.calPerKgPerHour.toFixed(1)} kcal/kg/giờ</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.mobActionBtn, styles.btnEdit]}
                  onPress={() => handleOpenForm(ex)}
                >
                  <Text style={styles.mobActionText}>Chỉnh sửa ✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mobActionBtn, styles.btnDelete]}
                  onPress={() => handleDeleteExercise(ex.id)}
                >
                  <Text style={styles.mobActionText}>Xóa 🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
          >
            <Text style={styles.pageBtnText}>← Trước</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Trang {page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text style={styles.pageBtnText}>Sau →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercise Form Modal */}
      <ExerciseFormModal
        visible={showFormModal}
        exercise={selectedExercise}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitExerciseForm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  header: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  btnCreate: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCreateText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statVal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  calcFormulaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  calcFormulaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  calcFormulaText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  searchFilterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  filtersGroup: {
    gap: 12,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  loadingWrapper: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  emptyWrapper: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayLight,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  th: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  rowHidden: {
    backgroundColor: '#F8FAFC',
    opacity: 0.65,
  },
  td: {
    fontSize: 14,
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeActive: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeActiveText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeInactive: {
    backgroundColor: COLORS.grayLight,
  },
  badgeInactiveText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
  },
  btnEdit: {
    backgroundColor: COLORS.grayLight,
  },
  btnDelete: {
    backgroundColor: COLORS.dangerLight,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  pageBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  pageInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  /* Mobile Styles */
  mobileList: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHidden: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardNameEn: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardBody: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  mobActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobActionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
