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

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

let mockExerciseLogs: ExerciseLog[] = [
  {
    id: "mock-ex-log-1",
    exerciseId: "e1",
    exerciseNameVi: "Chạy bộ",
    exerciseNameEn: "Running",
    logDate: new Date().toISOString().slice(0, 10),
    durationMinutes: 30,
    intensity: 2,
    caloriesBurned: 240,
    notes: "Chạy nhẹ nhàng",
    createdAt: new Date().toISOString(),
  }
];

export const mockExerciseCategories: ExerciseCategory[] = [
  {
    id: 1,
    nameVi: "Cardio",
    nameEn: "Cardio",
    iconUrl: null,
    exercises: [
      { id: "e1", categoryId: 1, categoryNameVi: "Cardio", nameVi: "Chạy bộ", nameEn: "Running", description: "Chạy bộ ngoài trời hoặc máy chạy", metValue: 8.0, unit: "phút", iconUrl: null },
      { id: "e2", categoryId: 1, categoryNameVi: "Cardio", nameVi: "Đạp xe", nameEn: "Cycling", description: "Đạp xe đạp", metValue: 6.0, unit: "phút", iconUrl: null },
      { id: "e3", categoryId: 1, categoryNameVi: "Cardio", nameVi: "Nhảy dây", nameEn: "Jump Rope", description: "Nhảy dây tốc độ trung bình", metValue: 10.0, unit: "phút", iconUrl: null },
    ]
  },
  {
    id: 2,
    nameVi: "Kháng lực",
    nameEn: "Strength",
    iconUrl: null,
    exercises: [
      { id: "e4", categoryId: 2, categoryNameVi: "Kháng lực", nameVi: "Hít đất", nameEn: "Push-ups", description: "Hít đất", metValue: 4.0, unit: "phút", iconUrl: null },
      { id: "e5", categoryId: 2, categoryNameVi: "Kháng lực", nameVi: "Squat", nameEn: "Squats", description: "Gánh đùi", metValue: 5.0, unit: "phút", iconUrl: null },
      { id: "e6", categoryId: 2, categoryNameVi: "Kháng lực", nameVi: "Nâng tạ", nameEn: "Weight Lifting", description: "Tập tạ tự do", metValue: 3.5, unit: "phút", iconUrl: null },
    ]
  }
];

export const exerciseService = {
  /** GET /api/exercises/categories - Lấy danh sách bài tập theo danh mục */
  getCategories: async (): Promise<ExerciseCategory[]> => {
    if (USE_MOCK) {
      return mockExerciseCategories;
    }
    const response = await publicApiClient.get(API_URLS.exercises.categories);
    return response.data.data;
  },

  /** GET /api/exercises/{id} - Lấy chi tiết bài tập */
  getExerciseById: async (id: string): Promise<Exercise> => {
    if (USE_MOCK) {
      for (const cat of mockExerciseCategories) {
        const found = cat.exercises.find(ex => ex.id === id);
        if (found) return found;
      }
      throw new Error("Không tìm thấy bài tập.");
    }
    const response = await publicApiClient.get(API_URLS.exercises.detail(id));
    return response.data.data;
  },

  /** POST /api/exercises/logs - Tạo nhật ký tập luyện */
  createLog: async (data: CreateExerciseLogRequest): Promise<ExerciseLog> => {
    if (USE_MOCK) {
      let exercise: Exercise | undefined;
      for (const cat of mockExerciseCategories) {
        const found = cat.exercises.find(ex => ex.id === data.exerciseId);
        if (found) {
          exercise = found;
          break;
        }
      }
      const newLog: ExerciseLog = {
        id: "mock-ex-log-" + Math.floor(Math.random() * 100000),
        exerciseId: data.exerciseId,
        exerciseNameVi: exercise?.nameVi ?? "Bài tập",
        exerciseNameEn: exercise?.nameEn ?? "Exercise",
        logDate: data.logDate,
        durationMinutes: data.durationMinutes,
        intensity: data.intensity,
        caloriesBurned: Math.round(data.durationMinutes * (exercise?.metValue ?? 5) * 60 * 70 / 200), // Công thức tính calo tiêu thụ đại khái
        notes: data.notes ?? null,
        createdAt: new Date().toISOString(),
      };
      mockExerciseLogs.push(newLog);
      return newLog;
    }
    const response = await publicApiClient.post(API_URLS.exercises.logs, data);
    return response.data.data;
  },

  /** GET /api/exercises/logs/{id} - Lấy chi tiết nhật ký */
  getLogById: async (id: string): Promise<ExerciseLog> => {
    if (USE_MOCK) {
      const found = mockExerciseLogs.find(log => log.id === id);
      if (found) return found;
      throw new Error("Không tìm thấy nhật ký tập luyện.");
    }
    const response = await apiClient.get(API_URLS.exercises.logDetail(id));
    return response.data.data;
  },

  /** PUT /api/exercises/logs/{id} - Cập nhật nhật ký */
  updateLog: async (id: string, data: UpdateExerciseLogRequest): Promise<ExerciseLog> => {
    if (USE_MOCK) {
      const idx = mockExerciseLogs.findIndex(log => log.id === id);
      if (idx !== -1) {
        const log = mockExerciseLogs[idx];
        const updated = {
          ...log,
          durationMinutes: data.durationMinutes ?? log.durationMinutes,
          intensity: data.intensity ?? log.intensity,
          notes: data.notes ?? log.notes,
        };
        mockExerciseLogs[idx] = updated;
        return updated;
      }
      throw new Error("Không tìm thấy nhật ký để cập nhật.");
    }
    const response = await apiClient.put(API_URLS.exercises.logDetail(id), data);
    return response.data.data;
  },

  /** DELETE /api/exercises/logs/{id} - Xóa nhật ký */
  deleteLog: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      mockExerciseLogs = mockExerciseLogs.filter(log => log.id !== id);
      return;
    }
    await apiClient.delete(API_URLS.exercises.logDetail(id));
  },

  /** GET /api/exercises/logs/daily/{date} - Tổng hợp theo ngày */
  getDailySummary: async (date: string): Promise<DailyExerciseSummary> => {
    if (USE_MOCK) {
      const logs = mockExerciseLogs.filter(log => log.logDate === date);
      const totalDuration = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
      const totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
      return {
        date,
        totalDurationMinutes: totalDuration,
        totalCaloriesBurned: totalCalories,
        exerciseCount: logs.length,
        logs,
      };
    }
    const response = await apiClient.get(API_URLS.exercises.dailySummary(date));
    return response.data.data;
  },

  /** GET /api/exercises/logs - Lịch sử tập luyện */
  getLogs: async (startDate?: string, endDate?: string): Promise<ExerciseLog[]> => {
    if (USE_MOCK) {
      return mockExerciseLogs.filter(log =>
        (!startDate || log.logDate >= startDate) &&
        (!endDate || log.logDate <= endDate)
      );
    }
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await apiClient.get(API_URLS.exercises.logs, { params });
    return response.data.data;
  },
};
