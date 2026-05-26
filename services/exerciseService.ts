import { apiClient, publicApiClient } from "./apiClient";
import { API_URLS } from "../constants/api";

export type ExerciseCategory = {
  id: number;
  nameVi: string;
  nameEn: string;
  iconUrl: string | null;
  exercises: Exercise[];
};

export type Exercise = {
  id: string;
  categoryId: number;
  categoryNameVi: string;
  nameVi: string;
  nameEn: string;
  description: string | null;
  metValue: number;
  unit: string;
  iconUrl: string | null;
};

export type CreateExerciseLogRequest = {
  exerciseId: string;
  logDate: string; // "YYYY-MM-DD"
  durationMinutes: number;
  intensity: 1 | 2 | 3; // 1=Nhẹ, 2=Trung bình, 3=Nặng
  notes?: string;
};

export type UpdateExerciseLogRequest = {
  durationMinutes?: number;
  intensity?: 1 | 2 | 3;
  notes?: string;
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  exerciseNameVi: string;
  exerciseNameEn: string;
  logDate: string;
  durationMinutes: number;
  intensity: number;
  caloriesBurned: number;
  notes: string | null;
  createdAt: string;
};

export type DailyExerciseSummary = {
  date: string;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  exerciseCount: number;
  logs: ExerciseLog[];
};

export const exerciseService = {
  /** GET /api/exercises/categories - Lấy danh sách bài tập theo danh mục */
  getCategories: async (): Promise<ExerciseCategory[]> => {
    const response = await publicApiClient.get(API_URLS.exercises.categories);
    return response.data.data;
  },

  /** GET /api/exercises/{id} - Lấy chi tiết bài tập */
  getExerciseById: async (id: string): Promise<Exercise> => {
    const response = await publicApiClient.get(API_URLS.exercises.detail(id));
    return response.data.data;
  },

  /** POST /api/exercises/logs - Tạo nhật ký tập luyện */
  createLog: async (data: CreateExerciseLogRequest): Promise<ExerciseLog> => {
    const response = await apiClient.post(API_URLS.exercises.logs, data);
    return response.data.data;
  },

  /** GET /api/exercises/logs/{id} - Lấy chi tiết nhật ký */
  getLogById: async (id: string): Promise<ExerciseLog> => {
    const response = await apiClient.get(API_URLS.exercises.logDetail(id));
    return response.data.data;
  },

  /** PUT /api/exercises/logs/{id} - Cập nhật nhật ký */
  updateLog: async (id: string, data: UpdateExerciseLogRequest): Promise<ExerciseLog> => {
    const response = await apiClient.put(API_URLS.exercises.logDetail(id), data);
    return response.data.data;
  },

  /** DELETE /api/exercises/logs/{id} - Xóa nhật ký */
  deleteLog: async (id: string): Promise<void> => {
    await apiClient.delete(API_URLS.exercises.logDetail(id));
  },

  /** GET /api/exercises/logs/daily/{date} - Tổng hợp theo ngày */
  getDailySummary: async (date: string): Promise<DailyExerciseSummary> => {
    const response = await apiClient.get(API_URLS.exercises.dailySummary(date));
    return response.data.data;
  },

  /** GET /api/exercises/logs - Lịch sử tập luyện */
  getLogs: async (startDate?: string, endDate?: string): Promise<ExerciseLog[]> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(API_URLS.exercises.logs, { params });
    return response.data.data;
  },
};
