import { View, type ViewProps } from 'react-native';
import { colors } from '@/constants';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const backgroundColor = colors.bgBase;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
