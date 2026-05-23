export type GuideType = 'goal' | 'consumed' | 'exercise' | 'protein' | 'carb' | 'fat';

export interface GuideContent {
  title: string;
  intro: string[];
  bulletPoints?: string[];
  footerNote?: string;
  articleCard?: {
    tag: string;
    title: string;
    imageColor: string; // Fake thumbnail color/placeholder
  };
}

export const GUIDES: Record<GuideType, GuideContent> = {
  goal: {
    title: "Calo Mục Tiêu - Hướng dẫn năng lượng cho cơ thể mỗi ngày",
    intro: [
      "Calo Mục Tiêu là lượng **calo bạn nên nạp mỗi ngày để đạt được mục tiêu** cá nhân - giảm cân, duy trì hay tăng cân. Wao tính toán dựa trên chiều cao, cân nặng, tuổi, giới tính, mức vận động và mục tiêu bạn chọn.",
      "Mức calo này giúp bạn ăn đủ - không thừa, không thiếu - để cơ thể khoẻ mạnh và tiến đúng hướng."
    ],
    bulletPoints: [
      "Calo từ vận động hàng ngày đã được tính sẵn, không cần cộng thêm sau mỗi lần tập luyện.",
      "Con số này được tính từ TDEE - tổng năng lượng cần thiết trong một ngày. **Giảm khoảng 500 calo so với TDEE** là cách giảm cân an toàn phổ biến."
    ],
    footerNote: "👉 Wao sẽ đồng hành cùng bạn mỗi ngày để giữ calo ở mức phù hợp với mục tiêu."
  },
  consumed: {
    title: "Calo Nạp Vào - Lượng năng lượng bạn đã hấp thụ trong ngày",
    intro: [
      "Đây là tổng lượng calo bạn đã tiêu thụ từ thức ăn và đồ uống trong ngày. Mỗi khi bạn ghi lại một món ăn, chỉ số này sẽ được cập nhật tự động.",
      "Wao ước tính nhu cầu calo dựa trên:\n- **BMR** - năng lượng cơ bản cơ thể cần để duy trì sự sống.\n- **PAL** - mức độ vận động hàng ngày của bạn.",
      "Nếu bạn chọn mục tiêu giảm cân, Wao sẽ tự động điều chỉnh mức calo mục tiêu bằng cách giảm 300-500 kcal để tạo thâm hụt năng lượng hợp lý."
    ],
    footerNote: "👉 Ghi lại món ăn mỗi ngày để theo dõi chính xác lượng calo nạp vào cùng Wao"
  },
  exercise: {
    title: "Tập Luyện - Theo dõi calo bạn đốt qua vận động thể thao",
    intro: [
      "Tập luyện là lượng calo bạn đốt thông qua hoạt động thể chất như đi bộ, chạy bộ, tập gym...",
      "Bạn có thể ghi nhận thủ công hoặc đồng bộ từ thiết bị đeo.",
      "**Tập luyện có làm thay đổi vòng tròn calo không?**\nKhông. Vòng tròn calo chỉ phản ánh lượng calo nạp vào so với mục tiêu ăn uống. Calo tiêu hao từ tập luyện được hiển thị riêng để bạn theo dõi, nhưng không cộng thêm vào mục tiêu.",
      "**Tôi có cần ăn thêm nếu tập nhiều?**"
    ],
    bulletPoints: [
      "Nếu mức tập luyện đúng với mức vận động bạn đã chọn ban đầu -> không cần ăn thêm, app đã tính sẵn.",
      "Nếu tập nhiều hơn thường lệ -> có thể ăn thêm để duy trì hiệu suất.",
      "Nếu tập ít hơn -> nên điều chỉnh khẩu phần để giữ cân bằng calo."
    ],
    footerNote: "👉 Wao giúp bạn theo dõi cả calo nạp và tiêu hao - để chủ động điều chỉnh phù hợp với nhịp sống."
  },
  protein: {
    title: "Chất đạm (Protein) - Dưỡng chất quan trọng cho sức khoẻ mỗi ngày",
    intro: [
      "Chất đạm giúp xây cơ, tái tạo mô, tăng miễn dịch và tạo cảm giác no lâu hơn - đặc biệt hữu ích khi bạn muốn giảm cân hoặc tăng cơ.",
      "Nguồn đạm tốt bao gồm: trứng, cá, thịt nạc, sữa chua Hy Lạp, đậu phụ, đậu đen, yến mạch...",
      "**Nên ăn bao nhiêu mỗi ngày?**"
    ],
    bulletPoints: [
      "Người bình thường: 0.8-1g/kg",
      "Người giảm cân, tập luyện: 1.2-2g/kg"
    ],
    articleCard: {
      tag: "kiến thức",
      title: "Cẩm nang protein: Ăn đúng đủ và hiệu quả mỗi ngày",
      imageColor: "#FF8C00", // Cam
    }
  },
  carb: {
    title: "Đường bột (Carb) - Nguồn năng lượng chính cho cơ thể",
    intro: [
      "Đường bột cung cấp năng lượng cho não và cơ bắp. Nếu bạn hay đói nhanh, mệt mỏi hoặc tụt mood, có thể bạn đang ăn chưa đủ đường bột.",
      "Nên chọn carb tiêu hoá chậm:\nYến mạch, khoai lang, trái cây còn vỏ... giúp duy trì năng lượng lâu hơn và tránh tăng đường huyết đột ngột.",
      "**Nên ăn bao nhiêu mỗi ngày?**"
    ],
    bulletPoints: [
      "Chế độ cân bằng: 45-65% tổng calo",
      "Low-carb: <130g/ngày (tuỳ mục tiêu)"
    ],
    articleCard: {
      tag: "kiến thức",
      title: "Cẩm nang ăn đường bột để duy trì sức khoẻ",
      imageColor: "#1E90FF", // Xanh dương
    }
  },
  fat: {
    title: "Chất béo (Fat) - Không phải kẻ thù nếu bạn hiểu đúng",
    intro: [
      "Chất béo giúp hấp thụ vitamin, ổn định hormone và giữ no lâu - đặc biệt quan trọng với nữ giới hoặc người ăn kiêng dài hạn.",
      "Nên ưu tiên chất béo “tốt” như:\nDầu ô liu, bơ, cá béo, các loại hạt - giàu omega-3, hỗ trợ tim mạch và trao đổi chất.",
      "**Nên ăn bao nhiêu mỗi ngày?**"
    ],
    bulletPoints: [
      "Chất béo nên chiếm khoảng 20-35% tổng calo.",
      "Nếu bạn đang giảm cân, có thể giữ ở mức 20-25% để kiểm soát năng lượng."
    ],
    articleCard: {
      tag: "kiến thức",
      title: "Bí quyết cân đối chất béo mỗi ngày",
      imageColor: "#32CD32", // Xanh lá
    }
  }
};
