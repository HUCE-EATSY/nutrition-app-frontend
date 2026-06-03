import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { spacing, typography, radius } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";

type Props = {
  days: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
};

export function HorizontalDaySelector({ days = 7, selectedDay, onSelectDay }: Props) {
  const colors = useAppColors();
  const scrollViewRef = useRef<ScrollView>(null);

  // Mảng các ngày từ 1 đến `days`
  const dayArray = Array.from({ length: days }, (_, i) => i + 1);

  // Cuộn thanh ngày sao cho ngày được chọn luôn ở giữa (xấp xỉ)
  useEffect(() => {
    if (scrollViewRef.current) {
      const itemWidth = 56; // Kích thước dự kiến của 1 cục day
      const scrollPos = (selectedDay - 1) * itemWidth - itemWidth;
      scrollViewRef.current.scrollTo({ x: Math.max(0, scrollPos), animated: true });
    }
  }, [selectedDay]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Thực đơn theo ngày</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dayArray.map((day) => {
          const isActive = day === selectedDay;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => onSelectDay(day)}
              activeOpacity={0.8}
              style={[
                styles.dayBubble,
                { backgroundColor: isActive ? "#A56CFF" : colors.surface },
                !isActive && { borderColor: colors.border ?? "#444", borderWidth: 1 }
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isActive ? "#fff" : colors.textPrimary },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dayBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayText: {
    ...typography.bodyStrong,
    fontSize: 16,
    fontWeight: "700",
  },
});
