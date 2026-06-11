import React from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { SafeScreen } from "@/components/layout/SafeScreen";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { streakService } from "@/services/streakService";
import { STREAK_QUERY_KEYS } from "@/hooks/useStreaks";
import { SurfaceCard } from "@/components/common/SurfaceCard";

export default function LeaderboardScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const { data: leaderboard = [], isLoading, refetch } = useQuery({
    queryKey: STREAK_QUERY_KEYS.leaderboard(),
    queryFn: streakService.getLeaderboard,
  });

  const renderPodiumItem = (user: any, rank: number) => {
    if (!user) return null;

    const size = rank === 1 ? 80 : 66;
    const crownColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32";

    return (
      <View style={[styles.podiumCol, rank === 1 && styles.podiumColFirst]}>
        <View style={styles.avatarContainer}>
          {rank === 1 && (
            <MaterialCommunityIcons name="crown" size={24} color={crownColor} style={styles.crownIcon} />
          )}
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={[styles.podiumAvatar, { width: size, height: size, borderRadius: size / 2 }]} />
          ) : (
            <View style={[styles.podiumAvatarPlaceholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceAlt }]}>
              <Text style={[styles.avatarText, { fontSize: rank === 1 ? 24 : 20 }]}>
                {user.displayName?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={[styles.podiumBadge, { backgroundColor: crownColor }]}>
            <Text style={styles.podiumBadgeText}>{rank}</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.podiumName}>{user.displayName}</Text>
        <View style={styles.podiumStreakRow}>
          <MaterialCommunityIcons name="fire" size={16} color={colors.warning} />
          <Text style={styles.podiumStreakVal}>{user.currentStreak}</Text>
        </View>
      </View>
    );
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const renderUserItem = ({ item, index }: { item: any; index: number }) => {
    const rank = index + 4;
    return (
      <SurfaceCard style={styles.userItem}>
        <View style={styles.itemLeft}>
          <Text style={styles.rankText}>{rank}</Text>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.itemAvatar} />
          ) : (
            <View style={styles.itemAvatarPlaceholder}>
              <Text style={styles.itemAvatarText}>{item.displayName?.charAt(0).toUpperCase() || "?"}</Text>
            </View>
          )}
          <Text numberOfLines={1} style={styles.itemName}>{item.displayName}</Text>
        </View>
        <View style={styles.itemRight}>
          <MaterialCommunityIcons name="fire" size={18} color={colors.warning} />
          <Text style={styles.itemStreakText}>{item.currentStreak}</Text>
        </View>
      </SurfaceCard>
    );
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <Pressable hitSlop={15} onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Bảng Xếp Hạng</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.userId}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            leaderboard.length > 0 ? (
              <View style={styles.podiumSection}>
                <View style={styles.podiumContainer}>
                  {renderPodiumItem(top3[1], 2)}
                  {renderPodiumItem(top3[0], 1)}
                  {renderPodiumItem(top3[2], 3)}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có dữ liệu bảng xếp hạng</Text>
              </View>
            )
          }
        />
      )}
    </SafeScreen>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  podiumSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  podiumCol: {
    alignItems: "center",
    width: "30%",
  },
  podiumColFirst: {
    transform: [{ translateY: -10 }],
  },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  crownIcon: {
    position: "absolute",
    top: -20,
    zIndex: 10,
  },
  podiumAvatar: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  podiumAvatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarText: {
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  podiumBadge: {
    position: "absolute",
    bottom: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  podiumBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  podiumName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  podiumStreakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  podiumStreakVal: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  rankText: {
    ...typography.bodyStrong,
    color: colors.textMuted,
    width: 24,
    textAlign: "center",
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  itemAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  itemAvatarText: {
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemStreakText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
