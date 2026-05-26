import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, radius } from '@/constants';
import { GUIDES_VI, GUIDES_EN, GuideType } from '@/constants/guides';
import { useSettingsStore } from '@/store/settingsStore';
import { t } from '@/constants/i18n';

// Helper function to render text with **bold** formatting
const renderFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={{ fontWeight: '700', color: colors.textPrimary }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

export default function GuideModalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  
  const language = useSettingsStore(state => state.language);
  const theme = useSettingsStore(state => state.theme);
  const GUIDES = language === 'en' ? GUIDES_EN : GUIDES_VI;

  // Default fallback if type is invalid
  const guideType = (type && GUIDES[type as GuideType]) ? (type as GuideType) : 'goal';
  const content = GUIDES[guideType];

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { intensity: 40, tint: theme === "light" ? "light" : "dark", style: styles.container } as any
    : { style: [styles.container, { backgroundColor: theme === "light" ? "rgba(244, 245, 247, 0.95)" : "rgba(18, 16, 25, 0.95)" }] } as any;

  return (
    <Container {...containerProps}>
      {/* Vùng mờ bên trên để bấm ra ngoài đóng */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        
        {/* Header Modal */}
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Pressable onPress={handleClose} hitSlop={15} style={styles.closeIcon}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{renderFormattedText(content.title)}</Text>
          
          <View style={styles.bodyContent}>
            {content.intro.map((para, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {renderFormattedText(para)}
              </Text>
            ))}
            
            {content.bulletPoints && content.bulletPoints.length > 0 && (
              <View style={styles.bulletList}>
                {content.bulletPoints.map((bullet, idx) => (
                  <View key={idx} style={styles.bulletItem}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{renderFormattedText(bullet)}</Text>
                  </View>
                ))}
              </View>
            )}

            {content.footerNote && (
              <Text style={styles.footerNote}>{renderFormattedText(content.footerNote)}</Text>
            )}

            {/* Article Card */}
            {content.articleCard && (
              <View style={styles.articleSection}>
                <View style={styles.divider} />
                <View style={styles.articleCard}>
                  <View style={[styles.articleImage, { backgroundColor: content.articleCard.imageColor }]} />
                  <View style={styles.articleInfo}>
                    <View style={styles.articleTagRow}>
                      <Ionicons name="bulb-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.articleTag}>{content.articleCard.tag}</Text>
                    </View>
                    <Text style={styles.articleTitle}>{content.articleCard.title}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footerAction}>
          <Pressable style={styles.primaryBtn} onPress={handleClose}>
            <Text style={styles.primaryBtnText}>{t.common.gotIt}</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.bgBase,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%', // Prevent it from covering the whole screen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 24,
  },
  closeIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  bodyContent: {
    gap: spacing.md,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bulletList: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  footerNote: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    marginTop: spacing.md,
  },
  articleSection: {
    marginTop: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: spacing.xl,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  articleImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  articleInfo: {
    flex: 1,
    gap: 4,
  },
  articleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleTag: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  articleTitle: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footerAction: {
    paddingHorizontal: 24,
    paddingTop: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
});
