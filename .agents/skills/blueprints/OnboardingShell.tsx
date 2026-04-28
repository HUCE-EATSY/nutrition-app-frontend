import React, { ReactNode } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radius, typography } from './dnt_theme';

type OnboardingShellProps = {
  progress: number;
  question: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingShell({
  progress,
  question,
  children,
  footer,
}: OnboardingShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%` }]} />
        </View>

        <View style={styles.questionRow}>
          <View style={styles.mascotAvatar}>
            <Text style={styles.mascotEmoji}>🐱</Text>
          </View>

          <View style={styles.bubbleWrap}>
            <View style={styles.bubble}>
              <Text style={styles.question}>{question}</Text>
            </View>
            <View style={styles.bubbleTail} />
          </View>
        </View>

        <View style={styles.content}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 34,
    lineHeight: 34,
  },
  progressTrack: {
    height: 8,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: '#3A3453',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xxl,
  },
  mascotAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  mascotEmoji: {
    fontSize: 24,
  },
  bubbleWrap: {
    flex: 1,
    position: 'relative',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  bubbleTail: {
    position: 'absolute',
    left: -6,
    top: 24,
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#FFFFFF',
  },
  question: {
    ...typography.h2,
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
