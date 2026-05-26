import React, { useMemo, useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { t } from "@/constants/i18n";
import { radius } from "@/constants";

import { RollingWheelPicker } from "./RollingWheelPicker";

type WheelDatePickerProps = {
  day: number;
  month: number;
  year: number;
  minYear: number;
  maxYear: number;
  onChange: (next: { day: number; month: number; year: number }) => void;
};

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

// 1. Đưa các hằng số không thay đổi ra ngoài component
const ITEM_HEIGHT = 54;
const VISIBLE_ITEMS = 5;
const HIGHLIGHT_TOP = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

export function WheelDatePicker({ day, month, year, minYear, maxYear, onChange }: WheelDatePickerProps) {
  // 2. Dùng useMemo để tránh khởi tạo lại mảng mỗi lần render
  const years = useMemo(() => {
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  }, [minYear, maxYear]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }, []);

  const days = useMemo(() => {
    const maxDay = getDaysInMonth(month, year);
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [month, year]);

  // 3. Dùng useCallback để tránh tạo lại function reference, giúp RollingWheelPicker không bị re-render vô cớ
  const handleDayChange = useCallback((d: number) => {
    onChange({ day: d, month, year });
  }, [month, year, onChange]);

  const handleMonthChange = useCallback((m: number) => {
    const nextMaxDay = getDaysInMonth(m, year);
    onChange({ day: Math.min(day, nextMaxDay), month: m, year });
  }, [day, year, onChange]);

  const handleYearChange = useCallback((y: number) => {
    const nextMaxDay = getDaysInMonth(month, y);
    onChange({ day: Math.min(day, nextMaxDay), month, year: y });
  }, [day, month, onChange]);

  const monthWord = t.onboarding.wheelDate.month;
  const formatMonthLabel = useCallback((m: number) => `${monthWord} ${m}`, [monthWord]);


  return (
    <View style={styles.container}>
      {/* Selection Highlight Bar */}
      <View
        pointerEvents="none"
        style={[
          styles.highlightBar,
          {
            height: ITEM_HEIGHT,
            top: HIGHLIGHT_TOP,
          },
        ]}
      />

      <View style={styles.pickerWrap}>
        <RollingWheelPicker
          data={days}
          itemHeight={ITEM_HEIGHT}
          onValueChange={handleDayChange}
          selectedValue={day}
          visibleItems={VISIBLE_ITEMS}
        />
        <RollingWheelPicker
          data={months}
          formatLabel={formatMonthLabel}
          itemHeight={ITEM_HEIGHT}
          onValueChange={handleMonthChange}
          selectedValue={month}
          visibleItems={VISIBLE_ITEMS}
        />
        <RollingWheelPicker
          data={years}
          itemHeight={ITEM_HEIGHT}
          onValueChange={handleYearChange}
          selectedValue={year}
          visibleItems={VISIBLE_ITEMS}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: radius.xl,
    overflow: "hidden",
    position: "relative",
  },
  pickerWrap: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  highlightBar: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radius.md,
    zIndex: 0,
  },
});