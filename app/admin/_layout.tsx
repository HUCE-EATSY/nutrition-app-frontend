import { Stack, useRouter, useSegments } from 'expo-router';
import {
  View, Text, TouchableOpacity, ScrollView,
  Platform, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/utils/useAdminAuth';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 64;

const COLORS = {
  primary: '#10B981',
  primaryLight: '#D1FAE5',
  sidebar: '#FFFFFF',
  sidebarBorder: '#E5E7EB',
  bg: '#F1F5F9',
  text: '#1E293B',
  textMuted: '#64748B',
  active: '#10B981',
  activeBg: '#ECFDF5',
  hover: '#F8FAFC',
  white: '#FFFFFF',
  danger: '#EF4444',
};

const menuItems = [
  { title: 'Dashboard', icon: '📊', path: '/admin' as const, exact: true },
  { title: 'Người dùng', icon: '👥', path: '/admin/users' as const },
  { title: 'Gói VIP', icon: '💎', path: '/admin/vip' as const },
  { title: 'Thực đơn', icon: '🍽️', path: '/admin/foods' as const },
  { title: 'Tập luyện', icon: '💪', path: '/admin/exercises' as const },
];

export default function AdminLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAdminAuth();

  const onLoginPage = (segments as string[])[1] === 'login';

  // Auth guard — chạy trong useEffect để tránh setState trong render
  useEffect(() => {
    if (isLoading) return; // Chờ check xong mới redirect
    if (!isAuthenticated && !onLoginPage) {
      router.replace('/admin/login');
    } else if (isAuthenticated && onLoginPage) {
      router.replace('/admin');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, onLoginPage]);

  // Loading: chờ kiểm tra token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  // Chưa auth và không phải trang login: render null để đợi useEffect redirect
  if (!isAuthenticated && !onLoginPage) {
    return null;
  }

  // Login page: render Stack thuần (không sidebar)
  if (onLoginPage) {
    return (
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F172A' } }} />
    );
  }

  const currentSeg = '/admin' + (segments.slice(1).join('/') ? '/' + segments.slice(1).join('/') : '');

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) return currentSeg === '/admin';
    return currentSeg.startsWith(item.path);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.root}>
        {/* Sidebar */}
        <View style={[styles.sidebar, { width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }]}>
          {/* Logo */}
          <View style={styles.sidebarHeader}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>D</Text>
            </View>
            {!collapsed && (
              <View>
                <Text style={styles.logoTitle}>DNT Admin</Text>
                <Text style={styles.logoSub}>Nutrition App</Text>
              </View>
            )}
          </View>

          <View style={styles.sidebarDivider} />

          {/* Nav Items */}
          <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
            {!collapsed && <Text style={styles.navGroupLabel}>MENU CHÍNH</Text>}
            {menuItems.map(item => {
              const active = isActive(item);
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.navItem, active && styles.navItemActive, collapsed && styles.navItemCollapsed]}
                  onPress={() => router.push(item.path)}
                >
                  {active && <View style={styles.navActiveBar} />}
                  <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
                  {!collapsed && (
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.title}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sidebarDivider} />

          {/* Footer */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity style={styles.collapseBtn} onPress={() => setCollapsed(!collapsed)}>
              <Text style={styles.collapseBtnText}>{collapsed ? '→' : '←'}</Text>
            </TouchableOpacity>
            {!collapsed && (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                  await logout();
                }}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.bg },
            }}
          />
        </View>
      </View>
    );
  }

  // Mobile: simplified
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.mobileHeader}>
        <Text style={styles.mobileHeaderTitle}>DNT Admin</Text>
        <TouchableOpacity onPress={async () => { await logout(); }}>
          <Text style={{ fontSize: 20 }}>🚪</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mobileNav}>
        {menuItems.map(item => {
          const active = isActive(item);
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.mobileNavItem, active && styles.mobileNavItemActive]}
              onPress={() => router.push(item.path)}
            >
              <Text style={styles.mobileNavIcon}>{item.icon}</Text>
              <Text style={[styles.mobileNavLabel, active && styles.mobileNavLabelActive]}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    gap: 12,
  },
  loadingText: { color: '#94A3B8', fontSize: 14 },
  root: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  sidebar: {
    backgroundColor: COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.sidebarBorder,
    flexDirection: 'column',
    overflow: 'hidden',
  } as any,
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoMarkText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  logoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  logoSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  sidebarDivider: { height: 1, backgroundColor: COLORS.sidebarBorder, marginHorizontal: 16 },
  navList: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },
  navGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2,
    gap: 10,
    position: 'relative',
  } as any,
  navItemActive: { backgroundColor: COLORS.activeBg },
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  navActiveBar: {
    position: 'absolute',
    left: -12,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  navIcon: { fontSize: 18 },
  navIconActive: {},
  navLabel: { fontSize: 14, fontWeight: '500', color: COLORS.textMuted, flex: 1 },
  navLabelActive: { color: COLORS.primary, fontWeight: '600' },
  sidebarFooter: { padding: 16, gap: 8 },
  collapseBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.bg,
  },
  collapseBtnText: { fontSize: 14, color: COLORS.textMuted },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  logoutIcon: { fontSize: 16 },
  logoutText: { fontSize: 13, color: COLORS.danger, fontWeight: '600' },
  mainContent: { flex: 1, overflow: 'hidden' },
  // Mobile
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBorder,
  },
  mobileHeaderTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  mobileNav: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBorder,
    maxHeight: 60,
  },
  mobileNavItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 2,
  },
  mobileNavItemActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  mobileNavIcon: { fontSize: 16 },
  mobileNavLabel: { fontSize: 11, color: COLORS.textMuted },
  mobileNavLabelActive: { color: COLORS.primary, fontWeight: '600' },
});
