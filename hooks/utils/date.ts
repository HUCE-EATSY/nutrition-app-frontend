export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function formatShortDate(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateForHero(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


export function createBirthDateISO(day: number, month: number, year: number) {
  const safeMonth = `${month}`.padStart(2, "0");
  const safeDay = `${day}`.padStart(2, "0");
  return `${year}-${safeMonth}-${safeDay}`;
}

export function getDateParts(dateISO: string) {
  // Tránh dùng new Date(iso) vì sẽ bị lệch múi giờ (UTC vs Local)
  const parts = dateISO.split("T")[0].split("-");
  if (parts.length === 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
    };
  }
  // Fallback nếu chuỗi không đúng định dạng
  const date = new Date(dateISO);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function getAgeFromBirthDate(dateISO: string, today = new Date()) {
  const birthDate = new Date(dateISO);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

export function addDays(dateISO: string, days: number) {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getTodayISO() {
  return new Date().toISOString();
}

export function getTodayDateISO() {
  return new Date().toISOString().slice(0, 10);
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
