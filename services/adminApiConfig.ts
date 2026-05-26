/**
 * Admin API Configuration
 * 
 * Đổi USE_MOCK_API = true để test với mock data
 * Đổi USE_MOCK_API = false để connect với Backend thật
 */

import * as mockApi from './adminApiMock';
import * as realApi from './adminApi';

export const USE_MOCK_API = true; // ⬅️ THAY ĐỔI Ở ĐÂY

// Conditional API export
export const adminAuth = USE_MOCK_API ? mockApi.adminAuth : realApi.adminAuth;
export const adminDashboard = USE_MOCK_API ? mockApi.adminDashboard : realApi.adminDashboard;
export const adminUsers = USE_MOCK_API ? mockApi.adminUsers : realApi.adminUsers;
export const adminVip = USE_MOCK_API ? mockApi.adminVip : (realApi as any).adminVip;
export const adminFoods = USE_MOCK_API ? mockApi.adminFoods : realApi.adminFoods;
export const adminExercises = USE_MOCK_API ? mockApi.adminExercises : realApi.adminExercises;

// Export all types/interfaces from mockApi since it has a superset of types needed for the frontend.
export type {
  AdminUser,
  VipPackage,
  Transaction,
  AdminFood,
  AdminExercise,
  DashboardStats,
  UserGrowthPoint,
} from './adminApiMock';
