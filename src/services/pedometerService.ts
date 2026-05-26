import { Pedometer } from "expo-sensors";
import { Platform } from "react-native";

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true" || Platform.OS === "web";

function getMockStepsForDate(dateStr: string): number {
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 3000 + (hash % 8) * 1250; // Từ 3000 đến 11750 bước
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const pedometerService = {
  /**
   * Kiểm tra xem Pedometer có khả dụng trên thiết bị hay không
   */
  async isAvailable(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
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
  async checkStepsPermission(): Promise<boolean> {
    if (USE_MOCK) {
      return true;
    }
    try {
      const response = await Pedometer.getPermissionsAsync();
      return response.granted;
    } catch (error) {
      console.error("Lỗi kiểm tra quyền Pedometer:", error);
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
    try {
      const response = await Pedometer.requestPermissionsAsync();
      return response.granted;
    } catch (error) {
      console.error("Lỗi khi yêu cầu quyền Pedometer:", error);
      return false;
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

    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return 0;

      const hasPermission = await this.checkStepsPermission();
      if (!hasPermission) return 0;

      if (Platform.OS === "android") {
        // Pedometer.getStepCountAsync không khả dụng trên Android (cần Health Connect)
        // Khi không dùng mock, trả về 0 để store dùng dữ liệu cộng dồn thời gian thực
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
    const history: { dateISO: string; steps: number }[] = [];
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (USE_MOCK) {
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
      // Trên Android, không lấy được lịch sử từ sensor nên trả về 0, store sẽ tự merge từ stepRecords
      const temp = new Date(cur);
      while (temp <= end) {
        const dateStr = getLocalDateString(temp);
        history.push({
          dateISO: dateStr,
          steps: 0,
        });
        temp.setDate(temp.getDate() + 1);
      }
      return history;
    }

    try {
      const isAvailable = await this.isAvailable();
      const hasPermission = await this.checkStepsPermission();
      if (!isAvailable || !hasPermission) {
        throw new Error("Pedometer not available or permission not granted");
      }

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
      const fallbackHistory: { dateISO: string; steps: number }[] = [];
      const temp = new Date(cur);
      while (temp <= end) {
        const dateStr = getLocalDateString(temp);
        fallbackHistory.push({
          dateISO: dateStr,
          steps: 0,
        });
        temp.setDate(temp.getDate() + 1);
      }
      return fallbackHistory;
    }
  },

  /**
   * Đăng ký theo dõi số bước chân thời gian thực
   */
  watchSteps(callback: (steps: number) => void): { remove: () => void } {
    try {
      return Pedometer.watchStepCount((result) => {
        callback(result.steps);
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký watchStepCount:", error);
      return { remove: () => {} };
    }
  },
};
