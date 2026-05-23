# 🥗 DNT Nutrition App - Frontend

Ứng dụng cá nhân hóa dinh dưỡng, món ăn và lối sống dành riêng cho người Việt. Với phong cách thiết kế **Premium Dark UI** và hệ thống mascot dẫn chuyện thân thiện, DNT mang lại trải nghiệm theo dõi sức khỏe chuyên nghiệp và hiện đại.

---

## 🚀 Tính năng chính

- **Conversational Onboarding**: Luồng khảo sát người dùng dưới dạng hội thoại sinh động với mascot, giúp thu thập các chỉ số cơ thể (chiều cao, cân nặng, độ tuổi, mức độ vận động) một cách tự nhiên.
- **Cá nhân hóa lộ trình**: Tự động tính toán BMI, BMR, TDEE và đề xuất Macro (Protein, Carbs, Fat) phù hợp với mục tiêu của người dùng (giảm cân, giữ cân, tăng cân).
- **Nhật ký dinh dưỡng (Diary) & Luyện tập**: Theo dõi lượng calo nạp vào và calo tiêu thụ, hỗ trợ ghi lại bữa ăn và lịch trình tập luyện.
- **Gợi ý thực đơn & Công thức**: Kế hoạch ăn uống (Meal Plan) đa dạng và gợi ý công thức nấu ăn chuẩn Việt.
- **Tích hợp Google Sign-In**: Đăng nhập nhanh chóng và bảo mật thông qua tài khoản Google.
- **Premium Design System**: Giao diện tối sang trọng (Dark Theme làm chủ đạo), các hiệu ứng gradient tím mượt mà, bo góc mềm mại và các tương tác rung phản hồi (Haptic) tinh tế.

---

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng dựa trên Expo Managed Workflow với cấu trúc hiện đại:

