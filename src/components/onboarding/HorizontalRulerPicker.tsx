import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";
import { clamp, roundToStep } from "@/src/utils/date";

type HorizontalRulerPickerProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  majorTickEvery: number;
  decimalPlaces?: number;
  onChange: (value: number) => void;
};

const TICK_WIDTH = 10; // Distance between ticks
const CENTER_LINE_WIDTH = 3;

export function HorizontalRulerPicker({
  min,
  max,
  step,
  value,
  unit,
  majorTickEvery,
  decimalPlaces = 0,
  onChange,
}: HorizontalRulerPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // Generate all possible values
  const data = useMemo(() => {
    const items = [];
    // Use a small epsilon to avoid floating point issues
    for (let i = min; i <= max + step / 10; i = roundToStep(i + step, step)) {
      items.push(roundToStep(i, step));
    }
    return items;
  }, [min, max, step]);

  const safeValue = clamp(value, min, max);

  // Sync internal value when prop changes (from external buttons)
  useEffect(() => {
    if (Math.abs(value - internalValue) > step / 4) {
      setInternalValue(value);
      if (isReady && flatListRef.current && containerWidth > 0) {
        const index = data.indexOf(roundToStep(value, step));
        if (index !== -1) {
          flatListRef.current.scrollToOffset({
            offset: index * TICK_WIDTH,
            animated: true,
          });
        }
      }
    }
  }, [value, isReady, containerWidth, data, step]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width);
    setIsReady(true);
  };

  // Initial scroll to current value
  useEffect(() => {
    if (isReady && containerWidth > 0 && flatListRef.current) {
      const index = data.indexOf(roundToStep(safeValue, step));
      if (index !== -1) {
        flatListRef.current.scrollToOffset({
          offset: index * TICK_WIDTH,
          animated: false,
        });
      }
    }
  }, [isReady, containerWidth]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    const newValue = data[clamp(index, 0, data.length - 1)];

    if (newValue !== undefined && newValue !== internalValue) {
      setInternalValue(newValue);
      onChange(newValue);
    }
  };

  const renderItem = ({ item }: { item: number }) => {
    const diff = Math.round((item - min) / step);
    const isMajor = diff % majorTickEvery === 0;
    const isSelected = Math.abs(item - internalValue) < step / 4;

    return (
      <View style={[styles.tickContainer, { width: TICK_WIDTH }]}>
        <View
          style={[
            styles.tick,
            isMajor ? styles.majorTick : styles.minorTick,
            isSelected && styles.selectedTick,
          ]}
        />
        {isMajor && (
          <Text style={[styles.tickLabel, isSelected && styles.selectedLabel]}>
            {item.toFixed(item % 1 === 0 ? 0 : 1)}
          </Text>
        )}
      </View>
    );
  };

  const spacerWidth = containerWidth / 2 - TICK_WIDTH / 2;

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {internalValue.toFixed(decimalPlaces)}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
      <Text style={styles.subtle}>Vuốt thước để chọn hoặc dùng nút bấm</Text>

      <View style={styles.controls}>
        <Pressable
          onPress={() => onChange(roundToStep(clamp(internalValue - step, min, max), step))}
          style={styles.controlButton}
        >
          <Ionicons color={colors.textPrimary} name="remove" size={20} />
        </Pressable>

        <View onLayout={onLayout} style={styles.rulerContainer}>
          {isReady && containerWidth > 0 && (
            <>
              {/* Central Indicator */}
              <View style={styles.centerIndicator} />

              <FlatList
                ref={flatListRef}
                ListFooterComponent={<View style={{ width: spacerWidth }} />}
                ListHeaderComponent={<View style={{ width: spacerWidth }} />}
                data={data}
                decelerationRate="fast"
                getItemLayout={(_, index) => ({
                  length: TICK_WIDTH,
                  offset: TICK_WIDTH * index,
                  index,
                })}
                horizontal
                keyExtractor={(item) => item.toString()}
                onScroll={onScroll}
                renderItem={renderItem}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}
                snapToInterval={TICK_WIDTH}
              />
            </>
          )}
        </View>

        <Pressable
          onPress={() => onChange(roundToStep(clamp(internalValue + step, min, max), step))}
          style={styles.controlButton}
        >
          <Ionicons color={colors.textPrimary} name="add" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  value: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: "center",
  },
  unit: {
    ...typography.h3,
    color: colors.textMuted,
  },
  subtle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    height: 140,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  rulerContainer: {
    flex: 1,
    height: 120,
    backgroundColor: "rgba(20, 20, 30, 0.4)",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    justifyContent: "center",
  },
  centerIndicator: {
    position: "absolute",
    left: "50%",
    top: 20,
    bottom: 40,
    width: CENTER_LINE_WIDTH,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginLeft: -CENTER_LINE_WIDTH / 2,
    zIndex: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  tickContainer: {
    height: 100,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 25,
  },
  tick: {
    width: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: radius.pill,
  },
  minorTick: {
    height: 12,
  },
  majorTick: {
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  selectedTick: {
    opacity: 0, // Hide behind center indicator
  },
  tickLabel: {
    ...typography.caption,
    position: "absolute",
    bottom: 2,
    color: colors.textMuted,
    fontSize: 10,
    width: 40,
    textAlign: "center",
  },
  selectedLabel: {
    color: colors.textPrimary,
    fontWeight: "bold",
    transform: [{ scale: 1.1 }],
  },
});
