import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFoodSearch, FoodDto } from '@/hooks/api';
import { colors, spacing, typography, radius } from '@/constants';

interface FoodSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodDto) => void;
}

export function FoodSearchModal({ visible, onClose, onSelectFood }: FoodSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useFoodSearch({
    query: searchQuery,
    page: 1,
    pageSize: 20,
  });

  const handleSelectFood = (food: FoodDto) => {
    onSelectFood(food);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tìm món ăn</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nhập tên món ăn (ít nhất 2 ký tự)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {isLoading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {error && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Có lỗi xảy ra khi tìm kiếm</Text>
            </View>
          )}

          {!isLoading && !error && searchQuery.length < 2 && (
            <View style={styles.centerContainer}>
              <Ionicons name="search" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                Nhập ít nhất 2 ký tự để tìm kiếm
              </Text>
            </View>
          )}

          {!isLoading && !error && searchQuery.length >= 2 && data?.foods.length === 0 && (
            <View style={styles.centerContainer}>
              <Ionicons name="sad-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy món ăn nào</Text>
            </View>
          )}

          {data && data.foods.length > 0 && (
            <FlatList
              data={data.foods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.foodItem}
                  onPress={() => handleSelectFood(item)}
                >
                  <View style={styles.foodIcon}>
                    <Ionicons name="restaurant-outline" size={24} color={colors.warning} />
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.nameVi}</Text>
                    <Text style={styles.foodDetails}>
                      {Math.round(item.caloriesKcal)} kcal • {item.servingSizeG}g • {item.categoryNameVi}
                    </Text>
                    <View style={styles.macroRow}>
                      <Text style={styles.macroText}>P: {item.proteinG}g</Text>
                      <Text style={styles.macroText}>C: {item.carbsG}g</Text>
                      <Text style={styles.macroText}>F: {item.fatG}g</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 15,
  },
  resultsContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  foodIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  foodName: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    fontSize: 15,
  },
  foodDetails: {
    ...typography.caption,
    color: colors.textMuted,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginLeft: spacing.lg + 48 + spacing.md,
  },
});
