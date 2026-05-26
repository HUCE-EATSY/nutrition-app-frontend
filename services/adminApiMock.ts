/**
 * Mock Admin API Service - Frontend-only mock (no backend needed)
 * Includes: Users, Foods, Exercises, VIP Packages, Transactions, Dashboard
 */

import { adminTokenStore } from './adminTokenStore';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  isActive: boolean;    // not locked
  isLocked: boolean;    // account locked by admin
  vipPackageId: number | null;
  vipPackageName: string | null;
  vipExpiresAt: string | null;
  createdAt: string;
}

export interface VipPackage {
  id: number;
  name: string;
  price: number;          // VND
  durationDays: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  packageId: number;
  packageName: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

export interface AdminFood {
  id: number;
  nameVi: string;
  nameEn: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
  isVisible: boolean;
}

export interface AdminExercise {
  id: number;
  nameVi: string;
  nameEn: string;
  category: string;
  metValue: number;           // MET value
  calPerKgPerHour: number;    // kcal/kg/hour = MET * 1.0
  isVisible: boolean;
  imageUrl: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  newUsers7Days: number;
  newUsers30Days: number;
  activeVipUsers: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalFoods: number;
  totalExercises: number;
}

export interface UserGrowthPoint {
  date: string;   // YYYY-MM-DD
  count: number;  // cumulative or daily
}

// ============================================================
// MOCK DATA STORAGE
// ============================================================

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const monthsAgo = (m: number) => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - m);
  return d.toISOString();
};

export let mockVipPackages: VipPackage[] = [
  {
    id: 1,
    name: 'VIP Basic',
    price: 49000,
    durationDays: 30,
    features: ['Theo dõi dinh dưỡng không giới hạn', 'Kế hoạch ăn kiêng', 'Phân tích calo chi tiết'],
    isActive: true,
    createdAt: daysAgo(120),
  },
  {
    id: 2,
    name: 'VIP Pro',
    price: 99000,
    durationDays: 30,
    features: ['Tất cả tính năng Basic', 'Tư vấn dinh dưỡng AI', 'Kế hoạch tập luyện', 'Báo cáo sức khỏe nâng cao'],
    isActive: true,
    createdAt: daysAgo(120),
  },
  {
    id: 3,
    name: 'VIP Annual',
    price: 799000,
    durationDays: 365,
    features: ['Tất cả tính năng Pro', 'Ưu tiên hỗ trợ', 'Truy cập sớm tính năng mới', 'Không quảng cáo'],
    isActive: true,
    createdAt: daysAgo(90),
  },
];

export let mockTransactions: Transaction[] = [
  { id: 1, userId: 2, userName: 'Nguyễn Văn An', userEmail: 'an.nguyen@gmail.com', packageId: 2, packageName: 'VIP Pro', amount: 99000, status: 'success', createdAt: daysAgo(2) },
  { id: 2, userId: 3, userName: 'Trần Thị Bình', userEmail: 'binh.tran@gmail.com', packageId: 1, packageName: 'VIP Basic', amount: 49000, status: 'success', createdAt: daysAgo(5) },
  { id: 3, userId: 5, userName: 'Lê Minh Cường', userEmail: 'cuong.le@gmail.com', packageId: 3, packageName: 'VIP Annual', amount: 799000, status: 'success', createdAt: daysAgo(8) },
  { id: 4, userId: 6, userName: 'Phạm Thị Dung', userEmail: 'dung.pham@gmail.com', packageId: 2, packageName: 'VIP Pro', amount: 99000, status: 'pending', createdAt: daysAgo(1) },
  { id: 5, userId: 7, userName: 'Hoàng Văn Em', userEmail: 'em.hoang@gmail.com', packageId: 1, packageName: 'VIP Basic', amount: 49000, status: 'failed', createdAt: daysAgo(3) },
  { id: 6, userId: 8, userName: 'Ngô Thị Phương', userEmail: 'phuong.ngo@gmail.com', packageId: 2, packageName: 'VIP Pro', amount: 99000, status: 'success', createdAt: daysAgo(35) },
  { id: 7, userId: 9, userName: 'Vũ Đình Giang', userEmail: 'giang.vu@gmail.com', packageId: 3, packageName: 'VIP Annual', amount: 799000, status: 'success', createdAt: daysAgo(40) },
  { id: 8, userId: 10, userName: 'Đặng Thị Hà', userEmail: 'ha.dang@gmail.com', packageId: 1, packageName: 'VIP Basic', amount: 49000, status: 'success', createdAt: daysAgo(38) },
];

