import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { diarySummary } from "@/src/mocks/data";
import { theme, spacing, radius, typography } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";

type MacroInfo = {
  label: string;
  value: number;
  target: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 to 23:00

export function DiaryTimelineScreen() {
  const { horizontalPadding } = useResponsiveLayout();
  const currentHour = new Date().getHours();

  const macros: MacroInfo[] = [
    { label: "Calories", value: diarySummary.consumedCalories, target: diarySummary.targetCalories, icon: "flame", color: theme.colors.primary },
    { label: "Protein", value: diarySummary.consumedProteinGram, target: diarySummary.targetProteinGram, icon: "flash", color: theme.colors.protein },
    { label: "Carbs", value: diarySummary.consumedCarbGram, target: diarySummary.targetCarbGram, icon: "leaf", color: theme.colors.carbs },
    { label: "Fat", value: diarySummary.consumedFatGram, target: diarySummary.targetFatGram, icon: "water", color: theme.colors.fat },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Pressable hitSlop={12}>
          <Ionicons color={theme.colors.textPrimary} name="menu-outline" size={26} />
        </Pressable>
        
        <View style={styles.dateSelector}>
          <Pressable hitSlop={12}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={20} />
          </Pressable>
          <Text style={styles.dateText}>Hôm qua</Text>
          <Pressable hitSlop={12}>
            <Ionicons color={theme.colors.textPrimary} name="chevron-forward" size={20} />
          </Pressable>
        </View>

        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.macrosRow, { paddingHorizontal: horizontalPadding }]}>
        {macros.map((macro) => {
          const progress = Math.min((macro.value / macro.target) * 100, 100);
          return (
            <View key={macro.label} style={styles.macroItem}>
              <View style={styles.macroTop}>
                <Ionicons color={macro.color} name={macro.icon} size={14} />
                <Text style={styles.macroValue}>{macro.value} / {macro.target}</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { backgroundColor: macro.color, width: `${progress}%` }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timelineContainer}>
          {hours.map((hour) => {
            const isCurrentHour = hour === currentHour;
            const timeString = `${hour.toString().padStart(2, "0")}:00`;
            const slot = diarySummary.slots.find(s => s.hour === hour);
            const hasEntries = !!(slot && slot.entries.length > 0);
            
            return (
              <View key={hour} style={styles.timelineRow}>
                <View style={styles.timeWrapper}>
                  <Text style={[
                    styles.timeText,
                    isCurrentHour && styles.timeTextActive
                  ]}>
                    {timeString}
                  </Text>
                </View>
                
                <View style={styles.lineContentWrapper}>
                  <View style={[
                    styles.timelineLine,
                    isCurrentHour && styles.timelineLineActive
                  ]} />
                  
                  {hasEntries ? (
                    <View style={styles.entryPreview}>
                      {slot.entries.map((entry, idx) => (
                        <Text key={entry.id} numberOfLines={1} style={styles.entryText}>
                          {idx > 0 ? " \u2022 " : ""}{entry.title}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                
                <Pressable
                  hitSlop={8}
                  onPress={() => router.push(`/quick-add?hour=${hour}`)}
                  style={styles.addButton}
                >
                  <Ionicons color={theme.colors.textMuted} name="add" size={24} />
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dateText: {
    ...typography.h3,
    color: theme.colors.textPrimary,
    fontSize: 18,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  macroItem: {
    flex: 1,
    gap: 8,
  },
  macroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    ...typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  timelineContainer: {
    gap: spacing.sm,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
  },
  timeWrapper: {
    width: 50,
  },
  timeText: {
    ...typography.bodyStrong,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  timeTextActive: {
    color: theme.colors.primary,
  },
  lineContentWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    marginHorizontal: spacing.sm,
  },
  timelineLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  timelineLineActive: {
    backgroundColor: "rgba(165,108,255,0.15)",
  },
  entryPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  entryText: {
    ...typography.caption,
    color: theme.colors.textPrimary,
    fontSize: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
