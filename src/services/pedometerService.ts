import { Pedometer } from "expo-sensors";
import { PermissionResponse } from "expo-modules-core";
import { Platform } from "react-native";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true";

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to get standard granted permission response
function grantedPermissionResponse(): PermissionResponse {
  return {
    granted: true,
    status: "granted" as any,
    canAskAgain: true,
    expires: "never",
  };
}

// Helper to generate a date range of 0 steps
function getEmptyHistory(startDate: Date, endDate: Date): { dateISO: string; steps: number }[] {
  const history: { dateISO: string; steps: number }[] = [];
  const temp = new Date(startDate);
  while (temp <= endDate) {
    history.push({
      dateISO: getLocalDateString(temp),
      steps: 0,
    });
    temp.setDate(temp.getDate() + 1);
  }
  return history;
}

// Health Connect Helpers
let isHealthConnectInitialized = false;

async function checkHealthConnectAvailable(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const { getSdkStatus, SdkAvailabilityStatus } = require("react-native-health-connect");
    const status = await getSdkStatus();
    return status === SdkAvailabilityStatus.SDK_AVAILABLE;
  } catch (error) {
    console.warn("Lỗi khi kiểm tra tính khả dụng của Health Connect:", error);
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
    const grantedPermissions = await getGrantedPermissions();
    return grantedPermissions.some(
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

function getMockStepsForDate(dateStr: string): number {
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 3000 + (hash % 8) * 1250; // Từ 3000 đến 11750 bước
}

export const pedometerService = {
  /**
   * Kiểm tra xem Pedometer/Health Connect có khả dụng trên thiết bị hay không
   */
  async isAvailable(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
    }
    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (hcAvailable) return true;
    }
    try {
      return await Pedometer.isAvailableAsync();
    } catch (error) {
      console.error("Lỗi khi kiểm tra tính khả dụng của Pedometer:", error);
      return false;
    }
  },

  /**
   * Kiểm tra xem đã được cấp quyền đọc bước chân chưa
   */
  async checkStepsPermission(): Promise<PermissionResponse> {
    if (USE_MOCK) {
      return grantedPermissionResponse();
    }

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (hcAvailable) {
        const hcGranted = await checkHealthConnectPermission();
        return {
          granted: hcGranted,
          status: hcGranted ? "granted" : "undetermined" as any,
          canAskAgain: true,
          expires: "never",
        };
      }
    }

    try {
      return await Pedometer.getPermissionsAsync();
    } catch (error) {
      console.error("Lỗi kiểm tra quyền Pedometer:", error);
      return {
        granted: false,
        status: "undetermined" as any,
        canAskAgain: true,
        expires: "never",
      };
    }
  },

  /**
   * Yêu cầu cấp quyền đọc bước chân
   */
  async requestStepsPermission(): Promise<PermissionResponse> {
    if (USE_MOCK) {
      return grantedPermissionResponse();
    }

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (hcAvailable) {
        try {
          const hcGranted = await requestHealthConnectPermission();
          return {
            granted: hcGranted,
            status: hcGranted ? "granted" : "denied" as any,
            canAskAgain: true,
            expires: "never",
          };
        } catch (error) {
          console.warn("Lỗi khi yêu cầu quyền Health Connect:", error);
          return {
            granted: false,
            status: "undetermined" as any,
            canAskAgain: true,
            expires: "never",
          };
        }
      }
    }

    try {
      return await Pedometer.requestPermissionsAsync();
    } catch (error) {
      console.error("Lỗi khi yêu cầu quyền Pedometer:", error);
      return {
        granted: false,
        status: "undetermined" as any,
        canAskAgain: true,
        expires: "never",
      };
    }
  },

  /**
   * Lấy số bước chân ngày hôm nay
   */
  async fetchTodaySteps(): Promise<number> {
    if (USE_MOCK) {
      const now = new Date();
      const hours = now.getHours();
      return Math.round(5500 * (hours / 24) + 1200);
    }

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (hcAvailable) {
        const hcGranted = await checkHealthConnectPermission();
        if (hcGranted) {
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
            const total = records.reduce((sum: number, r: any) => sum + (r.count || 0), 0);
            return total;
          } catch (error) {
            console.error("Lỗi khi lấy bước chân hôm nay từ Health Connect:", error);
          }
        }
      }
    }

    try {
      let realAvailable = false;
      try {
        realAvailable = await Pedometer.isAvailableAsync();
      } catch {}

      let realPermission = false;
      try {
        const response = await Pedometer.getPermissionsAsync();
        realPermission = response.granted;
      } catch {}

      if (!realAvailable || !realPermission) {
        return 0;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const now = new Date();

      const result = await Pedometer.getStepCountAsync(startOfToday, now);
      return result ? result.steps : 0;
    } catch (error) {
      console.error("Lỗi khi lấy bước chân hôm nay từ Pedometer:", error);
      return 0;
    }
  },

  /**
   * Lấy lịch sử bước chân trong khoảng ngày
   */
  async fetchStepsHistory(
    startDate: Date,
    endDate: Date
  ): Promise<{ dateISO: string; steps: number }[]> {
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (USE_MOCK) {
      const history: { dateISO: string; steps: number }[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        const dateStr = getLocalDateString(temp);
        history.push({
          dateISO: dateStr,
          steps: getMockStepsForDate(dateStr),
        });
        temp.setDate(temp.getDate() + 1);
      }
      return history;
    }

    if (Platform.OS === "android") {
      const hcAvailable = await checkHealthConnectAvailable();
      if (hcAvailable) {
        const hcGranted = await checkHealthConnectPermission();
        if (hcGranted) {
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

            const stepsMap: Record<string, number> = {};
            records.forEach((record: any) => {
              const recordDate = new Date(record.startTime);
              const dateStr = getLocalDateString(recordDate);
              stepsMap[dateStr] = (stepsMap[dateStr] || 0) + (record.count || 0);
            });

            const history: { dateISO: string; steps: number }[] = [];
            const temp = new Date(cur);
            while (temp <= end) {
              const dateStr = getLocalDateString(temp);
              history.push({
                dateISO: dateStr,
                steps: stepsMap[dateStr] || 0,
              });
              temp.setDate(temp.getDate() + 1);
            }
            return history;
          } catch (error) {
            console.error("Lỗi khi lấy lịch sử bước chân từ Health Connect:", error);
          }
        }
      }
    }

    let realAvailable = false;
    try {
      realAvailable = await Pedometer.isAvailableAsync();
    } catch {}

    let realPermission = false;
    try {
      const response = await Pedometer.getPermissionsAsync();
      realPermission = response.granted;
    } catch {}

    if (!realAvailable || !realPermission) {
      return getEmptyHistory(cur, end);
    }

    try {
      const datesToQuery: Date[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        datesToQuery.push(new Date(temp));
        temp.setDate(temp.getDate() + 1);
      }

      const promises = datesToQuery.map(async (date) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dateStr = getLocalDateString(date);
        try {
          const result = await Pedometer.getStepCountAsync(startOfDay, endOfDay);
          return {
            dateISO: dateStr,
            steps: result ? result.steps : 0,
          };
        } catch (err) {
          console.warn(`Lỗi khi lấy bước chân ngày ${dateStr}:`, err);
          return {
            dateISO: dateStr,
            steps: 0,
          };
        }
      });

      return await Promise.all(promises);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử bước chân từ Pedometer:", error);
      return getEmptyHistory(cur, end);
    }
  },

  /**
   * Đăng ký theo dõi số bước chân thời gian thực
   * - Android: polling Health Connect mỗi 10 giây (HC không có subscribe API)
   * - iOS: dùng Pedometer.watchStepCount
   */
  watchSteps(callback: (steps: number) => void): { remove: () => void } {
    if (USE_MOCK) {
      let currentSteps = 0;
      const interval = setInterval(() => {
        currentSteps += Math.floor(Math.random() * 5) + 1;
        callback(currentSteps);
      }, 5000);
      return {
        remove: () => clearInterval(interval),
      };
    }

    if (Platform.OS === "android") {
      let active = true;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const poll = async () => {
        if (!active) return;
        try {
          const steps = await pedometerService.fetchTodaySteps();
          if (active) callback(steps);
        } catch (error) {
          console.warn("Lỗi khi polling bước chân từ Health Connect:", error);
        }
        if (active) {
          timeoutId = setTimeout(poll, 10000);
        }
      };

      // Gọi ngay lần đầu, sau đó lặp mỗi 10 giây
      poll();

      return {
        remove: () => {
          active = false;
          if (timeoutId !== null) clearTimeout(timeoutId);
        },
      };
    }

    // iOS: dùng Pedometer native
    try {
      return Pedometer.watchStepCount((result) => {
        callback(result.steps);
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký watchStepCount:", error);
      return {
        remove: () => {},
      };
    }
  },
};
