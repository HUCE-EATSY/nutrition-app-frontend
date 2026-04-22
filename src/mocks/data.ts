import { DiaryDaySummary, MealPlan, Testimonial } from "@/src/types/contracts";
import { getTodayDateISO, hourLabel } from "@/src/utils/date";

const baseDateISO = getTodayDateISO();

export const testimonials: Testimonial[] = [
  {
    id: "1",
    authorName: "Hà Anh",
    rating: 5,
    title: "Dễ theo sát mục tiêu",
    content: "Flow onboarding rất mượt, mình hiểu ngay lượng calo và macro cần tập trung.",
  },
  {
    id: "2",
    authorName: "Minh Quân",
    rating: 5,
    title: "Cảm giác như có coach riêng",
    content: "Dashboard đẹp, soi chỉ số nhanh và không bị quá y khoa.",
  },
  {
    id: "3",
    authorName: "Bảo Ngọc",
    rating: 4,
    title: "Một tay vẫn dùng tốt",
    content: "CTA rõ ràng, thao tác dễ, hợp với việc check nhanh trong ngày.",
  },
];

export const diarySummary: DiaryDaySummary = {
  dateISO: baseDateISO,
  targetCalories: 1850,
  consumedCalories: 1260,
  targetProteinGram: 135,
  consumedProteinGram: 84,
  targetCarbGram: 170,
  consumedCarbGram: 123,
  targetFatGram: 60,
  consumedFatGram: 38,
  slots: Array.from({ length: 15 }, (_, index) => index + 7).map((hour) => ({
    hour,
    entries:
      hour === 8
        ? [
              {
                id: "breakfast",
                dateISO: baseDateISO,
                hour,
                title: "Chuối",
                calories: 340,
                proteinGram: 18,
                carbGram: 46,
              fatGram: 9,
              type: "meal",
            },
          ]
        : hour === 13
          ? [
              {
                id: "lunch",
                dateISO: baseDateISO,
                hour,
                title: "Ức gà, cơm gạo lứt và salad",
                calories: 510,
                proteinGram: 42,
                carbGram: 58,
                fatGram: 12,
                type: "meal",
              },
            ]
          : hour === 16
            ? [
                {
                  id: "snack",
                  dateISO: baseDateISO,
                  hour,
                  title: "Sữa chua Hy Lạp",
                  calories: 180,
                  proteinGram: 16,
                  carbGram: 14,
                  fatGram: 5,
                  type: "snack",
                },
              ]
            : [],
  })),
};

export const mealPlanMock: MealPlan[] = [
  {
    id: "template-1",
    title: "Siết gọn",
    totalCalories: 1820,
    meals: [
      { id: "meal-1", name: "Bữa sáng giàu protein", timeLabel: hourLabel(8), calories: 380 },
      { id: "meal-2", name: "Bữa trưa giữ no lâu", timeLabel: hourLabel(12), calories: 540 },
      { id: "meal-3", name: "Bữa tối gọn nhẹ", timeLabel: hourLabel(19), calories: 480 },
    ],
    source: "template",
  },
];
