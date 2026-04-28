import { Text, type TextProps, StyleSheet } from 'react-native';

import { colors, typography } from '@/constants';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const textColor = colors.textPrimary;

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    ...typography.body,
  },
  defaultSemiBold: {
    ...typography.bodyStrong,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.h2,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
