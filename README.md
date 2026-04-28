# 🥗 DNT Nutrition App

Ứng dụng cá nhân hóa dinh dưỡng, món ăn và lối sống dành riêng cho người Việt. Với phong cách thiết kế **Premium Dark UI** và hệ thống mascot dẫn chuyện thân thiện, DNT mang lại trải nghiệm theo dõi sức khỏe chuyên nghiệp và hiện đại.

---

## 🚀 Tính năng chính

- **Conversational Onboarding**: Luồng khảo sát người dùng dưới dạng hội thoại với mascot, giúp thu thập chỉ số cơ thể một cách tự nhiên.
- **Cá nhân hóa lộ trình**: Tính toán BMI, BMR, TDEE và đề xuất Macro (Protein, Carbs, Fat) dựa trên mục tiêu (giảm cân, giữ cân, tăng cân).
- **Nhật ký dinh dưỡng (Diary)**: Theo dõi lượng calo nạp vào theo dòng thời gian (Hourly Timeline).
- **Kế hoạch ăn uống (Meal Plan)**: Gợi ý thực đơn và quản lý bữa ăn hàng ngày.
- **Premium Design System**: Giao diện tối sang trọng, sử dụng các hiệu ứng gradient tím, bo góc mềm mại và các micro-animations mượt mà.

---

## 🛠️ Công nghệ sử dụng

- **Core**: [Expo 52](https://expo.dev/) (Managed Workflow), [React Native 0.76](https://reactnative.dev/)
- **Navigation**: [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client state & Persistence)
- **Styling**: Native StyleSheet với hệ thống Design Tokens tùy chỉnh.
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/).
- **UI Components**: [React Native SVG](https://github.com/software-mansion/react-native-svg), [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/).

---

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo tiêu chuẩn **Expo Router v3+** với cấu trúc phẳng và tối ưu hóa cho module:

```text
├── app/                    # Định nghĩa Routes (Expo Router)
│   ├── (onboarding)/       # Luồng khảo sát người dùng
│   ├── (public)/           # Các màn hình chào mừng, login
│   ├── (tabs)/             # Bố cục Tab bar chính
│   └── _layout.tsx         # Root Layout
├── components/             # Các thành phần giao diện tái sử dụng
│   ├── ui/                 # Nguyên tử UI (Buttons, Cards, Modals)
│   ├── onboarding/         # Các components đặc thù cho khảo sát
│   ├── dashboard/          # Charts và thông tin chỉ số
│   └── layout/             # SafeScreen, ScreenBackground...
├── constants/              # Hằng số và Logic nghiệp vụ
│   ├── domain/             # Công thức tính toán (BMR, TDEE, Validators)
│   ├── i18n/               # Đa ngôn ngữ (Tiếng Việt là chủ đạo)
│   ├── types/              # TypeScript Interfaces/Contracts
│   └── Theme.ts            # Design Tokens (Colors, Spacing)
├── hooks/                  # Custom Hooks & State Stores
│   ├── store/              # Zustand stores (onboardingStore...)
│   └── utils/              # Các hàm tiện ích logic & date
├── assets/                 # Hình ảnh, Fonts, Mascot assets
├── .agents/                # Tài liệu đặc tả và quy chuẩn cho AI Agents
└── package.json            # Quản lý dependencies
```

---

## 🛠️ Hướng dẫn phát triển

### Cài đặt
```bash
npm install
```

### Chạy ứng dụng
```bash
# Chạy với Expo Go hoặc Development Build
npx expo start

# Hoặc chạy trực tiếp trên thiết bị/giả lập
npm run android
npm run ios
```

### Kiểm tra mã nguồn
```bash
npm run lint       # Kiểm tra coding convention
npm run typecheck  # Kiểm tra lỗi TypeScript
```

---

## 🎨 Quy chuẩn thiết kế (Design Standards)

Dự án tuân thủ nghiêm ngặt hệ thống **Design Tokens** được định nghĩa trong `.agents/rules/design/`:
- **Bảng màu**: Chủ đạo là `#111020` (Base Dark) và `#A56CFF` (Primary Purple).
- **Typography**: Sử dụng font **Plus Jakarta Sans** với các mức hiển thị từ Display đến Caption.
- **Bo góc**: Các Card sử dụng radius `20px` hoặc `24px` để tạo sự mềm mại.

---

## 📄 Giấy phép & Bản quyền
Dự án thuộc hệ sinh thái **HUCE-EATSY**. Mọi quyền được bảo lưu.
