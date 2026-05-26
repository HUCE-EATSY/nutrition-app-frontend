import React, { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, typography } from "@/constants";

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
  const isMomentumRef = useRef(false);

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
  }, [initialIndex, itemHeight, selectedValue, isScrolling]);

  const onMomentumScrollBegin = () => {
    isMomentumRef.current = true;
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolling(false);
    isMomentumRef.current = false;
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    const newValue = data[index];
    if (newValue !== undefined && newValue !== selectedValue) {
      onValueChange(newValue);
    }
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    setTimeout(() => {
      if (!isMomentumRef.current) {
        setIsScrolling(false);
        const index = Math.round(y / itemHeight);
        const newValue = data[index];
        if (newValue !== undefined && newValue !== selectedValue) {
          onValueChange(newValue);
        }
      }
    }, 0);
  };

  const onScrollBeginDrag = () => {
    setIsScrolling(true);
    isMomentumRef.current = false;
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
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
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
    fontSize: 19,
  },
  selectedItemText: {
    color: colors.textPrimary,
    fontSize: 21,
  },
  unselectedItemText: {
    color: colors.textMuted,
    opacity: 0.4,
  },
});
