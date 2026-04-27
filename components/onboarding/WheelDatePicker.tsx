import { StyleSheet, View } from "react-native";

import { t } from "@/constants/i18n";
import { colors, radius } from "@/constants";

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

export function WheelDatePicker({ day, month, year, minYear, maxYear, onChange }: WheelDatePickerProps) {
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const ITEM_HEIGHT = 54;
  const VISIBLE_ITEMS = 5;

  return (
    <View style={styles.container}>
      {/* Selection Highlight Bar */}
      <View
        pointerEvents="none"
        style={[
          styles.highlightBar,
          {
            height: ITEM_HEIGHT,
            top: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT,
          },
        ]}
      />

      <View style={styles.pickerWrap}>
        <RollingWheelPicker
          data={days}
          itemHeight={ITEM_HEIGHT}
          onValueChange={(d) => onChange({ day: d, month, year })}
          selectedValue={day}
          visibleItems={VISIBLE_ITEMS}
        />
        <RollingWheelPicker
          data={months}
          formatLabel={(m) => `${t.onboarding.wheelDate.month} ${m}`}
          itemHeight={ITEM_HEIGHT}
          onValueChange={(m) => {
            const nextMaxDay = getDaysInMonth(m, year);
            onChange({ day: Math.min(day, nextMaxDay), month: m, year });
          }}
          selectedValue={month}
          visibleItems={VISIBLE_ITEMS}
        />
        <RollingWheelPicker
          data={years}
          itemHeight={ITEM_HEIGHT}
          onValueChange={(y) => {
            const nextMaxDay = getDaysInMonth(month, y);
            onChange({ day: Math.min(day, nextMaxDay), month, year: y });
          }}
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