export let mockUsers: AdminUser[] = [
  { id: 1, email: 'namdinh', name: 'Admin', isActive: true, isLocked: false, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(180) },
  { id: 2, email: 'an.nguyen@gmail.com', name: 'Nguyễn Văn An', isActive: true, isLocked: false, vipPackageId: 2, vipPackageName: 'VIP Pro', vipExpiresAt: new Date(now.getTime() + 22 * 86400000).toISOString(), createdAt: daysAgo(60) },
  { id: 3, email: 'binh.tran@gmail.com', name: 'Trần Thị Bình', isActive: true, isLocked: false, vipPackageId: 1, vipPackageName: 'VIP Basic', vipExpiresAt: new Date(now.getTime() + 18 * 86400000).toISOString(), createdAt: daysAgo(45) },
  { id: 4, email: 'chi.do@gmail.com', name: 'Đỗ Thị Chi', isActive: true, isLocked: false, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(30) },
  { id: 5, email: 'cuong.le@gmail.com', name: 'Lê Minh Cường', isActive: true, isLocked: false, vipPackageId: 3, vipPackageName: 'VIP Annual', vipExpiresAt: new Date(now.getTime() + 310 * 86400000).toISOString(), createdAt: daysAgo(90) },
  { id: 6, email: 'dung.pham@gmail.com', name: 'Phạm Thị Dung', isActive: true, isLocked: false, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(10) },
  { id: 7, email: 'em.hoang@gmail.com', name: 'Hoàng Văn Em', isActive: true, isLocked: true, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(25) },
  { id: 8, email: 'phuong.ngo@gmail.com', name: 'Ngô Thị Phương', isActive: true, isLocked: false, vipPackageId: 2, vipPackageName: 'VIP Pro', vipExpiresAt: new Date(now.getTime() - 5 * 86400000).toISOString(), createdAt: daysAgo(70) },
  { id: 9, email: 'giang.vu@gmail.com', name: 'Vũ Đình Giang', isActive: true, isLocked: false, vipPackageId: 3, vipPackageName: 'VIP Annual', vipExpiresAt: new Date(now.getTime() + 280 * 86400000).toISOString(), createdAt: daysAgo(50) },
  { id: 10, email: 'ha.dang@gmail.com', name: 'Đặng Thị Hà', isActive: true, isLocked: false, vipPackageId: 1, vipPackageName: 'VIP Basic', vipExpiresAt: new Date(now.getTime() - 2 * 86400000).toISOString(), createdAt: daysAgo(55) },
  { id: 11, email: 'hung.bui@gmail.com', name: 'Bùi Văn Hùng', isActive: true, isLocked: false, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(3) },
  { id: 12, email: 'lan.phan@gmail.com', name: 'Phan Thị Lan', isActive: true, isLocked: false, vipPackageId: null, vipPackageName: null, vipExpiresAt: null, createdAt: daysAgo(6) },
  { id: 13, email: 'minh.tong@gmail.com', name: 'Tống Minh', isActive: true, isLocked: false, vipPackageId: 2, vipPackageName: 'VIP Pro', vipExpiresAt: new Date(now.getTime() + 15 * 86400000).toISOString(), createdAt: daysAgo(20) },
];

