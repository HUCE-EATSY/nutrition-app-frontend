import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/src/components/common/SurfaceCard";
import { TimelineHourRow } from "@/src/components/diary/TimelineHourRow";
import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { t } from "@/src/i18n";
import { diarySummary } from "@/src/mocks/data";
import { colors, radius, spacing, typography } from "@/src/theme";
import { useResponsiveLayout } from "@/src/theme/responsive";
import { formatShortDate, hourLabel } from "@/src/utils/date";

export function DiaryTimelineScreen() {
  const { isCompact, isNarrowWidth } = useResponsiveLayout();

  return (
    <SafeScreen>
      <View style={styles.screen}>
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          <View>
            <Text style={styles.kicker}>{t.diary.kicker}</Text>
            <Text style={[styles.date, isNarrowWidth && styles.dateCompact]}>{formatShortDate(diarySummary.dateISO)}</Text>
          </View>
          <Pressable onPress={() => router.push("/quick-add")} style={[styles.quickAdd, isCompact && styles.quickAddCompact]}>
            <Text style={styles.quickAddLabel}>{t.diary.add}</Text>
          </Pressable>
        </View>

        <SurfaceCard style={styles.summaryCard}>
          <MacroMini
            label={t.diary.calories}
            progress={diarySummary.consumedCalories / diarySummary.targetCalories}
            value={`${diarySummary.consumedCalories}/${diarySummary.targetCalories}`}
          />
          <MacroMini
            label={t.diary.protein}
            progress={diarySummary.consumedProteinGram / diarySummary.targetProteinGram}
            value={`${diarySummary.consumedProteinGram}g`}
          />
          <MacroMini
            label={t.diary.carb}
            progress={diarySummary.consumedCarbGram / diarySummary.targetCarbGram}
            value={`${diarySummary.consumedCarbGram}g`}
          />
          <MacroMini
            label={t.diary.fat}
            progress={diarySummary.consumedFatGram / diarySummary.targetFatGram}
            value={`${diarySummary.consumedFatGram}g`}
          />
        </SurfaceCard>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={diarySummary.slots}
          keyExtractor={(item) => `${item.hour}`}
          renderItem={({ item }) => (
            <TimelineHourRow
              calories={item.entries[0]?.calories}
              entriesCount={item.entries.length}
              hourLabel={hourLabel(item.hour)}
              isCurrentHour={item.hour === new Date().getHours()}
              onAdd={() => router.push(`/quick-add?hour=${item.hour}&selectedDate=${diarySummary.dateISO}`)}
              onPress={() => undefined}
              title={item.entries[0]?.title}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeScreen>
  );
}

function MacroMini({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(progress, 1) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerCompact: {
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  kicker: {
    ...typography.caption,
    color: colors.textMuted,
  },
  date: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  dateCompact: {
    ...typography.h2,
  },
  quickAdd: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165,108,255,0.18)",
  },
  quickAddCompact: {
    alignSelf: "flex-start",
  },
  quickAddLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  summaryCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  macroItem: {
    width: "47%",
    gap: 8,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  macroValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: "#3A3453",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
});
