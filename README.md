# 🥗 DNT Nutrition App - Frontend

Ứng dụng cá nhân hóa dinh dưỡng, món ăn và lối sống dành riêng cho người Việt. Với phong cách thiết kế **Premium Dark UI** và hệ thống mascot dẫn chuyện thân thiện, DNT mang lại trải nghiệm theo dõi sức khỏe chuyên nghiệp và hiện đại.

---

## 🚀 Tính năng chính

- **Conversational Onboarding**: Luồng khảo sát người dùng dưới dạng hội thoại sinh động với mascot, giúp thu thập các chỉ số cơ thể (chiều cao, cân nặng, độ tuổi, mức độ vận động) một cách tự nhiên.
- **Cá nhân hóa lộ trình**: Tự động tính toán BMI, BMR, TDEE và đề xuất Macro (Protein, Carbs, Fat) phù hợp với mục tiêu của người dùng (giảm cân, giữ cân, tăng cân).
- **Nhật ký dinh dưỡng (Diary) & Luyện tập**: Theo dõi lượng calo nạp vào và calo tiêu thụ, hỗ trợ ghi lại bữa ăn và lịch trình tập luyện theo trục thời gian (Timeline).
- **Gợi ý thực đơn & Công thức**: Kế hoạch ăn uống (Meal Plan) đa dạng và gợi ý công thức nấu ăn chuẩn Việt.
- **Tích hợp Google Sign-In**: Đăng nhập nhanh chóng và bảo mật thông qua tài khoản Google.
- **Premium Design System**: Giao diện tối sang trọng (Dark Theme làm chủ đạo và hỗ trợ Light Theme tự động), các hiệu ứng gradient tím mượt mà, bo góc mềm mại và các tương tác rung phản hồi (Haptic) tinh tế.

---

## 🛠️ Công nghệ sử dụng

Dự án được xây dựng dựa trên Expo Managed Workflow với cấu trúc hiện đại:

- **Core**: [Expo 54](https://expo.dev/) (SDK 54), [React Native 0.81.5](https://reactnative.dev/)
- **Navigation**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Quản lý các store lưu trữ trạng thái người dùng, cài đặt, lượng nước uống, v.v. và đồng bộ cục bộ)
- **Data Fetching**: [TanStack React Query v5](https://tanstack.com/query/latest) (Đồng bộ hóa dữ liệu từ backend và cache cho các truy vấn tĩnh/động)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) kết hợp [Zod](https://zod.dev/) để validate dữ liệu chặt chẽ
- **UI Components**: [React Native Paper](https://reactnativepaper.com/) (Hỗ trợ components chuẩn Material Design), [React Native Calendars](https://github.com/wix/react-native-calendars)
- **Animations & Visuals**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/), [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/), [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **Networking**: [Axios](https://axios-http.com/) với cấu hình API Client tự động đính kèm Token bảo mật

---

## 📂 Cấu trúc thư mục

Toàn bộ mã nguồn của ứng dụng được tổ chức khoa học bên trong thư mục `src/` nhằm đồng bộ cấu trúc với Expo template chuẩn:

```text
frontend/
├── assets/                 # Các tài nguyên tĩnh (Hình ảnh, Mascot, Favicon)
├── scripts/                # Scripts tiện ích dự án
├── src/                    # Thư mục gốc chứa mã nguồn dự án
│   ├── app/                # Cấu trúc định tuyến (Expo Router Routes)
│   │   ├── (onboarding)/   # Các màn hình khảo sát chỉ số cơ thể đầu vào
│   │   ├── (public)/       # Các màn hình chào mừng (Welcome) và Đăng nhập (Login)
│   │   ├── (tabs)/         # Giao diện chính (Home, Diary, Meal Plan, Account)
│   │   ├── account/        # Các trang quản lý tài khoản (Cài đặt, quyền riêng tư, mục tiêu)
│   │   ├── guide/          # Trang xem cẩm nang, lời khuyên sức khỏe động [type].tsx
│   │   ├── stats/          # Các trang báo cáo thống kê chỉ số (Calo, Bước chân, Cân nặng)
│   │   ├── _layout.tsx     # Root Layout - cấu hình Providers (React Query, Paper, Auth...)
│   │   └── index.tsx       # Entry point điều hướng màn hình ban đầu
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   ├── account/        # Components cho giao diện thông tin tài khoản & mục tiêu
│   │   ├── buttons/        # Các nút bấm có hiệu ứng gradient hoặc auth
│   │   ├── charts/         # Các biểu đồ tròn, cột, đường biểu diễn chỉ số
│   │   ├── common/         # Component dùng chung (Toast, SurfaceCard)
│   │   ├── dashboard/      # Vòng tròn Calo, biểu đồ tiến trình dinh dưỡng nhanh ở Home
│   │   ├── layout/         # SafeScreen, ScreenBackground hỗ trợ responsive
│   │   ├── meal/           # Modals chọn món ăn, chỉnh sửa khẩu phần
│   │   ├── onboarding/     # Components riêng cho luồng khảo sát (mascot bong bóng thoại...)
│   │   ├── stats/          # Components hỗ trợ các trang thống kê chi tiết
│   │   └── streaks/        # Các thành phần theo dõi chuỗi ngày kỷ luật (Streak)
│   ├── constants/          # Hằng số, cấu hình tĩnh
│   │   ├── index.ts        # Design Tokens chính (Bảng màu sáng/tối, spacing, typography)
│   │   ├── api.ts          # Định nghĩa endpoints API kết nối Backend
│   │   ├── guides.ts       # Dữ liệu bài viết tĩnh cho cẩm nang dinh dưỡng
│   │   ├── i18n/           # Các file bản dịch đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
│   │   └── mocks/          # Mock data cho môi trường phát triển offline
│   ├── hooks/              # Custom React Hooks
│   │   ├── queries/        # Custom query/mutation hooks từ React Query (Food, User)
│   │   ├── stats/          # Custom hooks xử lý tổng hợp số liệu thống kê (Calo, Steps...)
│   │   ├── useAppColors.ts # Hook lấy màu linh hoạt theo theme hiện tại
│   │   └── useGoogleAuth.ts# Xử lý đăng nhập thông qua Google Cloud Console
│   ├── services/           # Lớp kết nối API Backend
│   │   ├── apiClient.ts    # Cấu hình Axios instance (Base URL, Interceptors...)
│   │   ├── userService.ts  # Dịch vụ quản lý tài khoản & thông tin hồ sơ
│   │   ├── foodService.ts  # Tra cứu món ăn và quản lý công thức ăn uống
│   │   ├── logService.ts   # Lưu trữ nhật ký ăn uống
│   │   ├── pedometerService.ts # Đồng bộ bước chân
│   │   ├── weightLogService.ts # Ghi nhận cân nặng cơ thể
│   │   └── nutritionLogService.ts # Truy xuất tổng hợp số liệu dinh dưỡng
│   ├── store/              # Zustand stores quản lý client-state (auth, diary, settings, water...)
│   ├── types/              # Định nghĩa TypeScript contracts & DTOs
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
- **Base Theme**: Màu chủ đạo là `#111020` (Nền tối Premium) và sắc tím `#A56CFF` (Primary Purple). Có cơ chế tự động đồng bộ sang nền sáng khi người dùng tùy chọn.
- **Typography**: Sử dụng font chữ hiện đại **Google Sans** mang lại cảm giác thân thiện, chuyên nghiệp và có tính đọc tốt.
- **Card Design**: Độ bo góc chuẩn tái sử dụng qua Token `radius` kết hợp đổ bóng nhẹ và viền tinh tế để tăng chiều sâu giao diện.

---

## 📄 Giấy phép & Bản quyền
Dự án thuộc hệ sinh thái **HUCE-EATSY**. Mọi quyền được bảo lưu.