export let mockFoods: AdminFood[] = [
  { id: 1, nameVi: 'Cơm trắng', nameEn: 'White Rice', category: 'Tinh bột', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, servingSize: 100, unit: 'g', isVisible: true },
  { id: 2, nameVi: 'Phở bò', nameEn: 'Beef Pho', category: 'Món chính', calories: 350, protein: 15, carbs: 45, fat: 12, servingSize: 1, unit: 'bát', isVisible: true },
  { id: 3, nameVi: 'Bánh mì thịt', nameEn: 'Banh Mi', category: 'Bánh mì', calories: 340, protein: 14, carbs: 38, fat: 14, servingSize: 1, unit: 'ổ', isVisible: true },
  { id: 4, nameVi: 'Gà luộc', nameEn: 'Boiled Chicken', category: 'Thịt', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, unit: 'g', isVisible: true },
  { id: 5, nameVi: 'Rau muống xào', nameEn: 'Stir-fried Morning Glory', category: 'Rau củ', calories: 85, protein: 3, carbs: 8, fat: 4, servingSize: 100, unit: 'g', isVisible: true },
  { id: 6, nameVi: 'Bún bò Huế', nameEn: 'Hue Beef Noodle Soup', category: 'Món chính', calories: 430, protein: 22, carbs: 55, fat: 14, servingSize: 1, unit: 'tô', isVisible: true },
  { id: 7, nameVi: 'Trứng chiên', nameEn: 'Fried Egg', category: 'Trứng & Sữa', calories: 185, protein: 12, carbs: 1, fat: 14, servingSize: 2, unit: 'quả', isVisible: true },
  { id: 8, nameVi: 'Sữa chua không đường', nameEn: 'Plain Yogurt', category: 'Trứng & Sữa', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, servingSize: 100, unit: 'g', isVisible: true },
  { id: 9, nameVi: 'Chuối', nameEn: 'Banana', category: 'Trái cây', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 1, unit: 'quả', isVisible: true },
  { id: 10, nameVi: 'Salad trộn', nameEn: 'Mixed Salad', category: 'Rau củ', calories: 45, protein: 2, carbs: 8, fat: 1, servingSize: 100, unit: 'g', isVisible: false },
  { id: 11, nameVi: 'Cá hồi áp chảo', nameEn: 'Pan-seared Salmon', category: 'Hải sản', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: 100, unit: 'g', isVisible: true },
  { id: 12, nameVi: 'Đậu phụ hấp', nameEn: 'Steamed Tofu', category: 'Đậu & Hạt', calories: 76, protein: 8, carbs: 2, fat: 4, servingSize: 100, unit: 'g', isVisible: true },
];

export let mockExercises: AdminExercise[] = [
  { id: 1, nameVi: 'Chạy bộ (tốc độ vừa)', nameEn: 'Running (moderate)', category: 'Cardio', metValue: 8.0, calPerKgPerHour: 8.0, isVisible: true, imageUrl: null },
  { id: 2, nameVi: 'Đi bộ nhanh', nameEn: 'Brisk Walking', category: 'Cardio', metValue: 3.8, calPerKgPerHour: 3.8, isVisible: true, imageUrl: null },
  { id: 3, nameVi: 'Bơi lội', nameEn: 'Swimming', category: 'Cardio', metValue: 7.0, calPerKgPerHour: 7.0, isVisible: true, imageUrl: null },
  { id: 4, nameVi: 'Đạp xe', nameEn: 'Cycling', category: 'Cardio', metValue: 6.0, calPerKgPerHour: 6.0, isVisible: true, imageUrl: null },
  { id: 5, nameVi: 'Yoga', nameEn: 'Yoga', category: 'Linh hoạt', metValue: 2.5, calPerKgPerHour: 2.5, isVisible: true, imageUrl: null },
  { id: 6, nameVi: 'Gym (luyện tạ)', nameEn: 'Weight Training', category: 'Sức mạnh', metValue: 5.0, calPerKgPerHour: 5.0, isVisible: true, imageUrl: null },
  { id: 7, nameVi: 'Aerobic', nameEn: 'Aerobics', category: 'Cardio', metValue: 6.5, calPerKgPerHour: 6.5, isVisible: true, imageUrl: null },
  { id: 8, nameVi: 'Nhảy dây', nameEn: 'Jump Rope', category: 'Cardio', metValue: 10.0, calPerKgPerHour: 10.0, isVisible: true, imageUrl: null },
  { id: 9, nameVi: 'Bóng đá', nameEn: 'Football', category: 'Thể thao', metValue: 7.0, calPerKgPerHour: 7.0, isVisible: false, imageUrl: null },
  { id: 10, nameVi: 'Cầu lông', nameEn: 'Badminton', category: 'Thể thao', metValue: 5.5, calPerKgPerHour: 5.5, isVisible: true, imageUrl: null },
  { id: 11, nameVi: 'Bóng rổ', nameEn: 'Basketball', category: 'Thể thao', metValue: 6.5, calPerKgPerHour: 6.5, isVisible: true, imageUrl: null },
  { id: 12, nameVi: 'Thiền', nameEn: 'Meditation', category: 'Linh hoạt', metValue: 1.5, calPerKgPerHour: 1.5, isVisible: false, imageUrl: null },
];

