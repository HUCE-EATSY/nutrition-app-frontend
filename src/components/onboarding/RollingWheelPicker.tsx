import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, typography } from "@/src/theme";

interface RollingWheelPickerProps<T> {
  data: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  itemHeight?: number;
  visibleItems?: number;
  formatLabel?: (value: T) => string;
}

export function RollingWheelPicker<T extends string | number>({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 50,
  visibleItems = 5,
  formatLabel,
}: RollingWheelPickerProps<T>) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [internalSelectedValue, setInternalSelectedValue] = useState(selectedValue);

  const spacerCount = Math.floor(visibleItems / 2);
  const initialIndex = data.indexOf(selectedValue);

  useEffect(() => {
    if (initialIndex !== -1 && scrollViewRef.current && !isScrolling) {
      scrollViewRef.current.scrollTo({
        y: initialIndex * itemHeight,
        animated: false,
      });
      setInternalSelectedValue(selectedValue);
    }
  }, [initialIndex, itemHeight, selectedValue]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const newValue = data[index];
    if (newValue !== undefined && newValue !== selectedValue) {
      onValueChange(newValue);
    }
    setIsScrolling(false);
  };

  const onScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const newValue = data[index];
    if (newValue !== undefined && newValue !== internalSelectedValue) {
      setInternalSelectedValue(newValue);
    }
  };

  return (
    <View style={{ height: itemHeight * visibleItems, flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
      >
        {/* Top Spacer */}
        <View style={{ height: spacerCount * itemHeight }} />
        
        {data.map((item, index) => {
          const isSelected = item === internalSelectedValue;
          return (
            <View key={`${item}-${index}`} style={[styles.item, { height: itemHeight }]}>
              <Text
                style={[
                  styles.itemText,
                  isSelected ? styles.selectedItemText : styles.unselectedItemText,
                ]}
              >
                {formatLabel ? formatLabel(item) : item}
              </Text>
            </View>
          );
        })}

        {/* Bottom Spacer */}
        <View style={{ height: spacerCount * itemHeight }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    ...typography.bodyStrong,
    fontSize: 20,
  },
  selectedItemText: {
    color: colors.textPrimary,
    fontSize: 22,
  },
  unselectedItemText: {
    color: colors.textMuted,
    opacity: 0.4,
  },
});
