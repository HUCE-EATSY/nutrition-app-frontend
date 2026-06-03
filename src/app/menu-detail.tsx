import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share, Image
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { SafeScreen } from "@/components/layout/SafeScreen";
import Toast from "@/components/common/Toast";
import { radius, spacing, typography } from "@/constants";
import { useAppColors } from "@/hooks/useAppColors";
import { menuService, MenuResponse, MenuFoodItem } from "@/services/menuService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HorizontalDaySelector } from "@/components/meal/HorizontalDaySelector";
import { MacroPieChart } from "@/components/meal/MacroPieChart";

const MEAL_TYPE_NAMES: Record<number, string> = {
  1: "Bữa sáng",
  2: "Bữa trưa",
  3: "Bữa tối",
  4: "Bữa phụ",
};

// 7-day mock foods database from meal-plan-generation designs
const MOCK_FOODS_DATABASE: Record<string, Record<number, MenuFoodItem[]>> = {
  discover_1: { // Meal plan chuẩn gym (2400-2600 Cal)
    1: [
      { foodItemId: "f1", nameVi: "Trứng gà ốp la & Bánh mì đen", nameEn: "Fried eggs with black bread", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 320, proteinG: 18, carbsG: 25, fatG: 12 },
      { foodItemId: "f2", nameVi: "Sữa tươi tiệt trùng không đường", nameEn: "Unsweetened milk", imageUrl: null, mealTypeId: 1, quantityG: 200, caloriesKcal: 120, proteinG: 7, carbsG: 10, fatG: 6 },
      { foodItemId: "f3", nameVi: "Ức gà áp chảo tẩm hành tỏi", nameEn: "Grilled chicken breast", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 380, proteinG: 42, carbsG: 2, fatG: 8 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f4", nameVi: "Súp lơ xanh hấp chín", nameEn: "Boiled broccoli", imageUrl: null, mealTypeId: 2, quantityG: 120, caloriesKcal: 45, proteinG: 3, carbsG: 8, fatG: 0.5 },
      { foodItemId: "f5", nameVi: "Cá hồi áp chảo sốt bơ chanh", nameEn: "Pan-seared salmon", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 440, proteinG: 34, carbsG: 1, fatG: 28 },
      { foodItemId: "f6", nameVi: "Khoai lang tím luộc nước dừa", nameEn: "Boiled purple sweet potato", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 180, proteinG: 2, carbsG: 40, fatG: 0.2 },
      { foodItemId: "f7", nameVi: "Sữa chua Hy Lạp & Hạt chia", nameEn: "Greek yogurt with chia seeds", imageUrl: null, mealTypeId: 4, quantityG: 140, caloriesKcal: 180, proteinG: 12, carbsG: 15, fatG: 8 }
    ],
    2: [
      { foodItemId: "f8", nameVi: "Cháo yến mạch sữa hạnh nhân", nameEn: "Oatmeal with almond milk", imageUrl: null, mealTypeId: 1, quantityG: 220, caloriesKcal: 310, proteinG: 10, carbsG: 48, fatG: 7 },
      { foodItemId: "f9", nameVi: "Quả táo đỏ Mỹ nhập khẩu", nameEn: "Red apple", imageUrl: null, mealTypeId: 1, quantityG: 150, caloriesKcal: 80, proteinG: 0.5, carbsG: 20, fatG: 0.2 },
      { foodItemId: "f10", nameVi: "Thịt thăn bò áp chảo bơ tỏi", nameEn: "Pan-seared beef tenderloin", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 480, proteinG: 44, carbsG: 2, fatG: 32 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f12", nameVi: "Tôm sú tươi hấp sả", nameEn: "Steamed prawns", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 240, proteinG: 36, carbsG: 2, fatG: 3 },
      { foodItemId: "f13", nameVi: "Bún gạo lứt trộn xà lách", nameEn: "Brown rice noodles with salad", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 290, proteinG: 6, carbsG: 58, fatG: 2 },
      { foodItemId: "f14", nameVi: "Hạt hạnh nhân sấy mộc nguyên chất", nameEn: "Roasted almonds", imageUrl: null, mealTypeId: 4, quantityG: 30, caloriesKcal: 180, proteinG: 6, carbsG: 6, fatG: 15 }
    ],
    3: [
      { foodItemId: "f15", nameVi: "Trứng gà luộc chín quả to", nameEn: "Boiled chicken eggs", imageUrl: null, mealTypeId: 1, quantityG: 110, caloriesKcal: 155, proteinG: 13, carbsG: 1.1, fatG: 10.6 },
      { foodItemId: "f16", nameVi: "Khoai lang mật nướng lò", nameEn: "Baked sweet potato", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 210, proteinG: 2.2, carbsG: 48, fatG: 0.3 },
      { foodItemId: "f17", nameVi: "Ức gà áp chảo sốt sả ớt", nameEn: "Spicy chicken breast", imageUrl: null, mealTypeId: 2, quantityG: 220, caloriesKcal: 420, proteinG: 46, carbsG: 8, fatG: 12 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f18", nameVi: "Thịt thăn heo sốt dầu hào lạt", nameEn: "Pork tenderloin with oyster sauce", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 380, proteinG: 38, carbsG: 10, fatG: 15 },
      { foodItemId: "f19", nameVi: "Súp lơ trắng luộc chín", nameEn: "Boiled cauliflower", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 50, proteinG: 3.5, carbsG: 9, fatG: 0.4 },
      { foodItemId: "f20", nameVi: "Sữa chua nếp cẩm ít đường", nameEn: "Yogurt with sticky rice", imageUrl: null, mealTypeId: 4, quantityG: 120, caloriesKcal: 160, proteinG: 4, carbsG: 28, fatG: 3 }
    ],
    4: [
      { foodItemId: "f21", nameVi: "Bánh mì đen kẹp bơ đậu phộng", nameEn: "Black bread with peanut butter", imageUrl: null, mealTypeId: 1, quantityG: 100, caloriesKcal: 340, proteinG: 12, carbsG: 38, fatG: 16 },
      { foodItemId: "f22", nameVi: "Sữa đậu nành nguyên chất", nameEn: "Pure soy milk", imageUrl: null, mealTypeId: 1, quantityG: 200, caloriesKcal: 90, proteinG: 7, carbsG: 8, fatG: 4 },
      { foodItemId: "f23", nameVi: "Bún gạo lứt trộn thịt bò nạc", nameEn: "Brown rice noodles with beef", imageUrl: null, mealTypeId: 2, quantityG: 380, caloriesKcal: 560, proteinG: 32, carbsG: 68, fatG: 14 },
      { foodItemId: "f24", nameVi: "Cá ngừ áp chảo tiêu xanh", nameEn: "Seared tuna with green pepper", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 310, proteinG: 45, carbsG: 0, fatG: 13 },
      { foodItemId: "f25", nameVi: "Khoai tây nghiền sữa tỏi", nameEn: "Mashed potatoes", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 160, proteinG: 3, carbsG: 32, fatG: 2 },
      { foodItemId: "f26", nameVi: "Quả bơ chín dầm không đường", nameEn: "Avocado smoothie", imageUrl: null, mealTypeId: 4, quantityG: 150, caloriesKcal: 240, proteinG: 3, carbsG: 12, fatG: 22 }
    ],
    5: [
      { foodItemId: "f1", nameVi: "Trứng gà ốp la & Bánh mì đen", nameEn: "Fried eggs with black bread", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 320, proteinG: 18, carbsG: 25, fatG: 12 },
      { foodItemId: "f27", nameVi: "Phi lê cá chẽm hấp hành gừng", nameEn: "Steamed seabass fillets", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 260, proteinG: 40, carbsG: 2, fatG: 8 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f28", nameVi: "Rau muống luộc tỏi lạt", nameEn: "Boiled morning glory", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 40, proteinG: 2.5, carbsG: 6, fatG: 0.2 },
      { foodItemId: "f29", nameVi: "Ức gà xào nấm đông cô", nameEn: "Stir-fried chicken breast with mushrooms", imageUrl: null, mealTypeId: 3, quantityG: 220, caloriesKcal: 380, proteinG: 45, carbsG: 12, fatG: 11 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f30", nameVi: "Sinh tố chuối bơ whey protein", nameEn: "Banana avocado whey smoothie", imageUrl: null, mealTypeId: 4, quantityG: 250, caloriesKcal: 320, proteinG: 26, carbsG: 28, fatG: 12 }
    ],
    6: [
      { foodItemId: "f31", nameVi: "Bánh cuốn chay gạo lứt", nameEn: "Brown rice steamed rolls", imageUrl: null, mealTypeId: 1, quantityG: 250, caloriesKcal: 380, proteinG: 8, carbsG: 65, fatG: 4 },
      { foodItemId: "f32", nameVi: "Thịt thăn bò xào hành tây lạt", nameEn: "Stir-fried beef with onion", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 440, proteinG: 42, carbsG: 10, fatG: 24 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f33", nameVi: "Cá hồi áp chảo sốt chanh leo", nameEn: "Salmon with passion fruit sauce", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 410, proteinG: 34, carbsG: 12, fatG: 25 },
      { foodItemId: "f16", nameVi: "Khoai lang mật nướng lò", nameEn: "Baked sweet potato", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 180, proteinG: 1.8, carbsG: 40, fatG: 0.2 },
      { foodItemId: "f34", nameVi: "Sữa chua Hy Lạp & Hạt macca", nameEn: "Greek yogurt with macadamia", imageUrl: null, mealTypeId: 4, quantityG: 150, caloriesKcal: 280, proteinG: 11, carbsG: 12, fatG: 21 }
    ],
    7: [
      { foodItemId: "f35", nameVi: "Bún gạo lứt ức gà xé phay", nameEn: "Brown rice noodles with chicken", imageUrl: null, mealTypeId: 1, quantityG: 350, caloriesKcal: 410, proteinG: 28, carbsG: 55, fatG: 6 },
      { foodItemId: "f36", nameVi: "Tôm rim tỏi ớt tươi", nameEn: "Garlic prawns", imageUrl: null, mealTypeId: 2, quantityG: 180, caloriesKcal: 280, proteinG: 36, carbsG: 4, fatG: 10 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 4.5, carbsG: 45, fatG: 1.8 },
      { foodItemId: "f37", nameVi: "Ức gà áp chảo sốt tiêu đen", nameEn: "Seared chicken breast with black pepper", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 390, proteinG: 44, carbsG: 8, fatG: 11 },
      { foodItemId: "f16", nameVi: "Khoai lang mật nướng lò", nameEn: "Baked sweet potato", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 180, proteinG: 1.8, carbsG: 40, fatG: 0.2 },
      { foodItemId: "f38", nameVi: "Quả táo xanh giòn Mỹ", nameEn: "Green apple", imageUrl: null, mealTypeId: 4, quantityG: 150, caloriesKcal: 70, proteinG: 0.4, carbsG: 18, fatG: 0.1 },
      { foodItemId: "f14", nameVi: "Hạt hạnh nhân sấy mộc nguyên chất", nameEn: "Roasted almonds", imageUrl: null, mealTypeId: 4, quantityG: 20, caloriesKcal: 120, proteinG: 4, carbsG: 4, fatG: 10 }
    ]
  },
  discover_2: { // Eat Clean văn phòng (1200-1400 Cal)
    1: [
      { foodItemId: "f39", nameVi: "Cháo yến mạch nguyên cám", nameEn: "Whole grain oatmeal porridge", imageUrl: null, mealTypeId: 1, quantityG: 200, caloriesKcal: 180, proteinG: 6, carbsG: 32, fatG: 3 },
      { foodItemId: "f9", nameVi: "Quả táo đỏ Mỹ nhập khẩu", nameEn: "Red apple", imageUrl: null, mealTypeId: 1, quantityG: 120, caloriesKcal: 65, proteinG: 0.4, carbsG: 16, fatG: 0.2 },
      { foodItemId: "f40", nameVi: "Bún lứt trộn thịt bò nạc", nameEn: "Brown rice noodles with beef", imageUrl: null, mealTypeId: 2, quantityG: 300, caloriesKcal: 420, proteinG: 24, carbsG: 58, fatG: 8 },
      { foodItemId: "f41", nameVi: "Tôm luộc nước dừa", nameEn: "Steamed prawns in coconut water", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 190, proteinG: 28, carbsG: 1.5, fatG: 2.2 },
      { foodItemId: "f42", nameVi: "Quả su su luộc hấp", nameEn: "Boiled chayote squash", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 35, proteinG: 1.2, carbsG: 7, fatG: 0.1 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 3, quantityG: 100, caloriesKcal: 145, proteinG: 3, carbsG: 30, fatG: 1.2 },
      { foodItemId: "f2", nameVi: "Sữa tươi tiệt trùng không đường", nameEn: "Unsweetened milk", imageUrl: null, mealTypeId: 4, quantityG: 200, caloriesKcal: 120, proteinG: 7, carbsG: 10, fatG: 6 }
    ],
    2: [
      { foodItemId: "f43", nameVi: "Khoai lang luộc chín", nameEn: "Boiled sweet potatoes", imageUrl: null, mealTypeId: 1, quantityG: 150, caloriesKcal: 160, proteinG: 1.5, carbsG: 37, fatG: 0.2 },
      { foodItemId: "f44", nameVi: "Trứng gà luộc quả to", nameEn: "Boiled chicken egg", imageUrl: null, mealTypeId: 1, quantityG: 55, caloriesKcal: 78, proteinG: 6.5, carbsG: 0.6, fatG: 5.3 },
      { foodItemId: "f45", nameVi: "Ức gà luộc xé phay", nameEn: "Shredded chicken breast", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 220, proteinG: 36, carbsG: 0, fatG: 4.5 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 120, caloriesKcal: 175, proteinG: 3.6, carbsG: 36, fatG: 1.4 },
      { foodItemId: "f46", nameVi: "Salad dầu giấm ô liu lạt", nameEn: "Vinaigrette olive salad", imageUrl: null, mealTypeId: 2, quantityG: 100, caloriesKcal: 90, proteinG: 1, carbsG: 4, fatG: 8 },
      { foodItemId: "f47", nameVi: "Cá chép hấp thì là hành", nameEn: "Steamed carp with dill", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 230, proteinG: 30, carbsG: 1, fatG: 11 },
      { foodItemId: "f28", nameVi: "Rau muống luộc tỏi lạt", nameEn: "Boiled morning glory", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 40, proteinG: 2.5, carbsG: 6, fatG: 0.2 },
      { foodItemId: "f48", nameVi: "Quả cam ngọt mọng nước", nameEn: "Sweet orange", imageUrl: null, mealTypeId: 4, quantityG: 150, caloriesKcal: 65, proteinG: 1.2, carbsG: 15, fatG: 0.2 }
    ],
    3: [
      { foodItemId: "f49", nameVi: "Bánh mì nguyên cám nướng", nameEn: "Whole wheat bread toast", imageUrl: null, mealTypeId: 1, quantityG: 60, caloriesKcal: 150, proteinG: 6, carbsG: 28, fatG: 2 },
      { foodItemId: "f50", nameVi: "Bơ đậu phộng organic", nameEn: "Organic peanut butter", imageUrl: null, mealTypeId: 1, quantityG: 15, caloriesKcal: 90, proteinG: 3.5, carbsG: 3, fatG: 8 },
      { foodItemId: "f51", nameVi: "Cơm gạo lứt xào lòng trắng trứng", nameEn: "Brown rice stir-fried with egg whites", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 310, proteinG: 14, carbsG: 50, fatG: 5 },
      { foodItemId: "f52", nameVi: "Đậu cove luộc chín lạt", nameEn: "Boiled green beans", imageUrl: null, mealTypeId: 2, quantityG: 100, caloriesKcal: 35, proteinG: 2, carbsG: 7, fatG: 0.2 },
      { foodItemId: "f53", nameVi: "Đậu hũ non sốt cà chua lạt", nameEn: "Soft tofu with tomato sauce", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 210, proteinG: 16, carbsG: 12, fatG: 10 },
      { foodItemId: "f54", nameVi: "Canh bí đao nấu thịt nạc", nameEn: "Winter melon soup with minced pork", imageUrl: null, mealTypeId: 3, quantityG: 250, caloriesKcal: 120, proteinG: 10, carbsG: 5, fatG: 6 },
      { foodItemId: "f7", nameVi: "Sữa chua Hy Lạp không đường", nameEn: "Greek yogurt", imageUrl: null, mealTypeId: 4, quantityG: 120, caloriesKcal: 110, proteinG: 10, carbsG: 4, fatG: 5 }
    ],
    4: [
      { foodItemId: "f39", nameVi: "Cháo yến mạch nguyên cám", nameEn: "Whole grain oatmeal porridge", imageUrl: null, mealTypeId: 1, quantityG: 200, caloriesKcal: 180, proteinG: 6, carbsG: 32, fatG: 3 },
      { foodItemId: "f55", nameVi: "Hạt chia hữu cơ nhập khẩu", nameEn: "Organic chia seeds", imageUrl: null, mealTypeId: 1, quantityG: 10, caloriesKcal: 50, proteinG: 1.5, carbsG: 4, fatG: 3.5 },
      { foodItemId: "f56", nameVi: "Ức gà áp chảo sốt chanh tươi", nameEn: "Chicken breast with lemon sauce", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 230, proteinG: 35, carbsG: 4, fatG: 8 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 120, caloriesKcal: 175, proteinG: 3.6, carbsG: 36, fatG: 1.4 },
      { foodItemId: "f57", nameVi: "Cá hồi phi lê hấp tương lạt", nameEn: "Steamed salmon fillet", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 280, proteinG: 28, carbsG: 0, fatG: 18 },
      { foodItemId: "f4", nameVi: "Súp lơ xanh hấp chín", nameEn: "Boiled broccoli", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 55, proteinG: 4, carbsG: 10, fatG: 0.6 },
      { foodItemId: "f58", nameVi: "Sữa đậu nành nguyên chất không đường", nameEn: "Unsweetened soy milk", imageUrl: null, mealTypeId: 4, quantityG: 200, caloriesKcal: 80, proteinG: 6, carbsG: 6, fatG: 3 }
    ],
    5: [
      { foodItemId: "f43", nameVi: "Khoai lang luộc chín", nameEn: "Boiled sweet potatoes", imageUrl: null, mealTypeId: 1, quantityG: 150, caloriesKcal: 160, proteinG: 1.5, carbsG: 37, fatG: 0.2 },
      { foodItemId: "f44", nameVi: "Trứng gà luộc quả to", nameEn: "Boiled chicken egg", imageUrl: null, mealTypeId: 1, quantityG: 55, caloriesKcal: 78, proteinG: 6.5, carbsG: 0.6, fatG: 5.3 },
      { foodItemId: "f59", nameVi: "Bún lứt xào lòng mề gà ít dầu", nameEn: "Stir-fried brown rice noodles", imageUrl: null, mealTypeId: 2, quantityG: 280, caloriesKcal: 390, proteinG: 20, carbsG: 55, fatG: 10 },
      { foodItemId: "f60", nameVi: "Bắp cải luộc chín ngọt", nameEn: "Boiled cabbage", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 45, proteinG: 2, carbsG: 9, fatG: 0.2 },
      { foodItemId: "f61", nameVi: "Thịt heo nạc rim dầu hào lạt", nameEn: "Simmered lean pork", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 270, proteinG: 32, carbsG: 2, fatG: 15 },
      { foodItemId: "f62", nameVi: "Canh cải ngọt nấu tôm khô", nameEn: "Cabbage soup with dried shrimps", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 80, proteinG: 8, carbsG: 4, fatG: 1 },
      { foodItemId: "f63", nameVi: "Quả chuối sứ chín ngọt", nameEn: "Banana", imageUrl: null, mealTypeId: 4, quantityG: 100, caloriesKcal: 90, proteinG: 1.1, carbsG: 22, fatG: 0.2 }
    ],
    6: [
      { foodItemId: "f64", nameVi: "Bánh pancake yến mạch chuối tiêu", nameEn: "Oats banana pancake", imageUrl: null, mealTypeId: 1, quantityG: 150, caloriesKcal: 220, proteinG: 7, carbsG: 38, fatG: 4 },
      { foodItemId: "f65", nameVi: "Cá chẽm sốt cà chua quả lạt", nameEn: "Seabass in fresh tomato sauce", imageUrl: null, mealTypeId: 2, quantityG: 180, caloriesKcal: 250, proteinG: 32, carbsG: 6, fatG: 11 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 120, caloriesKcal: 175, proteinG: 3.6, carbsG: 36, fatG: 1.4 },
      { foodItemId: "f66", nameVi: "Ức gà áp chảo sốt mật ong rừng", nameEn: "Honey glazed chicken breast", imageUrl: null, mealTypeId: 3, quantityG: 160, caloriesKcal: 270, proteinG: 36, carbsG: 12, fatG: 6 },
      { foodItemId: "f67", nameVi: "Rau xà lách & Dưa chuột giòn", nameEn: "Lettuce & Cucumber salad", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 35, proteinG: 1, carbsG: 6, fatG: 0.2 },
      { foodItemId: "f68", nameVi: "Quả thanh long ruột trắng ngọt", nameEn: "White dragon fruit", imageUrl: null, mealTypeId: 4, quantityG: 180, caloriesKcal: 90, proteinG: 1.5, carbsG: 20, fatG: 0.4 }
    ],
    7: [
      { foodItemId: "f35", nameVi: "Bún gạo lứt ức gà xé phay", nameEn: "Brown rice noodles with chicken", imageUrl: null, mealTypeId: 1, quantityG: 300, caloriesKcal: 360, proteinG: 25, carbsG: 50, fatG: 5 },
      { foodItemId: "f69", nameVi: "Thịt thăn bò xào măng tây bơ", nameEn: "Stir-fried beef with asparagus", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 280, proteinG: 28, carbsG: 6, fatG: 16 },
      { foodItemId: "f11", nameVi: "Cơm gạo lứt Điện Biên", nameEn: "Brown rice", imageUrl: null, mealTypeId: 2, quantityG: 100, caloriesKcal: 145, proteinG: 3, carbsG: 30, fatG: 1.2 },
      { foodItemId: "f70", nameVi: "Cá thu kho lạt thơm cà chua", nameEn: "Simmered mackerel", imageUrl: null, mealTypeId: 3, quantityG: 130, caloriesKcal: 260, proteinG: 24, carbsG: 2, fatG: 18 },
      { foodItemId: "f71", nameVi: "Rau cải thìa luộc ngọt", nameEn: "Boiled bok choy", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 30, proteinG: 2, carbsG: 4, fatG: 0.1 },
      { foodItemId: "f14", nameVi: "Hạt hạnh nhân sấy mộc nguyên chất", nameEn: "Roasted almonds", imageUrl: null, mealTypeId: 4, quantityG: 15, caloriesKcal: 90, proteinG: 3, carbsG: 3, fatG: 8 }
    ]
  },
  discover_3: { // Keto giảm cân (1000-1200 Cal)
    1: [
      { foodItemId: "f72", nameVi: "Trứng cuộn bơ sáp chín", nameEn: "Omelette with avocado", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 340, proteinG: 14, carbsG: 3, fatG: 30 },
      { foodItemId: "f73", nameVi: "Thịt ba chỉ xông khói áp chảo", nameEn: "Pan-fried bacon", imageUrl: null, mealTypeId: 1, quantityG: 40, caloriesKcal: 160, proteinG: 8, carbsG: 0.5, fatG: 14 },
      { foodItemId: "f74", nameVi: "Salad bơ ức gà sốt mayonnaise", nameEn: "Chicken avocado mayonnaise salad", imageUrl: null, mealTypeId: 2, quantityG: 250, caloriesKcal: 420, proteinG: 32, carbsG: 4, fatG: 31 },
      { foodItemId: "f75", nameVi: "Thăn bò áp chảo sốt bơ tỏi", nameEn: "Beef tenderloin seared in garlic butter", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 440, proteinG: 38, carbsG: 1, fatG: 32 },
      { foodItemId: "f76", nameVi: "Măng tây xào bơ lạt giòn", nameEn: "Stir-fried asparagus with butter", imageUrl: null, mealTypeId: 3, quantityG: 100, caloriesKcal: 85, proteinG: 2, carbsG: 4, fatG: 7 },
      { foodItemId: "f77", nameVi: "Quả hạt macca Úc thơm bùi", nameEn: "Macadamia nuts", imageUrl: null, mealTypeId: 4, quantityG: 25, caloriesKcal: 180, proteinG: 2, carbsG: 3.5, fatG: 19 }
    ],
    2: [
      { foodItemId: "f78", nameVi: "Salad cá ngừ ngâm dầu mè", nameEn: "Tuna salad in olive oil", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 310, proteinG: 24, carbsG: 2, fatG: 23 },
      { foodItemId: "f79", nameVi: "Cá hồi phi lê áp chảo bơ tỏi", nameEn: "Pan-seared salmon with butter", imageUrl: null, mealTypeId: 2, quantityG: 180, caloriesKcal: 430, proteinG: 34, carbsG: 0, fatG: 33 },
      { foodItemId: "f80", nameVi: "Súp lơ xanh xào dầu dừa chín", nameEn: "Stir-fried broccoli in coconut oil", imageUrl: null, mealTypeId: 2, quantityG: 120, caloriesKcal: 90, proteinG: 2.5, carbsG: 5, fatG: 7.5 },
      { foodItemId: "f81", nameVi: "Ba chỉ heo luộc thái mỏng", nameEn: "Boiled pork belly", imageUrl: null, mealTypeId: 3, quantityG: 160, caloriesKcal: 410, proteinG: 22, carbsG: 0.8, fatG: 36 },
      { foodItemId: "f82", nameVi: "Canh cải ngọt thịt băm nạc", nameEn: "Bok choy soup with minced meat", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 90, proteinG: 8, carbsG: 3, fatG: 6 },
      { foodItemId: "f14", nameVi: "Hạt quả óc chó sấy khô bùi", nameEn: "Walnuts", imageUrl: null, mealTypeId: 4, quantityG: 25, caloriesKcal: 165, proteinG: 3.8, carbsG: 3.5, fatG: 16 }
    ],
    3: [
      { foodItemId: "f83", nameVi: "Trứng chiên phô mai Cheddar béo", nameEn: "Omelette with cheddar cheese", imageUrl: null, mealTypeId: 1, quantityG: 150, caloriesKcal: 330, proteinG: 18, carbsG: 1.5, fatG: 28 },
      { foodItemId: "f84", nameVi: "Ức gà chiên bơ măng tây", nameEn: "Fried chicken breast in butter", imageUrl: null, mealTypeId: 2, quantityG: 180, caloriesKcal: 380, proteinG: 40, carbsG: 0, fatG: 24 },
      { foodItemId: "f85", nameVi: "Rau cải thảo xào mỡ heo béo", nameEn: "Stir-fried napa cabbage in lard", imageUrl: null, mealTypeId: 2, quantityG: 150, caloriesKcal: 95, proteinG: 2, carbsG: 6, fatG: 8 },
      { foodItemId: "f86", nameVi: "Sườn heo nướng sốt Keto lạt", nameEn: "Grilled pork ribs Keto style", imageUrl: null, mealTypeId: 3, quantityG: 200, caloriesKcal: 490, proteinG: 32, carbsG: 2, fatG: 40 },
      { foodItemId: "f87", nameVi: "Hạt hồ đào Pecans nhập khẩu", nameEn: "Pecan nuts", imageUrl: null, mealTypeId: 4, quantityG: 25, caloriesKcal: 175, proteinG: 2.3, carbsG: 3.5, fatG: 18 }
    ],
    4: [
      { foodItemId: "f88", nameVi: "Cá hồi hun khói xốt kem phô mai", nameEn: "Smoked salmon with cream cheese", imageUrl: null, mealTypeId: 1, quantityG: 120, caloriesKcal: 290, proteinG: 20, carbsG: 2, fatG: 23 },
      { foodItemId: "f89", nameVi: "Thịt gà đùi nướng giòn Keto", nameEn: "Crispy chicken thighs Keto", imageUrl: null, mealTypeId: 2, quantityG: 180, caloriesKcal: 420, proteinG: 30, carbsG: 1, fatG: 33 },
      { foodItemId: "f90", nameVi: "Canh bí xanh nấu sườn heo ngọt", nameEn: "Winter melon soup with pork ribs", imageUrl: null, mealTypeId: 2, quantityG: 250, caloriesKcal: 130, proteinG: 8, carbsG: 4, fatG: 10 },
      { foodItemId: "f91", nameVi: "Thịt ba chỉ heo quay giòn bì béo", nameEn: "Crispy roasted pork belly", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 480, proteinG: 21, carbsG: 0.5, fatG: 44 },
      { foodItemId: "f92", nameVi: "Hạt hạnh nhân sấy bơ mộc", nameEn: "Roasted butter almonds", imageUrl: null, mealTypeId: 4, quantityG: 25, caloriesKcal: 160, proteinG: 5, carbsG: 5, fatG: 14 }
    ],
    5: [
      { foodItemId: "f72", nameVi: "Trứng cuộn bơ sáp chín", nameEn: "Omelette with avocado", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 340, proteinG: 14, carbsG: 3, fatG: 30 },
      { foodItemId: "f93", nameVi: "Salad bò áp chảo dầu olive giấm", nameEn: "Pan-seared beef salad with olive oil", imageUrl: null, mealTypeId: 2, quantityG: 230, caloriesKcal: 410, proteinG: 30, carbsG: 4, fatG: 31 },
      { foodItemId: "f94", nameVi: "Cá hồi phi lê kho lạt Keto", nameEn: "Simmered salmon Keto", imageUrl: null, mealTypeId: 3, quantityG: 160, caloriesKcal: 390, proteinG: 30, carbsG: 1, fatG: 30 },
      { foodItemId: "f95", nameVi: "Rau cải ngọt xào mỡ tỏi lạt", nameEn: "Stir-fried bok choy in lard", imageUrl: null, mealTypeId: 3, quantityG: 150, caloriesKcal: 85, proteinG: 2, carbsG: 4, fatG: 7.5 },
      { foodItemId: "f77", nameVi: "Quả hạt macca Úc thơm bùi", nameEn: "Macadamia nuts", imageUrl: null, mealTypeId: 4, quantityG: 25, caloriesKcal: 180, proteinG: 2, carbsG: 3.5, fatG: 19 }
    ],
    6: [
      { foodItemId: "f96", nameVi: "Sữa chua Hy Lạp dầm bơ chín", nameEn: "Greek yogurt with avocado", imageUrl: null, mealTypeId: 1, quantityG: 200, caloriesKcal: 260, proteinG: 11, carbsG: 8, fatG: 21 },
      { foodItemId: "f97", nameVi: "Đùi gà nướng bơ tỏi thảo mộc", nameEn: "Roasted chicken thigh with herbs", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 450, proteinG: 32, carbsG: 1.5, fatG: 35 },
      { foodItemId: "f98", nameVi: "Thịt thăn bò sốt phô mai béo", nameEn: "Beef tenderloin with blue cheese sauce", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 470, proteinG: 36, carbsG: 2, fatG: 36 },
      { foodItemId: "f99", nameVi: "Hạt bí đỏ rang muối giòn", nameEn: "Roasted pumpkin seeds", imageUrl: null, mealTypeId: 4, quantityG: 30, caloriesKcal: 170, proteinG: 9, carbsG: 4, fatG: 14 }
    ],
    7: [
      { foodItemId: "f72", nameVi: "Trứng cuộn bơ sáp chín", nameEn: "Omelette with avocado", imageUrl: null, mealTypeId: 1, quantityG: 180, caloriesKcal: 340, proteinG: 14, carbsG: 3, fatG: 30 },
      { foodItemId: "f100", nameVi: "Mực ống nhồi thịt nạc hấp chín", nameEn: "Steamed stuffed squids", imageUrl: null, mealTypeId: 2, quantityG: 200, caloriesKcal: 310, proteinG: 36, carbsG: 5, fatG: 16 },
      { foodItemId: "f101", nameVi: "Sườn heo rim bơ tỏi nước mắm lạt", nameEn: "Garlic butter pork ribs", imageUrl: null, mealTypeId: 3, quantityG: 180, caloriesKcal: 460, proteinG: 28, carbsG: 2, fatG: 38 },
      { foodItemId: "f76", nameVi: "Măng tây xào bơ lạt giòn", nameEn: "Stir-fried asparagus with butter", imageUrl: null, mealTypeId: 3, quantityG: 100, caloriesKcal: 85, proteinG: 2, carbsG: 4, fatG: 7 },
      { foodItemId: "f14", nameVi: "Hạt quả óc chó sấy khô bùi", nameEn: "Walnuts", imageUrl: null, mealTypeId: 4, quantityG: 20, caloriesKcal: 130, proteinG: 3, carbsG: 3, fatG: 12 }
    ]
  }
};

export default function MenuDetailScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ menuId?: string }>();
  const menuId = params.menuId ?? "";

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");
  
  // Interactive UI States
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState<"meals" | "ingredients">("meals");
  const [isWeeklyIngredients, setIsWeeklyIngredients] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const triggerToast = (msg: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
  };

  // Mock data for discover menus to show UI capabilities
  const isDiscoverMock = menuId.startsWith("discover_");
  
  const { data: allMenus, isLoading } = useQuery({
    queryKey: ["menus", "my-plans"],
    queryFn: menuService.getMyPlans,
    enabled: !isDiscoverMock, // Don't fetch if it's a mock
  });

  // Find real menu or create mock menu
  let menu: MenuResponse | undefined = allMenus?.find((m) => m.id === menuId);

  if (isDiscoverMock) {
    menu = {
      id: menuId,
      userId: "mock",
      name: menuId === "discover_1" 
        ? "Meal plan chuẩn gym: Tăng cơ, Giảm mỡ" 
        : menuId === "discover_2"
          ? "Eat Clean dành cho dân văn phòng"
          : "Thực đơn Keto giảm cân cấp tốc",
      description: "Được thiết kế chuyên biệt để đáp ứng tối đa mục tiêu sức khỏe và tối ưu hóa thời gian chuẩn bị. Thực đơn áp dụng công thức đơn giản, cân đối dải dưỡng chất đa lượng vĩ mô (Macros) chuẩn xác, giúp duy trì năng lượng suốt ngày dài hoạt động.\n\nĐặc điểm nổi bật:\n- Phù hợp với lối sống hiện đại, dễ dàng chế biến.\n- Hạn chế muối, chất béo xấu và tinh bột hấp thu nhanh.\n- Đầy đủ dưỡng chất, vitamin và khoáng chất cần thiết.",
      createdAt: new Date().toISOString(),
      coverImageUrl: "",
      totalCalories: 2043,
      totalProtein: 194.2,
      totalCarbs: 188.9,
      totalFat: 57,
      foods: [] // will be overwritten dynamically by activeFoods
    };
  }


  const applyMutation = useMutation({
    mutationFn: () => {
      const today = new Date().toISOString().split("T")[0];
      return menuService.applyDailyPlan(menuId, today);
    },
    onSuccess: () => {
      triggerToast("Đã áp dụng thực đơn vào kế hoạch hôm nay! ✅", "success");
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
    onError: () => {
      triggerToast("Không thể áp dụng. Thử lại sau.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => menuService.deleteMenu(menuId),
    onSuccess: () => {
      triggerToast("Đã xóa thực đơn.", "info");
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      setTimeout(() => router.back(), 1200);
    },
    onError: () => {
      triggerToast("Không thể xóa. Thử lại sau.", "error");
    },
  });

  const handleApplyToday = () => {
    Alert.alert(
      "Áp dụng thực đơn",
      "Bạn muốn áp dụng thực đơn này vào kế hoạch ăn hôm nay không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Áp dụng", 
          onPress: () => {
            if (isDiscoverMock) {
              triggerToast(`Đã áp dụng thực đơn Ngày ${selectedDay} vào kế hoạch hôm nay! ✅`, "success");
            } else {
              applyMutation.mutate();
            }
          }
        },
      ]
    );
  };

  const activeFoods = useMemo(() => {
    if (isDiscoverMock) {
      return MOCK_FOODS_DATABASE[menuId]?.[selectedDay] ?? [];
    }
    return menu?.foods ?? [];
  }, [isDiscoverMock, menuId, selectedDay, menu?.foods]);

  const activeTotals = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0;
    activeFoods.forEach((f) => {
      cal += f.caloriesKcal;
      pro += f.proteinG;
      carb += f.carbsG;
      fat += f.fatG;
    });
    return {
      calories: Math.round(cal),
      protein: Math.round(pro * 10) / 10,
      carbs: Math.round(carb * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [activeFoods]);

  const consolidatedIngredients = useMemo(() => {
    if (!isWeeklyIngredients) {
      // Daily: just return the foods of the active day
      return activeFoods.map((f) => ({
        id: f.foodItemId + "_" + selectedDay,
        nameVi: f.nameVi,
        nameEn: f.nameEn,
        quantityG: f.quantityG,
        imageUrl: f.imageUrl,
        foodItemId: f.foodItemId,
      }));
    } else {
      // Weekly: aggregate all foods across days 1 to 7
      const aggMap: Record<string, { nameVi: string; nameEn: string; quantityG: number; foodItemId: string }> = {};
      
      const allDays = isDiscoverMock ? [1, 2, 3, 4, 5, 6, 7] : [1];
      
      allDays.forEach((dayNum) => {
        const dayFoods = isDiscoverMock
          ? (MOCK_FOODS_DATABASE[menuId]?.[dayNum] ?? [])
          : (menu?.foods ?? []);
          
        dayFoods.forEach((f) => {
          const key = f.nameVi.trim();
          if (aggMap[key]) {
            aggMap[key].quantityG += f.quantityG;
          } else {
            aggMap[key] = {
              nameVi: f.nameVi,
              nameEn: f.nameEn,
              quantityG: f.quantityG,
              foodItemId: f.foodItemId,
            };
          }
        });
      });
      
      return Object.values(aggMap).map((item: any) => ({
        id: "weekly_" + item.nameVi,
        nameVi: item.nameVi,
        nameEn: item.nameEn,
        quantityG: item.quantityG,
        imageUrl: null,
        foodItemId: item.foodItemId,
      }));
    }
  }, [isWeeklyIngredients, activeFoods, selectedDay, menuId, menu?.foods, isDiscoverMock]);

  const totalCount = consolidatedIngredients.length;
  const checkedCount = consolidatedIngredients.filter((item) => checkedIngredients[item.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleShareList = async () => {
    try {
      const titleText = isWeeklyIngredients
        ? `🛒 DANH SÁCH MUA SẮM CẢ TUẦN - ${menu?.name}`
        : `🛒 DANH SÁCH MUA SẮM NGÀY ${selectedDay} - ${menu?.name}`;
        
      const itemsList = consolidatedIngredients.map((item, index) => {
        const isChecked = checkedIngredients[item.id] ? "[x]" : "[ ]";
        return `${index + 1}. ${isChecked} ${item.nameVi}: ${Math.round(item.quantityG)}g`;
      }).join("\n");
      
      const shareMessage = `${titleText}\n\n${itemsList}\n\nĐược tạo bởi ứng dụng Wao Nutrition.`;
      
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      triggerToast("Không thể chia sẻ danh sách", "error");
    }
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!menu) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không tìm thấy thực đơn</Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtnSolo, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  const mealGroups: Record<number, MenuFoodItem[]> = {};
  for (const food of activeFoods) {
    const key = food.mealTypeId;
    if (!mealGroups[key]) mealGroups[key] = [];
    mealGroups[key].push(food);
  }

  return (
    <SafeScreen scrollable>
      <View style={styles.container}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            Chi tiết Thực đơn
          </Text>
          <TouchableOpacity onPress={handleShareList} style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Info & Description */}
        <View style={styles.infoSection}>
          <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{menu.name}</Text>
          {menu.description ? (
            <View>
              <Text 
                style={[styles.menuDesc, { color: colors.textSecondary }]}
                numberOfLines={isDescExpanded ? undefined : 3}
              >
                {menu.description}
              </Text>
              <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={styles.expandBtn}>
                <Text style={[styles.expandText, { color: colors.primary }]}>
                  {isDescExpanded ? "Ẩn bớt" : "Xem thêm"}
                </Text>
                <Ionicons name={isDescExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Day Selector */}
        <HorizontalDaySelector 
          days={7} 
          selectedDay={selectedDay} 
          onSelectDay={(day) => {
            setSelectedDay(day);
            // Reset daily checklist status when shifting days
            if (!isWeeklyIngredients) {
              setCheckedIngredients({});
            }
          }} 
        />

        {/* Sub-tab Switcher */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === "meals" && styles.subTabActiveButton]}
            onPress={() => setActiveSubTab("meals")}
          >
            <Ionicons
              name="restaurant-outline"
              size={18}
              color={activeSubTab === "meals" ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.subTabText, activeSubTab === "meals" && styles.subTabActiveText]}>
              Chi tiết bữa ăn
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.subTabButton, activeSubTab === "ingredients" && styles.subTabActiveButton]}
            onPress={() => setActiveSubTab("ingredients")}
          >
            <Ionicons
              name="basket-outline"
              size={18}
              color={activeSubTab === "ingredients" ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.subTabText, activeSubTab === "ingredients" && styles.subTabActiveText]}>
              Nguyên liệu đi chợ
            </Text>
          </TouchableOpacity>
        </View>

        {activeSubTab === "meals" ? (
          <View>
            {/* Macro Pie Chart */}
            <MacroPieChart 
              calories={activeTotals.calories}
              protein={activeTotals.protein}
              carbs={activeTotals.carbs}
              fat={activeTotals.fat}
            />

            {/* Action Button for Today */}
            <TouchableOpacity
              onPress={handleApplyToday}
              style={styles.applyBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#A56CFF", "#6236FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyBtnGradient}
              >
                <Text style={styles.applyBtnText}>Áp dụng ngày {selectedDay} vào hôm nay</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Meals List */}
            <View style={styles.mealsSection}>
              {[1, 2, 3, 4].map((mealTypeId) => {
                const foods = mealGroups[mealTypeId];
                if (!foods || foods.length === 0) return null;
                const mealCals = foods.reduce((s, f) => s + f.caloriesKcal, 0);

                return (
                  <View key={mealTypeId} style={styles.mealGroup}>
                    <View style={styles.mealGroupHeader}>
                      <Text style={[styles.mealGroupTitle, { color: colors.textPrimary }]}>
                        {MEAL_TYPE_NAMES[mealTypeId]}
                      </Text>
                      <Text style={[styles.mealGroupCals, { color: colors.textSecondary }]}>
                        {Math.round(mealCals)} calo
                      </Text>
                    </View>

                    {foods.map((food, idx) => (
                      <View key={idx} style={[styles.foodCard, { backgroundColor: colors.surface }]}>
                        <Image 
                          source={{ uri: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop&sig=${idx + selectedDay}` }} 
                          style={styles.foodThumb} 
                        />
                        <View style={styles.foodInfo}>
                          <Text style={[styles.foodName, { color: colors.textPrimary }]} numberOfLines={2}>
                            {food.nameVi}
                          </Text>
                          <Text style={[styles.foodSub, { color: colors.textSecondary }]}>
                            {food.quantityG}g • {Math.round(food.caloriesKcal)} cal
                          </Text>
                          
                          <View style={styles.foodMacrosRow}>
                            <View style={styles.macroBadge}>
                              <Ionicons name="flash" size={10} color="#FF3B30" />
                              <Text style={[styles.macroBadgeText, { color: colors.textPrimary }]}>{Math.round(food.proteinG)}g Đạm</Text>
                            </View>
                            <View style={styles.macroBadge}>
                              <Ionicons name="leaf" size={10} color="#34C759" />
                              <Text style={[styles.macroBadgeText, { color: colors.textPrimary }]}>{Math.round(food.carbsG)}g Tinh bột</Text>
                            </View>
                            <View style={styles.macroBadge}>
                              <Ionicons name="water" size={10} color="#FFCC00" />
                              <Text style={[styles.macroBadgeText, { color: colors.textPrimary }]}>{Math.round(food.fatG)}g Béo</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.ingredientsSection}>
            {/* Day/Week Selector toggle */}
            <View style={styles.ingredientToggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isWeeklyIngredients && styles.toggleBtnActive]}
                onPress={() => setIsWeeklyIngredients(false)}
              >
                <Text style={[styles.toggleBtnText, !isWeeklyIngredients && styles.toggleBtnTextActive]}>
                  Theo ngày này (Ngày {selectedDay})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isWeeklyIngredients && styles.toggleBtnActive]}
                onPress={() => setIsWeeklyIngredients(true)}
              >
                <Text style={[styles.toggleBtnText, isWeeklyIngredients && styles.toggleBtnTextActive]}>
                  Cả tuần (7 ngày)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Shopping Progress */}
            <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
              <View style={styles.progressHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>
                    Tiến độ chuẩn bị
                  </Text>
                  <Text style={[styles.progressSubtitle, { color: colors.textSecondary }]}>
                    Đã chuẩn bị {checkedCount} / {totalCount} nguyên liệu ({progressPercent}%)
                  </Text>
                </View>
                <TouchableOpacity onPress={handleShareList} style={styles.shareListBtn}>
                  <Ionicons name="share-outline" size={16} color="#fff" />
                  <Text style={styles.shareListBtnText}>Gửi đi chợ</Text>
                </TouchableOpacity>
              </View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
              </View>
            </View>

            {/* Description note */}
            <Text style={[styles.shoppingNote, { color: colors.textSecondary }]}>
              Đánh dấu những thực phẩm bạn đã chuẩn bị sẵn để dễ dàng đi chợ mua sắm các nguyên liệu còn thiếu.
            </Text>

            {/* List of ingredients */}
            <View style={styles.ingredientsList}>
              {consolidatedIngredients.map((item) => {
                const isChecked = !!checkedIngredients[item.id];
                
                // We'll generate nice mock food icons or images using foodItemId
                const indexHash = item.foodItemId.charCodeAt(0) + item.nameVi.charCodeAt(1);
                const thumbUri = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop&sig=${indexHash % 100}`;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setCheckedIngredients((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }));
                    }}
                    style={[
                      styles.ingredientItemRow,
                      { backgroundColor: colors.surface },
                      isChecked && styles.ingredientItemRowChecked,
                    ]}
                  >
                    <Image source={{ uri: thumbUri }} style={[styles.ingredientThumb, isChecked && { opacity: 0.6 }]} />
                    <View style={styles.ingredientInfo}>
                      <Text
                        style={[
                          styles.ingredientName,
                          { color: colors.textPrimary },
                          isChecked && styles.textThroughMuted,
                        ]}
                        numberOfLines={1}
                      >
                        {item.nameVi}
                      </Text>
                      <Text style={[styles.ingredientWeight, { color: colors.textSecondary }]}>
                        Định lượng: {Math.round(item.quantityG)}g
                      </Text>
                    </View>
                    
                    <View style={[styles.checkboxContainer, isChecked && styles.checkboxContainerChecked]}>
                      {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {consolidatedIngredients.length === 0 && (
                <Text style={{ textAlign: "center", color: colors.textSecondary, marginVertical: spacing.xl }}>
                  Không có nguyên liệu nào.
                </Text>
              )}
            </View>
          </View>
        )}

        {!isDiscoverMock && (
          <TouchableOpacity onPress={() => deleteMutation.mutate()} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Xóa thực đơn này</Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast visible={showToast} message={toastMessage} type={toastType} duration={2500} onHide={() => setShowToast(false)} />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    fontSize: 16,
  },
  backBtnSolo: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  menuTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  menuDesc: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 22,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: 4,
  },
  expandText: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  applyBtn: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    shadowColor: "#6236FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyBtnGradient: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    ...typography.bodyStrong,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  mealsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  mealGroup: {
    gap: spacing.md,
  },
  mealGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: spacing.xs,
  },
  mealGroupTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: "700",
  },
  mealGroupCals: {
    ...typography.body,
    fontSize: 14,
  },
  foodCard: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodThumb: {
    width: 70,
    height: 70,
    borderRadius: radius.sm,
    backgroundColor: "#444",
  },
  foodInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  foodName: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  foodSub: {
    ...typography.caption,
    fontSize: 13,
  },
  foodMacrosRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 4,
  },
  macroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  macroBadgeText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: "600",
  },
  deleteBtn: {
    marginTop: spacing.xxl,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: radius.pill,
  },
  deleteBtnText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  subTabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: "#1C1C1E",
    borderRadius: radius.md,
    padding: 3,
  },
  subTabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  subTabActiveButton: {
    backgroundColor: "#2C2C2E",
  },
  subTabText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: "600",
  },
  subTabActiveText: {
    color: "#fff",
  },
  ingredientsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  ingredientToggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "transparent",
  },
  toggleBtnActive: {
    backgroundColor: "#A56CFF",
    borderColor: "#A56CFF",
  },
  toggleBtnText: {
    ...typography.body,
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  toggleBtnTextActive: {
    color: "#fff",
  },
  progressCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: {
    ...typography.bodyStrong,
    fontSize: 15,
  },
  progressSubtitle: {
    ...typography.caption,
    fontSize: 13,
    marginTop: 2,
  },
  shareListBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A3A3C",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: 4,
  },
  shareListBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#2C2C2E",
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.pill,
  },
  shoppingNote: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: spacing.xs,
  },
  ingredientsList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ingredientItemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  ingredientItemRowChecked: {
    opacity: 0.5,
  },
  ingredientThumb: {
    width: 50,
    height: 50,
    borderRadius: radius.sm,
    backgroundColor: "#444",
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    ...typography.bodyStrong,
    fontSize: 14,
  },
  ingredientWeight: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainerChecked: {
    backgroundColor: "#30D158",
    borderColor: "#30D158",
  },
  textThroughMuted: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
});