- **Core**: [Expo 54](https://expo.dev/) (SDK 54), [React Native 0.81.5](https://reactnative.dev/)
- **Navigation**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Quản lý client state và lưu trữ cục bộ)
- **Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest) (Đồng bộ hóa dữ liệu từ backend và cache)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) kết hợp [Zod](https://zod.dev/) để validate dữ liệu chặt chẽ
- **UI Components**: [React Native Paper](https://reactnativepaper.com/) (Hỗ trợ components chuẩn Material Design), [React Native Calendars](https://github.com/wix/react-native-calendars)
- **Animations & Visuals**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/), [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **Networking**: [Axios](https://axios-http.com/) với cấu hình API Client tự động đính kèm Token

---

## 📂 Cấu trúc thư mục

Toàn bộ mã nguồn của ứng dụng được tổ chức khoa học bên trong thư mục `src/` nhằm đồng bộ cấu trúc với Expo template chuẩn:

```text
frontend/
├── assets/                 # Các tài nguyên tĩnh (Hình ảnh, Mascot, Fonts)
├── patches/                # Thư mục lưu trữ các bản vá lỗi thư viện (patch-package)
├── src/                    # Thư mục gốc chứa mã nguồn dự án
│   ├── app/                # Cấu trúc định tuyến (Expo Router Routes)
│   │   ├── (onboarding)/   # Các màn hình khảo sát chỉ số cơ thể đầu vào
│   │   ├── (public)/       # Các màn hình chào mừng (Welcome) và Đăng nhập (Login)
│   │   ├── (tabs)/         # Giao diện chính sau đăng nhập (Home, Diary, Meal Plan, Account)
│   │   └── _layout.tsx     # Root Layout - cấu hình Providers (React Query, Paper, Auth...)
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── ui/             # Nguyên tử UI (Buttons, Cards, Modals, Inputs...)
│   │   ├── onboarding/     # Components riêng cho luồng khảo sát (mascot bong bóng thoại...)
│   │   ├── dashboard/      # Vòng tròn Calo, biểu đồ tiến trình dinh dưỡng
│   │   └── layout/         # SafeScreen, ScreenBackground hỗ trợ responsive
│   ├── constants/          # Hằng số, cấu hình tĩnh và mocks
│   │   ├── theme.ts        # Design Tokens (Bảng màu tối, kích thước chữ, spacing)
│   │   ├── api.ts          # Định nghĩa endpoints API
│   │   ├── guides.ts       # Dữ liệu bài viết, lời khuyên sức khỏe
│   │   └── i18n/           # Đa ngôn ngữ (Tiếng Việt)
│   ├── domain/             # Các mô hình dữ liệu và công thức tính toán logic nghiệp vụ
│   ├── hooks/              # Custom React Hooks
│   │   ├── store/          # Zustand stores (onboardingStore, authStore...)
│   │   ├── queries/        # Các custom query hook từ TanStack Query tương tác với service
│   │   └── useGoogleAuth.ts# Xử lý đăng nhập thông qua Google Cloud Console
│   ├── services/           # Lớp kết nối API Backend
│   │   ├── apiClient.ts    # Cấu hình Axios instance (Base URL, Interceptors...)
│   │   ├── userService.ts  # Quản lý tài khoản và cập nhật thông tin cá nhân
│   │   ├── foodService.ts  # Tìm kiếm món ăn, tạo món ăn mới và công thức
│   │   └── logService.ts   # Lưu nhật ký dinh dưỡng và bài tập hàng ngày
│   └── utils/              # Các hàm tiện ích dùng chung (Date helpers, Calo helpers)
├── .env.example            # Bản mẫu cấu hình biến môi trường
├── app.json                # Cấu hình Expo App (Plugins, Bundle ID, Splash Screen)
├── package.json            # Quản lý thư viện phụ thuộc và scripts chạy dự án
└── tsconfig.json           # Cấu hình dự án TypeScript
```

---

## 🛠️ Hướng dẫn phát triển

### 1. Cài đặt các thư viện phụ thuộc

Hãy chắc chắn rằng bạn đã cài đặt các công cụ phát triển React Native phù hợp trên máy. Sau đó, chạy lệnh:

```bash
npm install
```

### 2. Cấu hình biến môi trường

Sao chép tệp tin cấu hình mẫu và chỉnh sửa các giá trị cho phù hợp:

```bash
cp .env.example .env
```

Cấu hình các tham số trong `.env`:
*   `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: Client ID của ứng dụng trên Google Cloud.
*   `EXPO_PUBLIC_API_URL`: Địa chỉ API của Backend (Ví dụ: `http://10.0.2.2:5184` đối với máy ảo Android hoặc `http://localhost:5184` với iOS/Web).
*   `EXPO_PUBLIC_USE_MOCK`: Thiết lập thành `true` để sử dụng dữ liệu giả lập (mock data) mà không cần chạy Backend, hoặc `false` để kết nối API thực tế qua Axios.

### 3. Chạy ứng dụng

Khởi động Expo Metro Bundler:

```bash
# Chạy Expo Dev Server
npx expo start

# Hoặc khởi động nhanh trên nền tảng cụ thể
npm run android    # Chạy trên thiết bị/máy ảo Android
npm run ios        # Chạy trên thiết bị/máy ảo iOS
npm run web        # Chạy trên trình duyệt Web
```

### 4. Kiểm tra chất lượng mã nguồn (Linting & Typecheck)

```bash
npm run lint       # Kiểm tra chuẩn coding style của dự án
npm run typecheck  # Kiểm tra lỗi biên dịch TypeScript
```

---

## 🎨 Quy chuẩn thiết kế (Design Standards)

Dự án tuân thủ nghiêm ngặt hệ thống **Design Tokens** định sẵn:
- **Base Theme**: Màu chủ đạo là `#111020` (Nền tối Premium) và sắc tím `#A56CFF` (Primary Purple).
- **Typography**: Sử dụng font chữ hiện đại **Plus Jakarta Sans** mang lại cảm giác trẻ trung, thanh lịch.
- **Card Design**: Độ bo góc chuẩn `20px` hoặc `24px` kết hợp đổ bóng nhẹ và viền tinh tế để tăng chiều sâu giao diện.

---

## 📄 Giấy phép & Bản quyền
Dự án thuộc hệ sinh thái **HUCE-EATSY**. Mọi quyền được bảo lưu.
