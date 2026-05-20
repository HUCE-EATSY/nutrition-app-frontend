import { DiaryDaySummary, MealPlan, Testimonial } from "@/constants/types/contracts";
import { getTodayDateISO, hourLabel } from "@/hooks/utils/date";

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
