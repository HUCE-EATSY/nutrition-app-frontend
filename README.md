# Nutrition App (DNT)

Ứng dụng cá nhân hoá món ăn, thói quen và lối sống dành cho người Việt.

## Cấu trúc thư mục

│   ├── app/                    # Định nghĩa các tuyến đường (Routes) - Expo Router
│   │   ├── (onboarding)/       # Nhóm các màn hình hướng dẫn/giới thiệu
│   │   ├── (tabs)/             # Cấu trúc các tab chính của ứng dụng
│   │   ├── _layout.tsx         # File bố cục gốc của ứng dụng
│   │   └── modal.tsx           # Màn hình Modal (thông báo/tùy chọn)
│   ├── components/             # Các thành phần giao diện tái sử dụng
│   │   ├── ui/                 # Các UI components cơ bản
│   │   ├── themed-text.tsx     # Văn bản hỗ trợ Dark/Light mode
│   │   ├── themed-view.tsx     # View hỗ trợ Dark/Light mode
│   │   └── ...                 # Các components khác (HelloWave, ParallaxScrollView...)
│   ├── assets/                 # Hình ảnh, fonts và các tài nguyên tĩnh
│   ├── constants/              # Các giá trị hằng số (Màu sắc, API keys...)
│   │   ├── types/              # Định nghĩa TypeScript contracts
│   │   ├── i18n/               # Đa ngôn ngữ (Translations)
│   │   ├── domain/             # Logic nghiệp vụ (Validators, Calculators)
│   │   └── mocks/              # Mock data cho phát triển
│   ├── hooks/                  # Các Custom Hooks (ví dụ: useColorScheme)
│   │   ├── store/              # Global state management (Zustand)
│   │   └── utils/              # Các hàm tiện ích logic
│   ├── scripts/                # Các script hỗ trợ build hoặc tiện ích
│   ├── app.json                # Cấu hình Expo
│   ├── package.json            # Quản lý thư viện
│   ├── tsconfig.json           # Cấu hình TypeScript
│   └── README.md               # Tài liệu hướng dẫn dự án
