import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import {
  adminVip,
  VipPackage,
  Transaction,
  AdminUser,
} from '../../../services/adminApiMock';
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
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  grayLight: '#F1F5F9',
};

type ActiveTab = 'packages' | 'transactions' | 'usersByPkg';

export default function VipManagement() {
  const { toast, showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('packages');
  const [loading, setLoading] = useState(true);

  // Tab 1: Packages
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<VipPackage | null>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '',
    price: '',
    durationDays: '',
    featuresText: '',
    isActive: true,
  });

  // Tab 2: Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  // Tab 3: Users by Package
  const [selectedPkgIdForUsers, setSelectedPkgIdForUsers] = useState<number | null>(null);
  const [usersByPkg, setUsersByPkg] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadTabInitData();
  }, [activeTab, txPage, txStatusFilter, selectedPkgIdForUsers]);

  const loadTabInitData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'packages') {
        const pkgs = await adminVip.getPackages();
        setPackages(pkgs);
      } else if (activeTab === 'transactions') {
        const txRes = await adminVip.getTransactions({
          page: txPage,
          pageSize: 10,
          status: txStatusFilter,
        });
        setTransactions(txRes.data);
        setTxTotalPages(txRes.totalPages);
      } else if (activeTab === 'usersByPkg') {
        const pkgs = await adminVip.getPackages();
        setPackages(pkgs);
        if (pkgs.length > 0 && selectedPkgIdForUsers === null) {
          setSelectedPkgIdForUsers(pkgs[0].id);
        } else if (selectedPkgIdForUsers !== null) {
          setUsersLoading(true);
          const users = await adminVip.getUsersByPackage(selectedPkgIdForUsers);
          setUsersByPkg(users);
          setUsersLoading(false);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  // Package Form Operations
  const handleOpenPkgModal = (pkg: VipPackage | null = null) => {
    setSelectedPkg(pkg);
    if (pkg) {
      setPkgForm({
        name: pkg.name,
        price: pkg.price.toString(),
        durationDays: pkg.durationDays.toString(),
        featuresText: pkg.features.join('\n'),
        isActive: pkg.isActive,
      });
    } else {
      setPkgForm({
        name: '',
        price: '',
        durationDays: '30',
        featuresText: '',
        isActive: true,
      });
    }
    setShowPkgModal(true);
  };

  const handleSavePackage = async () => {
    const { name, price, durationDays, featuresText, isActive } = pkgForm;
    if (!name || !price || !durationDays) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'warning');
      return;
    }

    const priceNum = parseInt(price, 10);
    const durationNum = parseInt(durationDays, 10);
    if (isNaN(priceNum) || isNaN(durationNum)) {
      showToast('Giá và thời gian sử dụng phải là số', 'warning');
      return;
    }

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name,
      price: priceNum,
      durationDays: durationNum,
      features,
      isActive,
    };

    try {
      if (selectedPkg) {
        await adminVip.updatePackage(selectedPkg.id, payload);
        showToast('Cập nhật gói VIP thành công', 'success');
      } else {
        await adminVip.createPackage(payload);
        showToast('Thêm mới gói VIP thành công', 'success');
      }
      setShowPkgModal(false);
      // Reload
      const pkgs = await adminVip.getPackages();
      setPackages(pkgs);
    } catch (error: any) {
      showToast(error.message || 'Lỗi lưu dữ liệu', 'error');
    }
  };

  const handleDeletePkg = async (id: number) => {
    if (Platform.OS === 'web') {
      if (!confirm('Bạn có chắc chắn muốn xóa gói VIP này?')) return;
    }
    try {
      await adminVip.deletePackage(id);
      showToast('Đã xóa gói VIP thành công', 'success');
      const pkgs = await adminVip.getPackages();
      setPackages(pkgs);
    } catch (error: any) {
      showToast(error.message || 'Lỗi xóa gói', 'error');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Gói VIP & Giao dịch</Text>
        <Text style={styles.subtitle}>
          Cấu hình gói VIP, kiểm tra lịch sử thanh toán và thống kê khách hàng Premium
        </Text>
      </View>

      {/* Tabs Menu */}
      <View style={styles.tabsRow}>
        {(
          [
            { id: 'packages', label: 'Gói VIP Premium', icon: '💎' },
            { id: 'transactions', label: 'Lịch sử giao dịch', icon: '💸' },
            { id: 'usersByPkg', label: 'User theo gói', icon: '👥' },
          ] as const
        ).map((t) => {
          const active = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(t.id);
                setTxPage(1);
              }}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Loader */}
      {loading && activeTab !== 'usersByPkg' ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* TAB 1: VIP Packages */}
          {activeTab === 'packages' && (
            <View style={styles.tabContent}>
              <View style={styles.actionBar}>
                <Text style={styles.sectionTitle}>Danh sách gói VIP ({packages.length})</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleOpenPkgModal(null)}
                >
                  <Text style={styles.addBtnText}>+ Thêm gói mới</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.packagesGrid}>
                {packages.map((pkg) => (
                  <View key={pkg.id} style={styles.pkgCard}>
                    <View style={styles.pkgCardHeader}>
                      <View>
                        <Text style={styles.pkgName}>{pkg.name}</Text>
                        <Text style={styles.pkgDuration}>Hạn dùng: {pkg.durationDays} ngày</Text>
                      </View>
                      <View style={[styles.statusBadge, pkg.isActive ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={pkg.isActive ? styles.badgeActiveText : styles.badgeInactiveText}>
                          {pkg.isActive ? 'Đang bán' : 'Ẩn'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.pkgPrice}>{formatVND(pkg.price)}</Text>

                    <View style={styles.pkgFeaturesList}>
                      <Text style={styles.featuresLabel}>Tính năng đi kèm:</Text>
                      {pkg.features.map((f, i) => (
                        <Text key={i} style={styles.featureItem}>
                          • {f}
                        </Text>
                      ))}
                    </View>

                    <View style={styles.pkgActions}>
                      <TouchableOpacity
                        style={[styles.pkgActionBtn, styles.btnEdit]}
                        onPress={() => handleOpenPkgModal(pkg)}
                      >
                        <Text style={styles.btnEditText}>✏️ Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pkgActionBtn, styles.btnDelete]}
                        onPress={() => handleDeletePkg(pkg.id)}
                      >
                        <Text style={styles.btnDeleteText}>🗑️ Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: Transactions */}
          {activeTab === 'transactions' && (
            <View style={styles.tabContent}>
              {/* Filter */}
              <View style={styles.actionBar}>
                <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
                <View style={styles.filterGroup}>
                  {(['all', 'success', 'pending', 'failed'] as const).map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.filterBadge,
                        txStatusFilter === st && styles.filterBadgeActive,
                      ]}
                      onPress={() => {
                        setTxStatusFilter(st);
                        setTxPage(1);
                      }}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          txStatusFilter === st && styles.filterBadgeActiveText,
                        ]}
                      >
                        {st === 'all'
                          ? 'Tất cả'
                          : st === 'success'
                          ? 'Thành công'
                          : st === 'pending'
                          ? 'Chờ duyệt'
                          : 'Thất bại'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {transactions.length === 0 ? (
                <View style={styles.emptyWrapper}>
                  <Text style={styles.emptyText}>Không tìm thấy giao dịch nào</Text>
                </View>
              ) : Platform.OS === 'web' ? (
                /* Web Table */
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 1.5 }]}>Mã GD</Text>
                    <Text style={[styles.th, { flex: 2.5 }]}>Khách hàng</Text>
                    <Text style={[styles.th, { flex: 2 }]}>Gói VIP</Text>
                    <Text style={[styles.th, { flex: 2 }]}>Số tiền</Text>
                    <Text style={[styles.th, { flex: 1.5 }]}>Ngày giao dịch</Text>
                    <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Trạng thái</Text>
                  </View>

                  {transactions.map((tx) => (
                    <View key={tx.id} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 1.5, fontWeight: '700' }]}>#{tx.id}</Text>
                      <View style={{ flex: 2.5 }}>
                        <Text style={{ fontWeight: '600' }}>{tx.userName}</Text>
                        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{tx.userEmail}</Text>
                      </View>
                      <Text style={[styles.td, { flex: 2, fontWeight: '600' }]}>{tx.packageName}</Text>
                      <Text style={[styles.td, { flex: 2, color: COLORS.primary, fontWeight: 'bold' }]}>
                        {formatVND(tx.amount)}
                      </Text>
                      <Text style={[styles.td, { flex: 1.5 }]}>
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                      <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                        <View
                          style={[
                            styles.statusBadge,
                            tx.status === 'success'
                              ? styles.badgeSuccess
                              : tx.status === 'pending'
                              ? styles.badgeWarning
                              : styles.badgeDanger,
                          ]}
                        >
                          <Text
                            style={
                              tx.status === 'success'
                                ? styles.badgeSuccessText
                                : tx.status === 'pending'
                                ? styles.badgeWarningText
                                : styles.badgeDangerText
                            }
                          >
                            {tx.status === 'success'
                              ? 'Thành công'
                              : tx.status === 'pending'
                              ? 'Chờ duyệt'
                              : 'Thất bại'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* Mobile Cards */
                <View style={styles.mobileList}>
                  {transactions.map((tx) => (
                    <View key={tx.id} style={styles.txCard}>
                      <View style={styles.txCardHeader}>
                        <Text style={styles.txCardId}>Giao dịch #{tx.id}</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            tx.status === 'success'
                              ? styles.badgeSuccess
                              : tx.status === 'pending'
                              ? styles.badgeWarning
                              : styles.badgeDanger,
                          ]}
                        >
                          <Text
                            style={
                              tx.status === 'success'
                                ? styles.badgeSuccessText
                                : tx.status === 'pending'
                                ? styles.badgeWarningText
                                : styles.badgeDangerText
                            }
                          >
                            {tx.status === 'success' ? 'Thành công' : tx.status === 'pending' ? 'Chờ' : 'Lỗi'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.txCardBody}>
                        <Text style={styles.txCardUser}>{tx.userName} ({tx.userEmail})</Text>
                        <Text style={styles.txCardDetails}>
                          Gói: <Text style={{ fontWeight: 'bold' }}>{tx.packageName}</Text>
                        </Text>
                        <Text style={styles.txCardAmount}>{formatVND(tx.amount)}</Text>
                        <Text style={styles.txCardDate}>
                          Ngày: {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Pagination */}
              {txTotalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    style={[styles.pageBtn, txPage === 1 && styles.pageBtnDisabled]}
                    disabled={txPage === 1}
                    onPress={() => setTxPage(txPage - 1)}
                  >
                    <Text style={styles.pageBtnText}>← Trước</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>Trang {txPage} / {txTotalPages}</Text>
                  <TouchableOpacity
                    style={[styles.pageBtn, txPage === txTotalPages && styles.pageBtnDisabled]}
                    disabled={txPage === txTotalPages}
                    onPress={() => setTxPage(txPage + 1)}
                  >
                    <Text style={styles.pageBtnText}>Sau →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: Users by Package */}
          {activeTab === 'usersByPkg' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Lọc người dùng theo gói</Text>

              {/* Package Selectors */}
              <View style={styles.packagePillsRow}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[
                      styles.packagePill,
                      selectedPkgIdForUsers === pkg.id && styles.packagePillActive,
                    ]}
                    onPress={() => setSelectedPkgIdForUsers(pkg.id)}
                  >
                    <Text
                      style={[
                        styles.packagePillText,
                        selectedPkgIdForUsers === pkg.id && styles.packagePillTextActive,
                      ]}
                    >
                      💎 {pkg.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {usersLoading ? (
                <View style={styles.loadingWrapper}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={{ marginTop: 8, color: COLORS.textMuted }}>Đang tải người dùng...</Text>
                </View>
              ) : usersByPkg.length === 0 ? (
                <View style={styles.emptyWrapper}>
                  <Text style={styles.emptyText}>Không có user nào đang kích hoạt gói này</Text>
                </View>
              ) : (
                <View style={styles.tableCard}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 2.5 }]}>Người dùng</Text>
                    <Text style={[styles.th, { flex: 3 }]}>Email</Text>
                    <Text style={[styles.th, { flex: 2.5 }]}>Ngày hết hạn</Text>
                    <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Trạng thái</Text>
                  </View>

                  {usersByPkg.map((user) => {
                    const diff = new Date(user.vipExpiresAt || '').getTime() - Date.now();
                    const expired = diff <= 0;
                    return (
                      <View key={user.id} style={styles.tableRow}>
                        <Text style={[styles.td, { flex: 2.5, fontWeight: '600' }]}>{user.name}</Text>
                        <Text style={[styles.td, { flex: 3, color: COLORS.textMuted }]}>{user.email}</Text>
                        <Text style={[styles.td, { flex: 2.5, color: expired ? COLORS.danger : COLORS.text, fontWeight: '500' }]}>
                          {user.vipExpiresAt
                            ? new Date(user.vipExpiresAt).toLocaleDateString('vi-VN')
                            : '—'}
                          {expired && ' (Hết hạn)'}
                        </Text>
                        <View style={{ flex: 2, alignItems: 'flex-end' }}>
                          <View
                            style={[
                              styles.statusBadge,
                              user.isLocked
                                ? styles.badgeDanger
                                : expired
                                ? styles.badgeInactive
                                : styles.badgeSuccess,
                            ]}
                          >
                            <Text
                              style={
                                user.isLocked
                                  ? styles.badgeDangerText
                                  : expired
                                  ? styles.badgeInactiveText
                                  : styles.badgeSuccessText
                              }
                            >
                              {user.isLocked ? 'Khóa' : expired ? 'Hết hạn' : 'Đang dùng'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </>
      )}

      {/* Package Form Modal */}
      <Modal
        visible={showPkgModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPkgModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPkg ? 'Chỉnh sửa gói VIP' : 'Thêm gói VIP mới'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPkgModal(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 16 }}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên gói VIP *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ví dụ: VIP Premium"
                  value={pkgForm.name}
                  onChangeText={(text) => setPkgForm({ ...pkgForm, name: text })}
                />
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giá bán (VND) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ví dụ: 99000"
                  keyboardType="numeric"
                  value={pkgForm.price}
                  onChangeText={(text) => setPkgForm({ ...pkgForm, price: text })}
                />
              </View>

              {/* Duration */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Thời hạn sử dụng (ngày) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ví dụ: 30"
                  keyboardType="numeric"
                  value={pkgForm.durationDays}
                  onChangeText={(text) => setPkgForm({ ...pkgForm, durationDays: text })}
                />
              </View>

              {/* Features Textarea */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Danh sách tính năng (Mỗi dòng một tính năng)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="AI gợi ý món ăn&#10;Mở khóa tất cả bài tập&#10;Báo cáo phân tích"
                  multiline={true}
                  numberOfLines={4}
                  value={pkgForm.featuresText}
                  onChangeText={(text) => setPkgForm({ ...pkgForm, featuresText: text })}
                />
              </View>

              {/* Active Switch */}
              <View style={styles.switchGroup}>
                <Text style={styles.formLabel}>Cho phép đăng ký gói này</Text>
                <Switch
                  value={pkgForm.isActive}
                  onValueChange={(val) => setPkgForm({ ...pkgForm, isActive: val })}
                  trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
                  thumbColor={pkgForm.isActive ? COLORS.primary : '#94A3B8'}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowPkgModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSavePackage}
              >
                <Text style={styles.modalBtnSaveText}>Lưu gói</Text>
              </TouchableOpacity>
            </View>
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
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 1,
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomColor: 'transparent',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: -1,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  tabContent: {
    gap: 20,
  },
  actionBar: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  pkgCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    minWidth: Platform.OS === 'web' ? 280 : '100%',
    flex: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  pkgCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pkgName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pkgDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pkgPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pkgFeaturesList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 4,
  },
  featuresLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  featureItem: {
    fontSize: 13,
    color: COLORS.text,
  },
  pkgActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  pkgActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEdit: {
    backgroundColor: COLORS.grayLight,
  },
  btnEditText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnDelete: {
    backgroundColor: COLORS.dangerLight,
  },
  btnDeleteText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  /* Transactions Styles */
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBadge: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterBadgeActiveText: {
    color: COLORS.white,
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
  td: {
    fontSize: 14,
    color: COLORS.text,
  },
  badgeSuccess: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeSuccessText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeWarning: {
    backgroundColor: COLORS.warningLight,
  },
  badgeWarningText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeDanger: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeDangerText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: 'bold',
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
  /* Mobile list transactions */
  mobileList: {
    gap: 12,
  },
  txCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
  },
  txCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  txCardId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  txCardBody: {
    gap: 4,
  },
  txCardUser: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  txCardDetails: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  txCardAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 4,
  },
  txCardDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  /* Tab 3 Packages Pill */
  packagePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  packagePill: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packagePillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C084FC',
  },
  packagePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  packagePillTextActive: {
    color: '#7C3AED',
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
    maxWidth: 480,
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
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
