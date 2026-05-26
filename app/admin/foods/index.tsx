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
  Modal,
} from 'react-native';
import { adminFoods, AdminFood } from '../../../services/adminApiMock';
import FoodFormModal from '../../../components/admin/FoodFormModal';
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

export default function FoodsManagement() {
  const { toast, showToast, hideToast } = useToast();
  const [foods, setFoods] = useState<AdminFood[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0, categories: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<AdminFood | null>(null);

  // CSV Import Modal States
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    fetchFoods();
    fetchStats();
    fetchCategories();
  }, [page, searchQuery, selectedCategory, visibilityFilter]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await adminFoods.getAll({
        page,
        pageSize: 15,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
      });
      setFoods(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      showToast(error.message || 'Không thể tải danh sách món ăn', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsRes = await adminFoods.getStats();
      setStats(statsRes);
    } catch (error) {
      console.error('Failed to fetch food stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await adminFoods.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleToggleVisibility = async (food: AdminFood) => {
    try {
      const updated = await adminFoods.toggleVisibility(food.id);
      showToast(
        `Đã ${updated.isVisible ? 'hiển thị' : 'ẩn'} món ăn "${updated.nameVi}"`,
        'success'
      );
      setFoods(foods.map((f) => (f.id === food.id ? updated : f)));
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (Platform.OS === 'web') {
      if (!confirm('Bạn có chắc chắn muốn xóa món ăn này?')) return;
    }
    try {
      await adminFoods.delete(id);
      showToast('Đã xóa món ăn thành công', 'success');
      fetchFoods();
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Lỗi xóa món ăn', 'error');
    }
  };

  const handleOpenForm = (food: AdminFood | null = null) => {
    setSelectedFood(food);
    setShowFormModal(true);
  };

  const handleSubmitFoodForm = async (data: Omit<AdminFood, 'id'>) => {
    try {
      if (selectedFood) {
        await adminFoods.update(selectedFood.id, data);
        showToast('Cập nhật món ăn thành công', 'success');
      } else {
        await adminFoods.create(data);
        showToast('Thêm món ăn thành công', 'success');
      }
      fetchFoods();
      fetchStats();
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
      throw error;
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      showToast('Vui lòng nhập nội dung CSV', 'warning');
      return;
    }

    setCsvLoading(true);
    try {
      const res = await adminFoods.importCsv(csvText);
      showToast(`Nhập thành công ${res.imported} món ăn từ CSV!`, 'success');
      setShowCsvModal(false);
      setCsvText('');
      setPage(1);
      fetchFoods();
      fetchStats();
      fetchCategories();
    } catch (error: any) {
      showToast(error.message || 'Lỗi nhập CSV', 'error');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản lý Thực đơn</Text>
          <Text style={styles.subtitle}>Danh sách các món ăn trong cơ sở dữ liệu dinh dưỡng hệ thống</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.btnAction, styles.btnCsv]}
            onPress={() => setShowCsvModal(true)}
          >
            <Text style={styles.btnCsvText}>📥 Nhập CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnAction, styles.btnCreate]}
            onPress={() => handleOpenForm(null)}
          >
            <Text style={styles.btnCreateText}>+ Thêm món ăn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>🍎 Tổng số món</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
          <Text style={[styles.statVal, { color: COLORS.primary }]}>{stats.visible}</Text>
          <Text style={styles.statLabel}>👁️ Đang hiển thị</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.danger }]}>
          <Text style={[styles.statVal, { color: COLORS.danger }]}>{stats.hidden}</Text>
          <Text style={styles.statLabel}>🙈 Đang ẩn</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.info }]}>
          <Text style={[styles.statVal, { color: COLORS.info }]}>{stats.categories}</Text>
          <Text style={styles.statLabel}>📁 Danh mục</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchFilterCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món ăn (Tiếng Việt hoặc Tiếng Anh)..."
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

      {/* Main Grid / List */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu thực đơn...</Text>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyText}>Không tìm thấy món ăn nào phù hợp</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        /* Web Layout Table */
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2.5 }]}>Tên tiếng Việt</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>Tên tiếng Anh</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Danh mục</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Calo</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>Protein / Carbs / Fat</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Khẩu phần</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Hiển thị</Text>
            <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Hành động</Text>
          </View>

          {foods.map((food) => (
            <View key={food.id} style={[styles.tableRow, !food.isVisible && styles.rowHidden]}>
              <Text style={[styles.td, { flex: 2.5, fontWeight: '600' }]}>{food.nameVi}</Text>
              <Text style={[styles.td, { flex: 2.5, color: COLORS.textMuted }]}>{food.nameEn}</Text>
              <Text style={[styles.td, { flex: 1.5 }]}>{food.category}</Text>
              <Text style={[styles.td, { flex: 1.2, fontWeight: 'bold', color: COLORS.warning }]}>
                {food.calories} kcal
              </Text>
              <Text style={[styles.td, { flex: 2.5 }]}>
                {food.protein}g / {food.carbs}g / {food.fat}g
              </Text>
              <Text style={[styles.td, { flex: 1.5 }]}>
                {food.servingSize} {food.unit}
              </Text>
              <View style={{ flex: 1.2 }}>
                <TouchableOpacity onPress={() => handleToggleVisibility(food)}>
                  <View style={[styles.badge, food.isVisible ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={food.isVisible ? styles.badgeActiveText : styles.badgeInactiveText}>
                      {food.isVisible ? 'Hiện' : 'Ẩn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnEdit]}
                  onPress={() => handleOpenForm(food)}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnDelete]}
                  onPress={() => handleDeleteFood(food.id)}
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
          {foods.map((food) => (
            <View key={food.id} style={[styles.card, !food.isVisible && styles.cardHidden]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardName}>{food.nameVi}</Text>
                  <Text style={styles.cardNameEn}>{food.nameEn}</Text>
                </View>
                <TouchableOpacity onPress={() => handleToggleVisibility(food)}>
                  <View style={[styles.badge, food.isVisible ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={food.isVisible ? styles.badgeActiveText : styles.badgeInactiveText}>
                      {food.isVisible ? 'Đang hiện' : 'Đang ẩn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Danh mục:</Text>
                  <Text style={styles.infoVal}>{food.category}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Năng lượng:</Text>
                  <Text style={[styles.infoVal, { color: COLORS.warning, fontWeight: 'bold' }]}>
                    {food.calories} kcal / {food.servingSize} {food.unit}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Macros (P/C/F):</Text>
                  <Text style={styles.infoVal}>
                    {food.protein}g / {food.carbs}g / {food.fat}g
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.mobActionBtn, styles.btnEdit]}
                  onPress={() => handleOpenForm(food)}
                >
                  <Text style={styles.mobActionText}>Chỉnh sửa ✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mobActionBtn, styles.btnDelete]}
                  onPress={() => handleDeleteFood(food.id)}
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

      {/* Food Form Modal */}
      <FoodFormModal
        visible={showFormModal}
        food={selectedFood}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitFoodForm}
      />

      {/* CSV Import Modal */}
      <Modal
        visible={showCsvModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCsvModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nhập thực đơn từ file CSV</Text>
              <TouchableOpacity
                onPress={() => setShowCsvModal(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.csvInfoContainer}>
              <Text style={styles.csvInfoTitle}>💡 Định dạng dòng dữ liệu CSV mẫu:</Text>
              <Text style={styles.csvInfoCode}>
                nameVi,nameEn,category,calories,protein,carbs,fat,servingSize,unit
              </Text>
              <Text style={styles.csvInfoCode}>
                Cơm trắng,White Rice,Tinh bột,130,2.7,28.2,0.3,100,g
              </Text>
            </View>

            <TextInput
              style={styles.csvTextarea}
              placeholder="Dán nội dung CSV vào đây (bao gồm dòng tiêu đề đầu tiên)..."
              multiline={true}
              numberOfLines={10}
              value={csvText}
              onChangeText={setCsvText}
              editable={!csvLoading}
            />

            {csvLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 12 }} />
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setShowCsvModal(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={handleImportCsv}
                >
                  <Text style={styles.modalBtnSaveText}>Bắt đầu nhập</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btnAction: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCsv: {
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnCsvText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  btnCreate: {
    backgroundColor: COLORS.primary,
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
  /* Modal Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 540,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeModalBtn: {
    padding: 4,
  },
  closeModalText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  csvInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  csvInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  csvInfoCode: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  csvTextarea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
    minHeight: 180,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalBtnSave: {
    backgroundColor: COLORS.primary,
  },
  modalBtnSaveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
