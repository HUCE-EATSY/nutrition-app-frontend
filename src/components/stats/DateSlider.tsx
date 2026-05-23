import React from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface DateItem {
  dayOfWeek: string; // T2, T3...
  date: number; // 1, 2, 3...
  fullDateStr: string; // ISO or YYYY-MM-DD
}

interface DateSliderProps {
  dates: DateItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSlider: React.FC<DateSliderProps> = ({ dates, selectedDate, onSelectDate }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dates.map((item, index) => {
          const isActive = item.fullDateStr === selectedDate;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateBox, isActive && styles.activeDateBox]}
              onPress={() => onSelectDate(item.fullDateStr)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, isActive && styles.activeText]}>{item.dayOfWeek}</Text>
              <Text style={[styles.dateText, isActive && styles.activeText]}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateBox: {
    width: 48,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#1E1B2E",
    alignItems: "center",
    justifyContent: "center",
  },
  activeDateBox: {
    backgroundColor: "#8B5CF6",
  },
  dayText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeText: {
    color: "#FFFFFF",
  },
});