let nextUserId = 14;
let nextVipPackageId = 4;
let nextTransactionId = 9;
let nextFoodId = 13;
let nextExerciseId = 13;

// ============================================================
// HELPERS
// ============================================================

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

function paginate<T>(data: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  };
}

// ============================================================
// ADMIN AUTH
// ============================================================

export const adminAuth = {
  login: async (email: string, password: string) => {
    await delay(600);
    if (email === 'namdinh' && password === '123') {
      const token = 'mock-admin-token-' + Date.now();
      // Lưu token vào in-memory store
      adminTokenStore.setToken(token);
      const userInfo = { id: '1', email: 'namdinh', nickname: 'Admin', role: 'admin' as const };
      return { token, user: userInfo };
    }
    const err: any = new Error('Sai tài khoản hoặc mật khẩu');
    err.response = { data: { message: 'Sai tài khoản hoặc mật khẩu' } };
    throw err;
  },

  logout: async () => {
    adminTokenStore.clearToken();
    return { success: true };
  },
};

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const adminDashboard = {
  getStats: async (): Promise<DashboardStats> => {
    await delay();
    const now = new Date();
    const day7 = new Date(now.getTime() - 7 * 86400000);
    const day30 = new Date(now.getTime() - 30 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const newUsers7 = mockUsers.filter(u => new Date(u.createdAt) >= day7).length;
    const newUsers30 = mockUsers.filter(u => new Date(u.createdAt) >= day30).length;
    const activeVip = mockUsers.filter(u => u.vipPackageId && u.vipExpiresAt && new Date(u.vipExpiresAt) > now).length;

    const revenueThis = mockTransactions
      .filter(t => t.status === 'success' && new Date(t.createdAt) >= monthStart)
      .reduce((s, t) => s + t.amount, 0);
    const revenueLast = mockTransactions
      .filter(t => t.status === 'success' && new Date(t.createdAt) >= lastMonthStart && new Date(t.createdAt) <= lastMonthEnd)
      .reduce((s, t) => s + t.amount, 0);

    return {
      totalUsers: mockUsers.length,
      newUsers7Days: newUsers7,
      newUsers30Days: newUsers30,
      activeVipUsers: activeVip,
      revenueThisMonth: revenueThis,
      revenueLastMonth: revenueLast,
      totalFoods: mockFoods.length,
      totalExercises: mockExercises.length,
    };
  },

  getUserGrowth: async (): Promise<UserGrowthPoint[]> => {
    await delay();
    // Generate 30-day cumulative user data
    const points: UserGrowthPoint[] = [];
    const now = new Date();
    let base = 3; // users before our window
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const newOnDay = mockUsers.filter(u => {
        const cd = new Date(u.createdAt).toISOString().split('T')[0];
        return cd === dateStr;
      }).length;
      base += newOnDay;
      points.push({ date: dateStr, count: base });
    }
    return points;
  },
};

// ============================================================
// ADMIN USERS
// ============================================================

