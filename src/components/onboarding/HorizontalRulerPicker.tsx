import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/constants";
import { clamp, roundToStep } from "@/utils/date";

type HorizontalRulerPickerProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  majorTickEvery: number;
  decimalPlaces?: number;
  onChange: (value: number) => void;
  onScrollValueChange?: (value: number) => void;
};

const TICK_WIDTH = 10;
const CENTER_LINE_WIDTH = 3;

// 1. Tách TickItem ra và dùng React.memo.
// Chỉ re-render vạch này nếu prop isSelected thay đổi.
const TickItem = memo(({ item, min, step, majorTickEvery, isSelected }: {
  item: number;
  min: number;
  step: number;
  majorTickEvery: number;
  isSelected: boolean;
}) => {
  const diff = Math.round((item - min) / step);
  const isMajor = diff % majorTickEvery === 0;

  return (
    <View style={[styles.tickContainer, { width: TICK_WIDTH }]}>
      <View
        style={[
          styles.tick,
          isMajor ? styles.majorTick : styles.minorTick,
          isSelected && styles.selectedTick,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Tối ưu hóa: Chỉ so sánh isSelected vì các prop khác không bao giờ đổi
  return prevProps.isSelected === nextProps.isSelected;
});
TickItem.displayName = "TickItem";

export function HorizontalRulerPicker({
  min,
  max,
  step,
  value,
  unit,
  majorTickEvery,
  decimalPlaces = 0,
  onChange,
  onScrollValueChange,
}: HorizontalRulerPickerProps) {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const lastScrollValueRef = useRef(value);
  
  // 2. Thay đổi isScrolling thành useRef để tránh re-render
  const isScrollingRef = useRef(false);
  const isMomentumRef = useRef(false);

  const data = useMemo(() => {
    const items = [];
    for (let i = min; i <= max + step / 10; i = roundToStep(i + step, step)) {
      items.push(roundToStep(i, step));
    }
    return items;
  }, [min, max, step]);

  const safeValue = clamp(value, min, max);

  // 3. Tối ưu useEffect đồng bộ value từ bên ngoài
  useEffect(() => {
    if (isScrollingRef.current) return;
    
    if (Math.abs(value - internalValue) > step / 4) {
      setInternalValue(value);
      lastScrollValueRef.current = value;
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
    // Gỡ internalValue ra khỏi dependency, chỉ trigger khi `value` từ cha đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isReady, containerWidth, data, step]);

  useEffect(() => {
    if (isReady && containerWidth > 0 && flatListRef.current) {
      const index = data.indexOf(roundToStep(safeValue, step));
      if (index !== -1) {
        flatListRef.current.scrollToOffset({
          offset: index * TICK_WIDTH,
          animated: false,
        });
        lastScrollValueRef.current = safeValue;
      }
    }
  }, [isReady, containerWidth, data, safeValue, step]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
    setIsReady(true);
  }, []);

  // 4. Dùng useCallback và lastScrollValueRef để tránh re-render và tránh cập nhật state trong render phase
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    const newValue = data[clamp(index, 0, data.length - 1)];

    if (newValue !== undefined && newValue !== lastScrollValueRef.current) {
      lastScrollValueRef.current = newValue;
      setInternalValue(newValue);
      if (onScrollValueChange) {
        onScrollValueChange(newValue);
      }
    }
  }, [data, onScrollValueChange]);

  const onScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
    isMomentumRef.current = false;
  }, []);

  const onMomentumScrollBegin = useCallback(() => {
    isMomentumRef.current = true;
  }, []);

  const onScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setTimeout(() => {
      if (!isMomentumRef.current) {
        isScrollingRef.current = false;
        const index = Math.round(offsetX / TICK_WIDTH);
        const newValue = data[clamp(index, 0, data.length - 1)];
        if (newValue !== undefined) {
          onChange(newValue);
        }
      }
    }, 0);
  }, [data, onChange]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isScrollingRef.current = false;
    isMomentumRef.current = false;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    const newValue = data[clamp(index, 0, data.length - 1)];
    if (newValue !== undefined) {
      onChange(newValue);
    }
  }, [data, onChange]);

  // 5. Wrap renderItem với useCallback
  const renderItem = useCallback(({ item }: { item: number }) => {
    const isSelected = Math.abs(item - internalValue) < step / 4;
    return (
      <TickItem
        item={item}
        min={min}
        step={step}
        majorTickEvery={majorTickEvery}
        isSelected={isSelected}
      />
    );
  }, [internalValue, min, step, majorTickEvery]);

  // 6. Memoize cấu trúc layout
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: TICK_WIDTH,
    offset: TICK_WIDTH * index,
    index,
  }), []);

  const spacerWidth = containerWidth > 0 ? containerWidth / 2 - TICK_WIDTH / 2 : 0;
  const spacerStyle = useMemo(() => ({ width: spacerWidth }), [spacerWidth]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.value}>
        {internalValue.toFixed(decimalPlaces)}
        <Text style={styles.unit}> {unit}</Text>
      </Text>

      <View onLayout={onLayout} style={styles.rulerContainer}>
        {isReady && containerWidth > 0 && (
          <>
            <View style={styles.centerIndicator} />
            <FlatList
              ref={flatListRef}
              ListFooterComponent={<View style={spacerStyle} />}
              ListHeaderComponent={<View style={spacerStyle} />}
              data={data}
              decelerationRate="fast"
              getItemLayout={getItemLayout}
              horizontal
              keyExtractor={(item) => item.toString()}
              onScroll={onScroll}
              onScrollBeginDrag={onScrollBeginDrag}
              onScrollEndDrag={onScrollEndDrag}
              onMomentumScrollBegin={onMomentumScrollBegin}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={renderItem}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              snapToInterval={TICK_WIDTH}
            />
          </>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xxl,
    alignItems: "center",
    width: "100%",
  },
  value: {
    ...typography.display,
    fontSize: 48,
    lineHeight: 56,
    color: colors.textPrimary,
    textAlign: "center",
  },
  unit: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "normal",
  },
  rulerContainer: {
    width: "100%",
    height: 80,
    position: "relative",
    justifyContent: "center",
  },
  centerIndicator: {
    position: "absolute",
    left: "50%",
    top: 5,
    bottom: 5,
    width: CENTER_LINE_WIDTH,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    marginLeft: -CENTER_LINE_WIDTH / 2,
    zIndex: 5,
  },
  tickContainer: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    width: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: radius.pill,
  },
  minorTick: {
    height: 18,
  },
  majorTick: {
    height: 36,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  selectedTick: {
    backgroundColor: colors.primary,
    height: 36,
    width: 2,
  },
});
