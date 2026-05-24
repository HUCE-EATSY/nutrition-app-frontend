import { format, parseISO, differenceInYears, addDays as addDaysFns, formatISO } from "date-fns";
import { vi } from "date-fns/locale";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function formatShortDate(dateISO: string) {
  try {
    return format(parseISO(dateISO), "dd MMM yyyy", { locale: vi });
  } catch {
    return dateISO;
  }
}

export function formatDateForHero(dateISO: string) {
  try {
    return format(parseISO(dateISO), "d MMMM yyyy", { locale: vi });
  } catch {
    return dateISO;
  }
}

export function createBirthDateISO(day: number, month: number, year: number) {
  const safeMonth = `${month}`.padStart(2, "0");
  const safeDay = `${day}`.padStart(2, "0");
  return `${year}-${safeMonth}-${safeDay}`;
}

export function getDateParts(dateISO: string) {
  try {
    // Tránh dùng new Date(iso) trực tiếp nếu không cần thiết
    const cleanISO = dateISO.split("T")[0];
    const parts = cleanISO.split("-");
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0], 10),
        month: parseInt(parts[1], 10),
        day: parseInt(parts[2], 10),
      };
    }
  } catch {
    // Fallback
  }
  const date = new Date(dateISO);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function getAgeFromBirthDate(dateISO: string, today = new Date()) {
  try {
    return differenceInYears(today, parseISO(dateISO));
  } catch {
    return 0;
  }
}

export function addDays(dateISO: string, days: number) {
  try {
    return formatISO(addDaysFns(parseISO(dateISO), days));
  } catch {
    return dateISO;
  }
}

export function getTodayISO() {
  return formatISO(new Date());
}

export function getTodayDateISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function hourLabel(hour: number) {
  return `${`${hour}`.padStart(2, "0")}:00`;
}

/**
 * Map a weight/stats period string to a {from, to} date range.
 * "1month" = last 30 days, "6months" = last 180 days, "1year" = last 365 days.
 */
export function getDateRangeForPeriod(period: string): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);

  const from = new Date(today);
  switch (period) {
    case "6months":
      from.setDate(today.getDate() - 180);
      break;
    case "1year":
      from.setDate(today.getDate() - 365);
      break;
    case "1month":
    default:
      from.setDate(today.getDate() - 30);
      break;
  }

  return { from: from.toISOString().slice(0, 10), to };
}