export const adminUsers = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string; status?: string }) => {
    await delay();
    let filtered = [...mockUsers];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(u => u.email.toLowerCase().includes(s) || u.name.toLowerCase().includes(s));
    }
    if (params?.status === 'free') filtered = filtered.filter(u => !u.vipPackageId);
    else if (params?.status === 'vip') filtered = filtered.filter(u => !!u.vipPackageId);
    else if (params?.status === 'locked') filtered = filtered.filter(u => u.isLocked);
    return paginate(filtered, params?.page || 1, params?.pageSize || 20);
  },

  getById: async (id: number) => {
    await delay();
    const user = mockUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },

  toggleLock: async (id: number) => {
    await delay();
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    mockUsers[idx].isLocked = !mockUsers[idx].isLocked;
    return mockUsers[idx];
  },

  grantVip: async (userId: number, packageId: number) => {
    await delay();
    const uIdx = mockUsers.findIndex(u => u.id === userId);
    const pkg = mockVipPackages.find(p => p.id === packageId);
    if (uIdx === -1 || !pkg) throw new Error('Not found');
    const expires = new Date(Date.now() + pkg.durationDays * 86400000);
    mockUsers[uIdx].vipPackageId = packageId;
    mockUsers[uIdx].vipPackageName = pkg.name;
    mockUsers[uIdx].vipExpiresAt = expires.toISOString();

    mockTransactions.push({
      id: nextTransactionId++,
      userId,
      userName: mockUsers[uIdx].name,
      userEmail: mockUsers[uIdx].email,
      packageId,
      packageName: pkg.name,
      amount: pkg.price,
      status: 'success',
      createdAt: new Date().toISOString(),
    });

    return mockUsers[uIdx];
  },

  revokeVip: async (userId: number) => {
    await delay();
    const idx = mockUsers.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    mockUsers[idx].vipPackageId = null;
    mockUsers[idx].vipPackageName = null;
    mockUsers[idx].vipExpiresAt = null;
    return mockUsers[idx];
  },

  getStats: async () => {
    await delay();
    const now = new Date();
    return {
      total: mockUsers.length,
      vip: mockUsers.filter(u => u.vipPackageId && u.vipExpiresAt && new Date(u.vipExpiresAt) > now).length,
      locked: mockUsers.filter(u => u.isLocked).length,
      free: mockUsers.filter(u => !u.vipPackageId).length,
    };
  },
};

// ============================================================
// VIP PACKAGES
// ============================================================

export const adminVip = {
  getPackages: async () => {
    await delay();
    return [...mockVipPackages];
  },

  createPackage: async (data: Omit<VipPackage, 'id' | 'createdAt'>) => {
    await delay();
    const pkg: VipPackage = { ...data, id: nextVipPackageId++, createdAt: new Date().toISOString() };
    mockVipPackages.push(pkg);
    return pkg;
  },

  updatePackage: async (id: number, data: Partial<VipPackage>) => {
    await delay();
    const idx = mockVipPackages.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Package not found');
    mockVipPackages[idx] = { ...mockVipPackages[idx], ...data };
    return mockVipPackages[idx];
  },

  deletePackage: async (id: number) => {
    await delay();
    const idx = mockVipPackages.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Package not found');
    mockVipPackages.splice(idx, 1);
    return { success: true };
  },

  getTransactions: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    await delay();
    let filtered = [...mockTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(t => t.status === params.status);
    }
    return paginate(filtered, params?.page || 1, params?.pageSize || 20);
  },

  getUsersByPackage: async (packageId: number) => {
    await delay();
    return mockUsers.filter(u => u.vipPackageId === packageId);
  },
};

// ============================================================
// ADMIN FOODS
// ============================================================

