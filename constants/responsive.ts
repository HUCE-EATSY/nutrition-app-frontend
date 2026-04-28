import { useWindowDimensions } from "react-native";

import { layout, spacing } from "@/constants";

const NARROW_WIDTH = 360;
const COMPACT_WIDTH = 390;
const SHORT_HEIGHT = 760;

function getHorizontalPadding(width: number) {
  if (width <= NARROW_WIDTH) {
    return spacing.md;
  }

  if (width <= COMPACT_WIDTH) {
    return spacing.lg;
  }

  return layout.screenPadding;
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isNarrowWidth = width <= NARROW_WIDTH;
  const isCompactWidth = width <= COMPACT_WIDTH;
  const isShortHeight = height <= SHORT_HEIGHT;

  return {
    width,
    height,
    horizontalPadding: getHorizontalPadding(width),
    isCompact: isCompactWidth || isShortHeight,
    isCompactWidth,
    isNarrowWidth,
    isShortHeight,
  };
}
