import { Platform } from "react-native";

// Khai báo kiểu dữ liệu cho Health Connect để tránh lỗi compile nếu thư viện chưa load hoàn toàn
let HealthConnect: any = null;
try {
  if (Platform.OS === "android") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    HealthConnect = require("react-native-health-connect");
  }
} catch (e) {
  console.warn("Không thể import react-native-health-connect", e);
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true" || Platform.OS !== "android";

// Dữ liệu mock lịch sử bước chân để phát triển và test


function getMockStepsForDate(dateStr: string): number {
  // Sinh số bước chân ngẫu nhiên nhưng ổn định cho mỗi ngày
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 3000 + (hash % 8) * 1250; // Từ 3000 đến 11750 bước
}

export const healthConnectService = {
  /**
   * Kiểm tra xem Health Connect có khả dụng trên thiết bị hay không
   */
  async isAvailable(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
    }

    if (!HealthConnect) {
      return false;
    }

    try {
      const isInit = await HealthConnect.initialize();
      if (!isInit) return false;

      const status = await HealthConnect.getSdkStatus();
      return status === HealthConnect.SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch (error) {
      console.error("Lỗi khi kiểm tra tính khả dụng của Health Connect:", error);
      return false;
    }
  },

  /**
   * Kiểm tra xem đã được cấp quyền đọc bước chân chưa
   */
  async checkStepsPermission(): Promise<boolean> {
    if (USE_MOCK) {
      return true; // Giả lập đã được cấp quyền
    }

    if (!HealthConnect) {
      return false;
    }

    try {
      const granted = await HealthConnect.getGrantedPermissions();
      return granted.some(
        (permission: any) =>
          permission.recordType === "Steps" && permission.accessType === "read"
      );
    } catch (error) {
      console.error("Lỗi kiểm tra quyền Health Connect:", error);
      return false;
    }
  },

  /**
   * Yêu cầu cấp quyền đọc bước chân
   */
  async requestStepsPermission(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
    }

    if (!HealthConnect) {
      return false;
    }

    try {
      const isGranted = await this.checkStepsPermission();
      if (isGranted) return true;

      await HealthConnect.requestPermission([
        {
          recordType: "Steps",
          accessType: "read",
        },
      ]);
      
      // Kiểm tra lại sau khi yêu cầu
      return await this.checkStepsPermission();
    } catch (error) {
      console.error("Lỗi khi yêu cầu quyền Health Connect:", error);
      return false;
    }
  },

  /**
   * Lấy số bước chân ngày hôm nay
   */
  async fetchTodaySteps(): Promise<number> {
    if (USE_MOCK) {
      // Trả về số bước mock dựa trên giờ hiện tại
      const now = new Date();
      const hours = now.getHours();
      // Tăng dần số bước theo thời gian trong ngày
      return Math.round(5500 * (hours / 24) + 1200);
    }

    if (!HealthConnect) {
      return 0;
    }

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const now = new Date();

      const result = await HealthConnect.readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startOfToday.toISOString(),
          endTime: now.toISOString(),
        },
      });

      const records = result?.records || [];
      const totalSteps = records.reduce((sum: number, record: any) => sum + (record.count || 0), 0);
      return totalSteps;
    } catch (error) {
      console.error("Lỗi khi lấy bước chân hôm nay từ Health Connect:", error);
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
    const history: { dateISO: string; steps: number }[] = [];
    
    // Tạo danh sách các ngày trong khoảng
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (USE_MOCK) {
      while (cur <= end) {
        const dateStr = cur.toISOString().slice(0, 10);
        history.push({
          dateISO: dateStr,
          steps: getMockStepsForDate(dateStr),
        });
        cur.setDate(cur.getDate() + 1);
      }
      return history;
    }

    if (!HealthConnect) {
      return [];
    }

    try {
      // Query toàn bộ bản ghi bước chân trong khoảng thời gian
      const result = await HealthConnect.readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: cur.toISOString(),
          endTime: end.toISOString(),
        },
      });

      const records = result?.records || [];
      
      // Gom nhóm và cộng dồn số bước theo ngày ở JS side để tránh lỗi múi giờ native
      const dailyMap: Record<string, number> = {};
      
      // Khởi tạo các ngày bằng 0 bước
      const temp = new Date(cur);
      while (temp <= end) {
        dailyMap[temp.toISOString().slice(0, 10)] = 0;
        temp.setDate(temp.getDate() + 1);
      }

      // Cộng dồn records
      for (const record of records) {
        if (record.startTime) {
          const dateStr = new Date(record.startTime).toISOString().slice(0, 10);
          if (dailyMap[dateStr] !== undefined) {
            dailyMap[dateStr] += record.count || 0;
          }
        }
      }

      // Chuyển đổi về dạng array
      return Object.entries(dailyMap).map(([dateISO, steps]) => ({
        dateISO,
        steps,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử bước chân từ Health Connect:", error);
      // Fallback sang mock nếu bị lỗi native khi query phạm vi dài
      const fallbackHistory: { dateISO: string; steps: number }[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        const dateStr = temp.toISOString().slice(0, 10);
        fallbackHistory.push({
          dateISO: dateStr,
          steps: getMockStepsForDate(dateStr),
        });
        temp.setDate(temp.getDate() + 1);
      }
      return fallbackHistory;
    }
  },
};