export const adminFoods = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string; category?: string; visibility?: string }) => {
    await delay();
    let filtered = [...mockFoods];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(f => f.nameVi.toLowerCase().includes(s) || f.nameEn.toLowerCase().includes(s));
    }
    if (params?.category && params.category !== 'all') filtered = filtered.filter(f => f.category === params.category);
    if (params?.visibility === 'visible') filtered = filtered.filter(f => f.isVisible);
    else if (params?.visibility === 'hidden') filtered = filtered.filter(f => !f.isVisible);
    return paginate(filtered, params?.page || 1, params?.pageSize || 20);
  },

  getCategories: async () => {
    await delay(100);
    return [...new Set(mockFoods.map(f => f.category))];
  },

  create: async (data: Omit<AdminFood, 'id'>) => {
    await delay();
    const food: AdminFood = { ...data, id: nextFoodId++ };
    mockFoods.push(food);
    return food;
  },

  update: async (id: number, data: Partial<AdminFood>) => {
    await delay();
    const idx = mockFoods.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Food not found');
    mockFoods[idx] = { ...mockFoods[idx], ...data };
    return mockFoods[idx];
  },

  delete: async (id: number) => {
    await delay();
    const idx = mockFoods.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Food not found');
    mockFoods.splice(idx, 1);
    return { success: true };
  },

  toggleVisibility: async (id: number) => {
    await delay();
    const idx = mockFoods.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Food not found');
    mockFoods[idx].isVisible = !mockFoods[idx].isVisible;
    return mockFoods[idx];
  },

  importCsv: async (csvData: string) => {
    await delay(1000);
    const lines = csvData.trim().split('\n').slice(1);
    let imported = 0;
    for (const line of lines) {
      const [nameVi, nameEn, category, calories, protein, carbs, fat, servingSize, unit] = line.split(',').map(s => s.trim());
      if (nameVi && calories) {
        mockFoods.push({
          id: nextFoodId++,
          nameVi,
          nameEn: nameEn || '',
          category: category || 'Khác',
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
          servingSize: parseFloat(servingSize) || 100,
          unit: unit || 'g',
          isVisible: true,
        });
        imported++;
      }
    }
    return { imported };
  },

  getStats: async () => {
    await delay();
    return {
      total: mockFoods.length,
      visible: mockFoods.filter(f => f.isVisible).length,
      hidden: mockFoods.filter(f => !f.isVisible).length,
      categories: [...new Set(mockFoods.map(f => f.category))].length,
    };
  },
};

// ============================================================
// ADMIN EXERCISES
// ============================================================

export const adminExercises = {
  getAll: async (params?: { page?: number; pageSize?: number; search?: string; category?: string; visibility?: string }) => {
    await delay();
    let filtered = [...mockExercises];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(e => e.nameVi.toLowerCase().includes(s) || e.nameEn.toLowerCase().includes(s));
    }
    if (params?.category && params.category !== 'all') filtered = filtered.filter(e => e.category === params.category);
    if (params?.visibility === 'visible') filtered = filtered.filter(e => e.isVisible);
    else if (params?.visibility === 'hidden') filtered = filtered.filter(e => !e.isVisible);
    return paginate(filtered, params?.page || 1, params?.pageSize || 20);
  },

  getCategories: async () => {
    await delay(100);
    return [...new Set(mockExercises.map(e => e.category))];
  },

  create: async (data: Omit<AdminExercise, 'id'>) => {
    await delay();
    const ex: AdminExercise = { ...data, id: nextExerciseId++, calPerKgPerHour: data.metValue };
    mockExercises.push(ex);
    return ex;
  },

  update: async (id: number, data: Partial<AdminExercise>) => {
    await delay();
    const idx = mockExercises.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exercise not found');
    if (data.metValue) data.calPerKgPerHour = data.metValue;
    mockExercises[idx] = { ...mockExercises[idx], ...data };
    return mockExercises[idx];
  },

  delete: async (id: number) => {
    await delay();
    const idx = mockExercises.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exercise not found');
    mockExercises.splice(idx, 1);
    return { success: true };
  },

  toggleVisibility: async (id: number) => {
    await delay();
    const idx = mockExercises.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Exercise not found');
    mockExercises[idx].isVisible = !mockExercises[idx].isVisible;
    return mockExercises[idx];
  },

  getStats: async () => {
    await delay();
    return {
      total: mockExercises.length,
      visible: mockExercises.filter(e => e.isVisible).length,
      categories: [...new Set(mockExercises.map(e => e.category))].length,
    };
  },
};
