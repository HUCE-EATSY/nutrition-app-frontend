import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useState } from "react";

import { colors, spacing, typography } from "@/constants";
import { t } from "@/constants/i18n";
import { ACTIVITIES, ActivityId } from "@/constants/activities";
import { getExerciseNameFromActivity } from "@/constants/exerciseMapping";
import { exerciseService, Exercise } from "@/services/exerciseService";

export function ActivityGrid() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Load exercises để lấy ID
  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    try {
      const categories = await exerciseService.getCategories();
      const allExercises = categories.flatMap(cat => cat.exercises);
      setExercises(allExercises);
    } catch (error) {
      console.error("Failed to load exercises:", error);
    }
  }

  function handleActivityPress(activityId: ActivityId) {
    const exerciseName = getExerciseNameFromActivity(activityId);
    
    // Tìm exercise theo tên (NameEn)
    const exercise = exercises.find(ex => 
      ex.nameEn.toLowerCase() === exerciseName.toLowerCase()
    );

    if (exercise) {
      // Nếu tìm thấy exercise cụ thể → đi thẳng exercise-detail
      router.push(`/exercise-detail?exerciseId=${exercise.id}&date=${new Date().toISOString().split('T')[0]}`);
    } else {
      // Nếu không tìm thấy (ví dụ: "Khác") → đi add-exercise
      router.push(`/add-exercise?exerciseName=${encodeURIComponent(exerciseName)}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.home.exerciseActivity}</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => {
          return (
            <TouchableOpacity 
              key={activity.id} 
              style={styles.item}
              onPress={() => handleActivityPress(activity.id)}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name={activity.icon} size={20} color={colors.textPrimary} />
              </View>
              <Text style={styles.label}>{activity.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
  },
  item: {
    width: "30%",
    alignItems: "center",
    gap: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
