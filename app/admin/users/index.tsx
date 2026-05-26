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
import {
  adminUsers,
  adminVip,
  AdminUser,
  VipPackage,
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

export default function UsersManagement() {
  const { toast, showToast, hideToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [packages, setPackages] = useState<VipPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'free' | 'vip' | 'locked'>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, vip: 0, locked: 0, free: 0 });

  // Grant VIP modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchPackages();
  }, [page, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminUsers.getAll({
        page,
        pageSize: 15,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setUsers(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      showToast(error.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminUsers.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const pkgs = await adminVip.getPackages();
      setPackages(pkgs);
    } catch (error) {
      console.error('Failed to fetch VIP packages:', error);
    }
  };

  const handleToggleLock = async (user: AdminUser) => {
    try {
      const updated = await adminUsers.toggleLock(user.id);
      showToast(
        `${updated.isLocked ? 'Đã khóa' : 'Đã mở khóa'} tài khoản ${updated.name}`,
        'success'
      );
      // Update local state
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleRevokeVip = async (user: AdminUser) => {
    try {
      const updated = await adminUsers.revokeVip(user.id);
      showToast(`Đã thu hồi gói VIP của ${updated.name}`, 'success');
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleOpenGrantModal = (user: AdminUser) => {
    setSelectedUser(user);
    setShowGrantModal(true);
  };

  const handleGrantVip = async (packageId: number) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const updated = await adminUsers.grantVip(selectedUser.id, packageId);
      showToast(`Cấp VIP thành công cho ${updated.name}`, 'success');
      setUsers(users.map((u) => (u.id === selectedUser.id ? updated : u)));
      setShowGrantModal(false);
      setSelectedUser(null);
      fetchStats();
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const daysLeft = (expires: string | null) => {
    if (!expires) return 0;
    const diff = new Date(expires).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  const getVipBadge = (user: AdminUser) => {
    if (!user.vipPackageId || !user.vipExpiresAt) {
      return (
        <View style={[styles.badge, styles.badgeFree]}>
          <Text style={styles.badgeFreeText}>Free</Text>
        </View>
      );
    }

    const remaining = daysLeft(user.vipExpiresAt);
    if (remaining <= 0) {
      return (
        <View style={[styles.badge, styles.badgeExpired]}>
          <Text style={styles.badgeExpiredText}>Hết hạn</Text>
        </View>
      );
    }

    return (
      <View style={[styles.badge, styles.badgeVip]}>
        <Text style={styles.badgeVipText}>💎 {user.vipPackageName}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Người dùng</Text>
        <Text style={styles.subtitle}>Xem danh sách, khóa tài khoản và quản lý gói VIP của khách hàng</Text>
      </View>

      {/* Stats Cards Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.total}</Text>
          <Text style={styles.statLabel}>👥 Tổng User</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
          <Text style={[styles.statVal, { color: COLORS.primary }]}>{stats.vip}</Text>
          <Text style={styles.statLabel}>💎 Đang VIP</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.info }]}>
          <Text style={[styles.statVal, { color: COLORS.info }]}>{stats.free}</Text>
          <Text style={styles.statLabel}>🟢 Free User</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.danger }]}>
          <Text style={[styles.statVal, { color: COLORS.danger }]}>{stats.locked}</Text>
          <Text style={styles.statLabel}>🔒 Bị khóa</Text>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.searchFilterCard}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo email, họ tên..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setPage(1);
            }}
          />
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Trạng thái:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'free', 'vip', 'locked'] as const).map((filter) => {
              const active = statusFilter === filter;
              const label =
                filter === 'all'
                  ? 'Tất cả'
                  : filter === 'free'
                  ? 'Free'
                  : filter === 'vip'
                  ? 'VIP'
                  : 'Bị khóa';
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterBtn, active && styles.filterBtnActive]}
                  onPress={() => {
                    setStatusFilter(filter);
                    setPage(1);
                  }}
                >
                  <Text style={[styles.filterBtnText, active && styles.filterBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Main Listing */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu người dùng...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyText}>Không tìm thấy người dùng phù hợp</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        /* Web Layout Table */
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Họ và Tên</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>Email</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Ngày tạo</Text>
            <Text style={[styles.th, { flex: 2 }]}>Gói VIP</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>VIP còn lại</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Trạng thái</Text>
            <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Hành động</Text>
          </View>

          {users.map((user) => {
            const days = daysLeft(user.vipExpiresAt);
            const isLocked = user.isLocked;

            return (
              <View key={user.id} style={[styles.tableRow, isLocked && styles.rowLocked]}>
                {/* Name */}
                <View style={{ flex: 2 }}>
                  <Text style={styles.userNameText}>{user.name}</Text>
                </View>

                {/* Email */}
                <Text style={[styles.td, { flex: 2.5, color: COLORS.textMuted }]}>
                  {user.email}
                </Text>

                {/* Created At */}
                <Text style={[styles.td, { flex: 1.5 }]}>
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </Text>

                {/* VIP Package */}
                <View style={{ flex: 2 }}>{getVipBadge(user)}</View>

                {/* VIP Days Left */}
                <Text style={[styles.td, { flex: 1.5, fontWeight: '600' }]}>
                  {user.vipPackageId && user.vipExpiresAt
                    ? days > 0
                      ? `${days} ngày`
                      : 'Hết hạn'
                    : '—'}
                </Text>

                {/* Account Lock Status */}
                <View style={{ flex: 1.5 }}>
                  <View style={[styles.badge, isLocked ? styles.badgeLocked : styles.badgeActive]}>
                    <Text style={isLocked ? styles.badgeLockedText : styles.badgeActiveText}>
                      {isLocked ? 'Bị khóa' : 'Hoạt động'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnLock, isLocked && styles.btnUnlock]}
                    onPress={() => handleToggleLock(user)}
                  >
                    <Text style={styles.actionBtnText}>{isLocked ? '🔓 Mở' : '🔒 Khóa'}</Text>
                  </TouchableOpacity>

                  {user.vipPackageId ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.btnRevoke]}
                      onPress={() => handleRevokeVip(user)}
                    >
                      <Text style={styles.actionBtnText}>Revoke ❌</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.btnGrant]}
                      onPress={() => handleOpenGrantModal(user)}
                    >
                      <Text style={styles.actionBtnText}>VIP 💎</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        /* Mobile Layout Cards */
        <View style={styles.mobileList}>
          {users.map((user) => {
            const days = daysLeft(user.vipExpiresAt);
            const isLocked = user.isLocked;

            return (
              <View key={user.id} style={[styles.card, isLocked && styles.cardLocked]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardName}>{user.name}</Text>
                    <Text style={styles.cardEmail}>{user.email}</Text>
                  </View>
                  <View style={[styles.badge, isLocked ? styles.badgeLocked : styles.badgeActive]}>
                    <Text style={isLocked ? styles.badgeLockedText : styles.badgeActiveText}>
                      {isLocked ? 'Khóa' : 'Active'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày đăng ký:</Text>
                    <Text style={styles.infoVal}>
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gói hiện tại:</Text>
                    <View>{getVipBadge(user)}</View>
                  </View>
                  {user.vipPackageId && user.vipExpiresAt && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Hạn dùng VIP:</Text>
                      <Text style={styles.infoVal}>
                        {days > 0 ? `Còn ${days} ngày` : 'Đã hết hạn'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.mobActionBtn, isLocked ? styles.btnUnlock : styles.btnLock]}
                    onPress={() => handleToggleLock(user)}
                  >
                    <Text style={styles.mobActionText}>
                      {isLocked ? '🔓 Mở khóa' : '🔒 Khóa'}
                    </Text>
                  </TouchableOpacity>

                  {user.vipPackageId ? (
                    <TouchableOpacity
                      style={[styles.mobActionBtn, styles.btnRevoke]}
                      onPress={() => handleRevokeVip(user)}
                    >
                      <Text style={styles.mobActionText}>Thu hồi VIP</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.mobActionBtn, styles.btnGrant]}
                      onPress={() => handleOpenGrantModal(user)}
                    >
                      <Text style={styles.mobActionText}>Cấp VIP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
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

          <Text style={styles.pageInfo}>
            Trang {page} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
            disabled={page === totalPages}
            onPress={() => setPage(page + 1)}
          >
            <Text style={styles.pageBtnText}>Sau →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* VIP package grant Modal */}
      <Modal
        visible={showGrantModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGrantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cấp gói VIP dịch vụ</Text>
              <TouchableOpacity
                onPress={() => setShowGrantModal(false)}
                style={styles.closeModalBtn}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalIntro}>
              Chọn gói VIP thích hợp để nâng cấp tài khoản cho{' '}
              <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{selectedUser?.name}</Text>:
            </Text>

            {actionLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Đang lưu thay đổi...</Text>
              </View>
            ) : (
              <View style={styles.packagesList}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={styles.packageCard}
                    onPress={() => handleGrantVip(pkg.id)}
                  >
                    <View style={styles.pkgHeader}>
                      <Text style={styles.pkgName}>💎 {pkg.name}</Text>
                      <Text style={styles.pkgPrice}>
                        {pkg.price.toLocaleString('vi-VN')} đ
                      </Text>
                    </View>
                    <Text style={styles.pkgDuration}>
                      Thời hạn: {pkg.durationDays} ngày
                    </Text>
                    <Text style={styles.pkgFeatures} numberOfLines={2}>
                      {pkg.features.join(' • ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowGrantModal(false)}
            >
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>
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
  searchWrapper: {
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
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  filterScroll: {
    flexDirection: 'row',
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
  rowLocked: {
    backgroundColor: '#FFF5F5',
  },
  td: {
    fontSize: 14,
    color: COLORS.text,
  },
  userNameText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeFree: {
    backgroundColor: COLORS.grayLight,
  },
  badgeFreeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  badgeExpired: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeExpiredText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  badgeVip: {
    backgroundColor: '#F3E8FF',
  },
  badgeVipText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  badgeActive: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeActiveText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  badgeLocked: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeLockedText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnLock: {
    backgroundColor: COLORS.dangerLight,
    color: COLORS.danger,
  },
  btnUnlock: {
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
  },
  btnGrant: {
    backgroundColor: COLORS.primaryLight,
  },
  btnRevoke: {
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
  cardLocked: {
    backgroundColor: '#FFF5F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  mobActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobActionText: {
    fontSize: 13,
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
  modalIntro: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  packagesList: {
    gap: 12,
  },
  packageCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 16,
    backgroundColor: COLORS.bg,
    gap: 6,
  },
  pkgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pkgName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pkgPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pkgDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  pkgFeatures: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});
