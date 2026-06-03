import { Pedometer } from "expo-sensors";
import { PermissionResponse } from "expo-modules-core";
import { Platform } from "react-native";

// Expo Pedometer v54.0.0 – expo-sensors
// Docs: https://docs.expo.dev/versions/v54.0.0/sdk/pedometer/
//
// Lưu ý quan trọng từ tài liệu:
//  - Pedometer.getStepCountAsync()  → CHỈ HỖ TRỢ iOS (không chạy trên Android)
//  - Pedometer.watchStepCount()     → KHÔNG hoạt động khi app ở background
//  - iOS: chỉ lưu dữ liệu 7 ngày gần nhất (giới hạn Apple Core Motion)
//  - Android: dùng Health Connect API thay thế (react-native-health-connect)

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Trả về chuỗi ngày dạng YYYY-MM-DD theo giờ địa phương */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Trả về PermissionResponse với trạng thái "granted" */
function grantedPermissionResponse(): PermissionResponse {
  return {
    granted: true,
    status: "granted" as any,
    canAskAgain: true,
    expires: "never",
  };
}

/** Tạo mảng lịch sử trống (0 bước) cho khoảng ngày */
function getEmptyHistory(
  startDate: Date,
  endDate: Date
): { dateISO: string; steps: number }[] {
  const history: { dateISO: string; steps: number }[] = [];
  const temp = new Date(startDate);
  while (temp <= endDate) {
    history.push({ dateISO: getLocalDateString(temp), steps: 0 });
    temp.setDate(temp.getDate() + 1);
  }
  return history;
}

// ─── Health Connect (Android only) ───────────────────────────────────────────

let isHealthConnectInitialized = false;

async function checkHealthConnectAvailable(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const { getSdkStatus, SdkAvailabilityStatus } = require("react-native-health-connect");
    const status = await getSdkStatus();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  } catch (error) {
    console.warn("Lỗi khi kiểm tra Health Connect:", error);
    return false;
  }
}

async function initHealthConnect(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (isHealthConnectInitialized) return true;
  try {
    const isAvailable = await checkHealthConnectAvailable();
    if (!isAvailable) return false;
    const { initialize } = require("react-native-health-connect");
    isHealthConnectInitialized = await initialize();
    return isHealthConnectInitialized;
  } catch (error) {
    console.warn("Lỗi khi khởi tạo Health Connect:", error);
    return false;
  }
}

async function checkHealthConnectPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const initialized = await initHealthConnect();
    if (!initialized) return false;
    const { getGrantedPermissions } = require("react-native-health-connect");
    const granted = await getGrantedPermissions();
    return granted.some(
      (p: any) => p.recordType === "Steps" && p.accessType === "read"
    );
  } catch (error) {
    console.warn("Lỗi khi kiểm tra quyền Health Connect:", error);
    return false;
  }
}

async function requestHealthConnectPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const initialized = await initHealthConnect();
    if (!initialized) return false;
    const { requestPermission } = require("react-native-health-connect");
    const result = await requestPermission([
      { accessType: "read", recordType: "Steps" },
    ]);
    return result.some(
      (p: any) => p.recordType === "Steps" && p.accessType === "read"
    );
  } catch (error) {
    console.warn("Lỗi khi yêu cầu quyền Health Connect:", error);
    return false;
  }
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockStepsForDate(dateStr: string): number {
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 3000 + (hash % 8) * 1250; // 3000 – 11750 bước
}

// ─── pedometerService ─────────────────────────────────────────────────────────

