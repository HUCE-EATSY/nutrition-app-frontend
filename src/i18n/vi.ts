import { ActivityLevel, BMIStatus, GoalType } from "@/src/types/contracts";

const goalTypeLabels: Record<GoalType, string> = {
  lose_weight: "Giảm cân",
  maintain_weight: "Giữ dáng",
  gain_weight: "Tăng cân",
};

const bmiStatusLabels: Record<BMIStatus, string> = {
  underweight: "Thiếu cân",
  normal: "Cân bằng",
  overweight: "Thừa cân",
  obese: "Cao",
};

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Rất ít vận động",
  light: "Vận động nhẹ",
  moderate: "Ổn định",
  active: "Năng động",
  very_active: "Cường độ cao",
};

export const vi = {
  locale: "vi-VN",
  common: {
    continue: "Tiếp tục",
    back: "Quay lại",
    close: "Đóng",
    today: "Hôm nay",
    none: "Không có",
    loadingConnection: "Đang kết nối...",
  },
  app: {
    initializing: "Đang khởi tạo ứng dụng...",
  },
  navigation: {
    home: "Trang chủ",
    diary: "Nhật ký",
    mealPlan: "Bữa ăn",
    account: "Tài khoản",
  },
  auth: {
    welcome: {
      heroEmoji: "🐱",
      heroTitle: "Bạn đồng hành macro",
      heroSubtitle: "dễ thương nhưng nghiêm túc với lộ trình của bạn",
      title: "Lên lộ trình dinh dưỡng thông minh cho từng ngày của bạn.",
      description: "Onboarding trò chuyện tự nhiên, giao diện tối gọn và dashboard dễ đọc trên mobile.",
      cta: "Bắt đầu hành trình",
    },
    social: {
      title: "Đăng nhập nhanh để lưu hành trình dinh dưỡng của bạn.",
      description: "",
      google: "Tiếp tục với Google",
      facebook: "Tiếp tục với Facebook",
      legal: "Bằng cách tiếp tục, bạn đồng ý với chính sách riêng tư và điều khoản sử dụng của DNT.",
    },
    mascot: {
      bubble: "Xin chào! Mình là bạn đồng hành của bạn từ ngày hôm nay",
      heroEmoji: "🐱",
      topBadge: "⚡",
      bottomBadge: "🥗",
      badges: ["👑", "⭐", "🔥", "📅"],
      cta: "Chào bạn nha!",
    },
  },
  quickAdd: {
    title: "Thêm nhanh",
    cardTitle: "Tuyến điều hướng đã sẵn sàng",
    selectedDate: (value: string) => `Ngày đã chọn: ${value}`,
    hour: (value: string) => `Khung giờ: ${value}`,
  },
  webview: {
    title: "Trình duyệt",
    cardTitle: "Tuyến tạm",
    url: (value: string) => `URL: ${value}`,
    description: "Sẽ thay bằng webview native khi phạm vi backend hoặc pháp lý được chốt.",
  },
  home: {
    kicker: "Trang chủ v1",
    title: (nickname: string) => `Chào ${nickname}, hôm nay mình ưu tiên dựng flow và khung giao diện cho DNT.`,
    focusTitle: "Trọng tâm hiện tại",
    focusBody: "Trang chủ chưa có dữ liệu thật nên v1 được giữ gọn: ít khối, rõ hướng đi và dễ mở rộng sau.",
    actionsTitle: "Hành động nên làm tiếp",
    actionOne: "1. Mở Thêm nhanh để xem modal tạm.",
    actionTwo: "2. Vào Nhật ký để xem timeline theo giờ.",
    actionThree: "3. Xem Bữa ăn để chốt trạng thái rỗng và CTA.",
    cta: "Mở nhật ký ngay",
    defaultNickname: "bạn",
  },
  diary: {
    kicker: "Nhật ký",
    add: "+ Thêm",
    calories: "Calo",
    protein: "Protein",
    carb: "Carb",
    fat: "Chất béo",
    emptyTitle: "Chưa có món nào được thêm",
    emptyHint: "Nhấn + để thêm nhanh vào khung giờ này",
    summary: (count: number, calories: number) => `${count} mục • ${calories} kcal`,
  },
  mealPlan: {
    tabs: {
      explore: "Khám phá",
      saved: "Đã lưu",
      history: "Gần đây",
    },
    title: "Meal plan AI đang chờ dữ liệu để bắt đầu ở bản v1.",
    description: "Màn này giữ segmented tabs thật để về sau nối state mà không phải đổi lại bố cục.",
    emptyEmoji: "🥗",
    emptyTitle: "Chưa có thực đơn được tạo",
    emptyBody: "CTA bên dưới là placeholder có chủ đích cho AI meal planning engine và kho template về sau.",
    createCta: "Tạo meal plan bằng AI",
    savedCta: "Mở từ thư viện đã lưu",
  },
  account: {
    title: "Tài khoản",
    defaultName: "Người dùng DNT",
    defaultInitial: "D",
    subline: "Macro starter • vào từ luồng onboarding",
    upgrade: "Nâng cấp",
    trialTitle: "Mở báo cáo chi tiết và lời nhắc thông minh trong 7 ngày.",
    quickStats: "Thông số nhanh",
    age: "Tuổi",
    height: "Chiều cao",
    weight: "Cân nặng",
    macroGoals: "Mục tiêu macro",
    macroGoalsBody: "Protein được ưu tiên cao; meal plan và nhật ký sẽ bám theo target từ plan result.",
    supportTitle: "Hỗ trợ",
    supportLabel: "Trung tâm hỗ trợ",
    policyTitle: "Chính sách",
    policyLabel: "Chính sách riêng tư",
  },
  onboarding: {
    questions: {
      Nickname: "Bạn muốn mình gọi bạn là gì?",
      Gender: "Bạn thuộc giới tính nào?",
      BirthDate: "Ngày sinh của bạn là khi nào?",
      Height: "Chiều cao hiện tại của bạn?",
      GoalType: "Mục tiêu của bạn là gì?",
      CurrentWeight: "Cân nặng hiện tại của bạn?",
      TargetWeight: "Bạn muốn đặt mốc cân nặng nào?",
      ActivityLevel: "Mức vận động hằng ngày của bạn?",
      WeeklyGoal: "Bạn muốn tiến độ mỗi tuần nhanh đến đâu?",
      ReviewSummary: "Mình đã gom đủ dữ liệu để lên khung cho bạn rồi.",
      Calculating: "Đang tính toán hồ sơ dinh dưỡng.",
      PlanResult: "Đây là lộ trình bắt đầu của bạn.",
    },
    nicknameHint: "Tên gọi này sẽ được dùng trong dashboard và nhắc nhở hằng ngày.",
    nicknamePlaceholder: "Nhập biệt danh",
    birthDateHint: "Thông tin này giúp chúng tôi tính toán nhu cầu dinh dưỡng chính xác hơn.",
    targetWeightHint: "DNT sẽ dựa vào mốc này để dự tính ngày đạt mục tiêu và chênh lệch calo.",
    weeklyGoalHint: "Mục tiêu nhanh hơn đồng nghĩa với biên độ calo lớn hơn, ưu tiên mức có thể giữ đều.",
    reviewContinue: "Tính cho mình",
    reviewInputProfile: "Hồ sơ đầu vào",
    reviewNickname: "Biệt danh",
    reviewAge: "Tuổi",
    reviewHeight: "Chiều cao",
    reviewCurrent: "Hiện tại",
    reviewGoal: "Mục tiêu",
    reviewTarget: "Đích đến",
    reviewCurrentBmi: "BMI hiện tại",
    reviewQuickPreview: "Xem nhanh",
    reviewTargetCalories: (value: number) => `Mục tiêu calo: ${value} kcal/ngày`,
    reviewMacroSplit: (protein: number, carb: number, fat: number) =>
      `Tỷ lệ macro ưu tiên: ${protein}/${carb}/${fat}`,
    bmiSegments: {
      under: "Thấp",
      normal: "Cân bằng",
      over: "Tăng",
      obese: "Cao",
    },
    wheelDate: {
      day: "Ngày",
      month: "Tháng",
      year: "Năm",
    },
    weeklyGoal: {
      perWeek: "/ tuần",
      estimatedDailyCalories: (value: number) => `Ước tính chênh lệch mỗi ngày: ${value} kcal`,
      helper: "Chọn mức tiến độ mà bạn có thể duy trì ít nhất 6-8 tuần.",
    },
    calculating: {
      title: "Đang tính toán lộ trình cá nhân cho hồ sơ của bạn.",
      description: "Mỗi bước được tách riêng để sau này dễ backend hóa và gắn analytics.",
      labels: ["Đọc hồ sơ và mục tiêu", "Tính chỉ số trao đổi chất", "Cân bằng calo và macro"],
      testimonialKicker: "Người dùng thử nghiệm",
      testimonialMeta: (author: string, rating: number) => `${author} • ${rating}/5`,
    },
    planResult: {
      title: "Bạn đã có khung calo và macro để bắt đầu ngay hôm nay.",
      heroKicker: "Mốc mục tiêu",
      heroDescription: "Nếu giữ nhịp hiện tại, bạn sẽ chạm mốc mục tiêu vào khoảng thời gian trên.",
      dailyTarget: "Mục tiêu ngày",
      dailyTargetHelper: "Đã tính theo BMR + vận động",
      weeklyTarget: "Mục tiêu tuần",
      weeklyTargetHelper: "Tổng khung 7 ngày",
      metabolism: "Trao đổi chất",
      metabolismHelper: "BMR cơ bản",
      adjustment: "Điều chỉnh",
      surplusDaily: "Thặng dư mỗi ngày",
      deltaDaily: "Chênh lệch mỗi ngày",
      macroSplit: "Tỷ lệ macro",
      roadmapTitle: "Lộ trình v1",
      roadmapBody: "Trang chủ và Thêm nhanh vẫn là bản tạm, nhưng nhật ký, trạng thái rỗng của bữa ăn và tài khoản đã có hướng đi rõ ràng.",
      cta: "Bắt đầu hành trình",
    },
    genderOptions: {
      female: {
        title: "Nữ",
        subtitle: "Tập trung vào giữ dáng và cân bằng năng lượng",
      },
      male: {
        title: "Nam",
        subtitle: "Tăng cơ, giảm mỡ và giữ sức bền",
      },
    },
    goalOptions: {
      lose_weight: {
        title: "Giảm cân",
        subtitle: "Cắt nhẹ calo, giữ nhịp độ ổn định",
      },
      maintain_weight: {
        title: "Giữ dáng",
        subtitle: "Cân bằng năng lượng và macro",
      },
      gain_weight: {
        title: "Tăng cân",
        subtitle: "Tăng surplus sạch để lên cơ",
      },
    },
    activityOptions: {
      sedentary: {
        title: "Rất ít vận động",
        subtitle: "Làm việc bàn giấy, tập rất ít",
      },
      light: {
        title: "Vận động nhẹ",
        subtitle: "Đi bộ, tập 1-2 buổi mỗi tuần",
      },
      moderate: {
        title: "Ổn định",
        subtitle: "Tập 3-4 buổi mỗi tuần",
      },
      active: {
        title: "Năng động",
        subtitle: "Tập đều và hoạt động nhiều",
      },
      very_active: {
        title: "Cường độ cao",
        subtitle: "Tập gần như hằng ngày",
      },
    },
  },
  validators: {
    nicknameMin: "Tên gọi phải có ít nhất 2 ký tự.",
    nicknameMax: "Tên gọi nên dưới 24 ký tự.",
    invalidBirthDate: "Ngày sinh không hợp lệ.",
    adultOnly: "Bạn cần từ 18 tuổi trở lên để sử dụng DNT.",
    targetWeightMissing: "Cần nhập đủ cân nặng hiện tại và mục tiêu.",
    loseWeightInvalid: "Mục tiêu giảm cân cần nhỏ hơn cân nặng hiện tại.",
    gainWeightInvalid: "Mục tiêu tăng cân cần lớn hơn cân nặng hiện tại.",
    maintainWeightInvalid: "Chế độ giữ dáng nên giữ cân nặng mục tiêu gần với hiện tại.",
    weeklyGoalRequired: "Hãy chọn tốc độ hằng tuần.",
    weeklyGoalRange: (min: number, max: number) => `Giá trị cần nằm trong khoảng ${min} - ${max} kg/tuần.`,
  },
  nutrition: {
    bmiDescriptions: {
      underweight: "Bạn đang ở dưới ngưỡng cân bằng, ưu tiên ăn đủ và tăng năng lượng sạch.",
      normal: "Chỉ số của bạn đang ở vùng cân bằng để xây dựng routine bền vững.",
      overweight: "Bạn đang ở trên ngưỡng cân bằng, ưu tiên deficit vừa phải và vận động đều.",
      obese: "Bạn cần một lộ trình chậm và chắc, ưu tiên giữ macro rõ ràng.",
    },
    bmiSource: "BMI tiêu chuẩn",
    incompleteDraft: "Hồ sơ chưa đầy đủ.",
  },
  macros: {
    caloriesPerDay: "kcal/ngày",
    protein: "Protein",
    carb: "Carb",
    fat: "Chất béo",
  },
} as const;

export function getGoalTypeLabel(goalType: GoalType | null | undefined) {
  return goalType ? goalTypeLabels[goalType] : "-";
}

export function getBmiStatusLabel(status: BMIStatus) {
  return bmiStatusLabels[status];
}

export function getActivityLevelLabel(activity: ActivityLevel) {
  return activityLabels[activity];
}
