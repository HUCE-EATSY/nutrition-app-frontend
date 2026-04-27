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

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

export function createBirthDateISO(day: number, month: number, year: number) {
  const safeMonth = `${month}`.padStart(2, "0");
  const safeDay = `${day}`.padStart(2, "0");
  return `${year}-${safeMonth}-${safeDay}`;
}

export function getDateParts(dateISO: string) {
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