export const pedometerService = {
  /**
   * Kiểm tra xem cảm biến bước chân có khả dụng trên thiết bị không.
   *
   * Android : ưu tiên Health Connect; nếu không có HC thì trả false.
   * iOS     : Pedometer.isAvailableAsync() — từ tài liệu Expo v54.
   */
  async isAvailable(): Promise<boolean> {
    if (USE_MOCK) return true;

    if (Platform.OS === "android") {
      return checkHealthConnectAvailable();
    }

    // iOS – Pedometer.isAvailableAsync() (Android, iOS)
    try {
      return await Pedometer.isAvailableAsync();
    } catch (error) {
      console.error("Lỗi Pedometer.isAvailableAsync():", error);
      return false;
    }
  },

  /**
   * Kiểm tra quyền đọc bước chân đã được cấp chưa.
   *
   * Android : kiểm tra quyền Health Connect.
   * iOS     : Pedometer.getPermissionsAsync() — từ tài liệu Expo v54.
   *
   * PermissionResponse: { granted, status, canAskAgain, expires }
   */
  async checkStepsPermission(): Promise<PermissionResponse> {
    if (USE_MOCK) return grantedPermissionResponse();

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (!hcAvailable) {
        return { granted: false, status: "undetermined" as any, canAskAgain: true, expires: "never" };
      }
      const hcGranted = await checkHealthConnectPermission();
      return {
        granted: hcGranted,
        status: hcGranted ? "granted" : ("undetermined" as any),
        canAskAgain: true,
        expires: "never",
      };
    }

    // iOS – Pedometer.getPermissionsAsync() (Android, iOS)
    try {
      return await Pedometer.getPermissionsAsync();
    } catch (error) {
      console.error("Lỗi Pedometer.getPermissionsAsync():", error);
      return { granted: false, status: "undetermined" as any, canAskAgain: true, expires: "never" };
    }
  },

  /**
   * Yêu cầu người dùng cấp quyền đọc bước chân.
   *
   * Android : yêu cầu quyền Health Connect.
   * iOS     : Pedometer.requestPermissionsAsync() — từ tài liệu Expo v54.
   *
   * Khi canAskAgain = false, cần hướng dẫn người dùng vào Settings.
   */
  async requestStepsPermission(): Promise<PermissionResponse> {
    if (USE_MOCK) return grantedPermissionResponse();

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (!hcAvailable) {
        return { granted: false, status: "undetermined" as any, canAskAgain: true, expires: "never" };
      }
      try {
        const hcGranted = await requestHealthConnectPermission();
        return {
          granted: hcGranted,
          status: hcGranted ? "granted" : ("denied" as any),
          canAskAgain: true,
          expires: "never",
        };
      } catch (error) {
        console.warn("Lỗi khi yêu cầu quyền Health Connect:", error);
        return { granted: false, status: "undetermined" as any, canAskAgain: true, expires: "never" };
      }
    }

    // iOS – Pedometer.requestPermissionsAsync() (Android, iOS)
    try {
      return await Pedometer.requestPermissionsAsync();
    } catch (error) {
      console.error("Lỗi Pedometer.requestPermissionsAsync():", error);
      return { granted: false, status: "undetermined" as any, canAskAgain: true, expires: "never" };
    }
  },

  /**
   * Lấy tổng số bước chân từ đầu ngày hôm nay đến hiện tại.
   *
   * Android : đọc từ Health Connect (readRecords "Steps").
   *           Nếu HC không khả dụng hoặc chưa cấp quyền → trả về 0.
   *
   * iOS     : Pedometer.getStepCountAsync(startOfToday, now)
   *           Lưu ý: getStepCountAsync() CHỈ HỖ TRỢ iOS (tài liệu Expo v54).
   *           Chỉ lưu dữ liệu 7 ngày gần nhất (giới hạn Apple Core Motion).
   */
  async fetchTodaySteps(): Promise<number> {
    if (USE_MOCK) {
      const hours = new Date().getHours();
      return Math.round(5500 * (hours / 24) + 1200);
    }

    // ── Android: Health Connect ──────────────────────────────────────────────
    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (!hcAvailable) return 0;

      const hcGranted = await checkHealthConnectPermission();
      if (!hcGranted) return 0;

      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const now = new Date();

        const { readRecords } = require("react-native-health-connect");
        const result = await readRecords("Steps", {
          timeRangeFilter: {
            operator: "between",
            startTime: startOfToday.toISOString(),
            endTime: now.toISOString(),
          },
        });
        const records = result.records || [];
        return records.reduce((sum: number, r: any) => sum + (r.count || 0), 0);
      } catch (error) {
        console.error("Lỗi readRecords Steps (HC) hôm nay:", error);
        return 0;
      }
    }

    // ── iOS: Pedometer.getStepCountAsync() ──────────────────────────────────
    // Docs: "Supported platforms: iOS" — https://docs.expo.dev/versions/v54.0.0/sdk/pedometer/
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return 0;

      const permission = await Pedometer.getPermissionsAsync();
      if (!permission.granted) return 0;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const now = new Date();

      // PedometerResult: { steps: number }
      const result = await Pedometer.getStepCountAsync(startOfToday, now);
      return result ? result.steps : 0;
    } catch (error) {
      console.error("Lỗi Pedometer.getStepCountAsync() hôm nay:", error);
      return 0;
    }
  },

  /**
   * Lấy lịch sử bước chân trong khoảng ngày.
   *
   * Android : đọc toàn bộ khoảng từ Health Connect, gom nhóm theo ngày.
   *           Nếu HC không khả dụng hoặc chưa cấp quyền → trả mảng 0 bước.
   *
   * iOS     : Pedometer.getStepCountAsync() cho từng ngày song song.
   *           getStepCountAsync() CHỈ HỖ TRỢ iOS (tài liệu Expo v54).
   *           Chỉ có dữ liệu 7 ngày gần nhất; dữ liệu cũ hơn trả về 0.
   */
  async fetchStepsHistory(
    startDate: Date,
    endDate: Date
  ): Promise<{ dateISO: string; steps: number }[]> {
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // ── Mock ────────────────────────────────────────────────────────────────
    if (USE_MOCK) {
      const history: { dateISO: string; steps: number }[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        const dateStr = getLocalDateString(temp);
        history.push({ dateISO: dateStr, steps: getMockStepsForDate(dateStr) });
        temp.setDate(temp.getDate() + 1);
      }
      return history;
    }

    // ── Android: Health Connect ──────────────────────────────────────────────
    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (!hcAvailable) return getEmptyHistory(cur, end);

      const hcGranted = await checkHealthConnectPermission();
      if (!hcGranted) return getEmptyHistory(cur, end);

      try {
        const { readRecords } = require("react-native-health-connect");
        const result = await readRecords("Steps", {
          timeRangeFilter: {
            operator: "between",
            startTime: cur.toISOString(),
            endTime: end.toISOString(),
          },
        });
        const records = result.records || [];

        // Gom nhóm theo ngày
        const stepsMap: Record<string, number> = {};
        records.forEach((record: any) => {
          const dateStr = getLocalDateString(new Date(record.startTime));
          stepsMap[dateStr] = (stepsMap[dateStr] || 0) + (record.count || 0);
        });

        const history: { dateISO: string; steps: number }[] = [];
        const temp = new Date(cur);
        while (temp <= end) {
          const dateStr = getLocalDateString(temp);
          history.push({ dateISO: dateStr, steps: stepsMap[dateStr] || 0 });
          temp.setDate(temp.getDate() + 1);
        }
        return history;
      } catch (error) {
        console.error("Lỗi readRecords Steps (HC) lịch sử:", error);
        return getEmptyHistory(cur, end);
      }
    }

    // ── iOS: Pedometer.getStepCountAsync() mỗi ngày ─────────────────────────
    // Docs: "Supported platforms: iOS" — https://docs.expo.dev/versions/v54.0.0/sdk/pedometer/
    // Apple lưu tối đa 7 ngày; ngày cũ hơn sẽ trả về 0 bước (không báo lỗi).
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) return getEmptyHistory(cur, end);

      const permission = await Pedometer.getPermissionsAsync();
      if (!permission.granted) return getEmptyHistory(cur, end);

      // Tạo danh sách ngày cần truy vấn
      const datesToQuery: Date[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        datesToQuery.push(new Date(temp));
        temp.setDate(temp.getDate() + 1);
      }

      // Truy vấn song song từng ngày – PedometerResult: { steps: number }
      const results = await Promise.all(
        datesToQuery.map(async (date) => {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          const dateStr = getLocalDateString(date);
          try {
            const result = await Pedometer.getStepCountAsync(startOfDay, endOfDay);
            return { dateISO: dateStr, steps: result ? result.steps : 0 };
          } catch (err) {
            console.warn(`Lỗi getStepCountAsync ngày ${dateStr}:`, err);
            return { dateISO: dateStr, steps: 0 };
          }
        })
      );
      return results;
    } catch (error) {
      console.error("Lỗi fetchStepsHistory (iOS):", error);
      return getEmptyHistory(cur, end);
    }
  },

  /**
   * Đăng ký nhận cập nhật bước chân theo thời gian thực.
   *
   * Android : HC không có subscribe API → polling mỗi 10 giây.
   *           (Tài liệu Expo v54: "use another solution based on Health Connect API")
   *
   * iOS     : Pedometer.watchStepCount(callback) → EventSubscription
   *           Trả về Subscription với method remove() để hủy đăng ký.
   *
   * QUAN TRỌNG: watchStepCount() KHÔNG hoạt động khi app ở background
   * (tài liệu Expo v54). Dùng AppState để dừng/tiếp tục tracking.
   */
  watchSteps(callback: (steps: number) => void): { remove: () => void } {
    // ── Mock ────────────────────────────────────────────────────────────────
    if (USE_MOCK) {
      let currentSteps = 0;
      const interval = setInterval(() => {
        currentSteps += Math.floor(Math.random() * 5) + 1;
        callback(currentSteps);
      }, 5000);
      return { remove: () => clearInterval(interval) };
    }

    // ── Android: polling Health Connect mỗi 10 giây ─────────────────────────
    // Docs: "Pedometer updates will not be delivered while the app is in the background.
    //        As an alternative, on Android, use another solution based on Health Connect API."
    if (Platform.OS === "android") {
      let active = true;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const poll = async () => {
        if (!active) return;
        try {
          const steps = await pedometerService.fetchTodaySteps();
          if (active) callback(steps);
        } catch (error) {
          console.warn("Lỗi polling bước chân (HC):", error);
        }
        if (active) {
          timeoutId = setTimeout(poll, 10000);
        }
      };

      poll(); // gọi ngay lần đầu

      return {
        remove: () => {
          active = false;
          if (timeoutId !== null) clearTimeout(timeoutId);
        },
      };
    }

    // ── iOS: Pedometer.watchStepCount(callback) ──────────────────────────────
    // Docs: "Supported platforms: Android, iOS"
    // Returns: EventSubscription — gọi .remove() để hủy đăng ký
    // callback nhận PedometerResult: { steps: number }
    try {
      return Pedometer.watchStepCount((result) => {
        callback(result.steps);
      });
    } catch (error) {
      console.error("Lỗi Pedometer.watchStepCount():", error);
      return { remove: () => {} };
    }
  },
};
