# 📱 Báo Cáo Chức Năng Frontend — WAO Health App

> **Dự án:** Đồ án Lập Trình Đa Nền Tảng — Nhóm HUCE-EATSY  
> **Công nghệ:** React Native + Expo Router + TypeScript  
> **Cập nhật lần cuối:** 2026-06-03

---

## 📂 Cấu Trúc Thư Mục Frontend

```
nutrition-app-frontend/
├── src/
│   ├── app/                         # Màn hình (Expo Router)
│   │   ├── (tabs)/                  # Tab chính
│   │   │   ├── home.tsx             # Trang chủ
│   │   │   ├── diary.tsx            # Nhật ký ăn uống
│   │   │   ├── meal-plan.tsx        # Kế hoạch bữa ăn / thực đơn
│   │   │   └── account.tsx          # Tài khoản cá nhân
│   │   ├── streaks.tsx              # Chuỗi ngày (Streak)
│   │   ├── streak-history.tsx       # Lịch sử Streak & cột mốc [MỚI]
│   │   ├── premium.tsx              # Mua Premium (QR VietQR)
│   │   ├── premium-benefits.tsx     # Lợi ích Premium & FAQ [MỚI]
│   │   ├── menu-detail.tsx          # Chi tiết thực đơn [MỚI]
│   │   ├── leaderboard.tsx          # Bảng xếp hạng Streak
│   │   ├── log-water.tsx            # Ghi lượng nước
│   │   ├── log-weight.tsx           # Ghi cân nặng
│   │   ├── exercise-diary.tsx       # Nhật ký tập luyện
│   │   ├── calendar.tsx             # Lịch dinh dưỡng
│   │   ├── notifications.tsx        # Thông báo
│   │   └── scan-barcode.tsx         # Quét mã vạch thực phẩm
│   ├── components/
│   │   ├── streaks/                 # Components cho màn hình Streak
│   │   │   ├── StreakHeader.tsx
│   │   │   ├── StreakActionCard.tsx
│   │   │   ├── WeeklyProgressCard.tsx
│   │   │   ├── StreakStatsRow.tsx
│   │   │   ├── StreakChallengeSection.tsx
│   │   │   ├── StreakMilestoneCard.tsx  [MỚI]
│   │   │   └── StreakDetailStats.tsx    [MỚI]
│   │   ├── account/
│   │   │   └── PremiumFeatureCard.tsx   [MỚI]
│   │   ├── common/                  # Toast, Modal...
│   │   ├── dashboard/               # Cards trang chủ
│   │   ├── meal/                    # Components bữa ăn
│   │   ├── charts/                  # Biểu đồ dinh dưỡng
│   │   └── layout/                  # SafeScreen, layout
│   ├── services/                    # API service layer
│   │   ├── streakService.ts
│   │   ├── menuService.ts
│   │   ├── subscriptionService.ts
│   │   ├── foodService.ts
│   │   ├── logService.ts
│   │   └── ...
│   ├── hooks/                       # Custom hooks
│   │   ├── useStreaks.ts
│   │   ├── queries/
│   │   │   ├── useSubscription.ts
│   │   │   └── ...
│   │   └── ...
│   ├── constants/                   # Màu sắc, spacing, typography
│   ├── store/                       # Zustand store
│   └── types/                       # TypeScript types
```

---

## 🔥 Chức Năng 1: Streak (Chuỗi Ngày)

### Mô tả
Tính năng theo dõi chuỗi ngày ghi nhật ký dinh dưỡng liên tiếp, giúp người dùng duy trì thói quen ăn uống lành mạnh.

### Màn hình chính
**`src/app/streaks.tsx`**
- Hiển thị số ngày streak hiện tại với animation
- Nút "Ghi dinh dưỡng hôm nay" — gọi API `POST /api/streaks/sim-log`
- Nút "Đóng băng chuỗi ngày hôm qua" — gọi API `POST /api/streaks/freeze`
- Hiển thị tiến độ tuần (7 ngày T2–CN)
- **Mới:** Hiển thị thẻ cột mốc `StreakMilestoneCard`
- **Mới:** Nút điều hướng sang màn hình lịch sử chi tiết

**`src/app/streak-history.tsx`** *(Mới)*
- Hero card hiển thị số ngày streak lớn + màu gradient
- Thống kê chi tiết (streak hiện tại, dài nhất, số thẻ đóng băng)
- Tiến độ tuần
- Danh sách cột mốc (3/7/14/30/60/100 ngày) với màu sắc riêng
- Nút chia sẻ streak qua Share API
- Điều hướng tới bảng xếp hạng

### Components mới
| Component | Mô tả |
|-----------|-------|
| `StreakMilestoneCard` | Hiển thị tiến độ và danh sách cột mốc cần đạt (3/7/14/30/60/100 ngày) |
| `StreakDetailStats` | Thống kê 3 chỉ số: streak hiện tại, dài nhất, số thẻ đóng băng |

### API sử dụng
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/streaks/me` | GET | Lấy thông tin streak của user |
| `/api/streaks/sim-log` | POST | Ghi nhận dinh dưỡng hôm nay |
| `/api/streaks/freeze` | POST | Sử dụng thẻ đóng băng cho hôm qua |
| `/api/streaks/leaderboard` | GET | Bảng xếp hạng |

---

## 💎 Chức Năng 2: Premium (Gói Cao Cấp)

### Mô tả
Hệ thống thanh toán gói Premium qua VietQR NAPAS, cung cấp tính năng nâng cao cho người dùng trả phí.

### Màn hình chính
**`src/app/premium.tsx`**
- Hiển thị trạng thái gói Premium (VIP card vàng nếu đã mua)
- Chọn gói (tháng/năm) với badge "Tiết kiệm"
- Tạo đơn hàng → hiển thị QR VietQR
- Tự động polling trạng thái thanh toán mỗi 3 giây
- Nút giả lập webhook `[TEST]` dành cho dev

**`src/app/premium-benefits.tsx`** *(Mới)*
- Banner gradient động theo trạng thái Premium
- Danh sách đầy đủ tính năng Premium với trạng thái khóa/mở
- Bảng so sánh Free vs Premium (8 tính năng)
- FAQ accordion (4 câu hỏi thường gặp)
- CTA "Nâng cấp" động (ẩn nếu đã Premium)
- Nút chia sẻ app

### Components mới
| Component | Mô tả |
|-----------|-------|
| `PremiumFeatureCard` | Danh sách tính năng có icon màu, badge VIP, trạng thái khóa/mở khóa |

### Tính năng Premium
| Tính năng | Free | Premium |
|-----------|------|---------|
| Ghi nhật ký | ✅ | ✅ |
| Thống kê hôm nay | ✅ | ✅ |
| Lịch sử 7 ngày | ✅ | ✅ |
| Lịch sử không giới hạn | ❌ | ✅ |
| Phân tích vi lượng | ❌ | ✅ |
| Báo cáo tuần/tháng | ❌ | ✅ |
| Thẻ đóng băng Streak | ❌ | ✅ |
| AI Mascot gợi ý | ❌ | ✅ |

### API sử dụng
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/Subscription/me` | GET | Trạng thái gói hiện tại |
| `/api/Subscription/plans` | GET | Danh sách gói có thể mua |
| `/api/Subscription/create-order` | POST | Tạo đơn hàng VietQR |
| `/api/Subscription/order-status/{id}` | GET | Kiểm tra trạng thái thanh toán |
| `/api/Subscription/mock-callback/{id}` | POST | Giả lập webhook [DEV] |

---

## 🍽️ Chức Năng 3: Menu (Thực Đơn Cá Nhân)

### Mô tả
Quản lý thực đơn cá nhân: tạo, chỉnh sửa, xóa thực đơn; áp dụng thực đơn vào kế hoạch ăn hàng ngày.

### Màn hình chính
**`src/app/(tabs)/meal-plan.tsx`**
- Danh sách thực đơn cá nhân
- Tạo thực đơn mới (tên, mô tả, chọn món ăn theo bữa)
- Áp dụng thực đơn vào ngày cụ thể
- Đồng bộ kế hoạch vào nhật ký ăn uống

**`src/app/menu-detail.tsx`** *(Mới)*
- Tóm tắt dinh dưỡng (calo, đạm, tinh bột, chất béo) dạng card gradient
- Danh sách món ăn nhóm theo bữa (sáng/trưa/tối/phụ) với icon
- Macro từng món (protein/carbs/fat)
- Nút "Áp dụng hôm nay" → gọi API `POST /api/daily-plans/apply`
- Nút "Xóa thực đơn" với xác nhận Alert
- Chia sẻ tóm tắt thực đơn qua Share API

### API sử dụng
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/menus/my-plans` | GET | Lấy danh sách thực đơn |
| `/api/menus` | POST | Tạo thực đơn mới |
| `/api/menus/{id}` | PUT | Cập nhật thực đơn |
| `/api/menus/{id}` | DELETE | Xóa thực đơn |
| `/api/daily-plans/apply` | POST | Áp dụng thực đơn vào ngày |
| `/api/daily-plans/{date}` | GET | Lấy kế hoạch ngày |
| `/api/daily-plans/sync-to-diary` | POST | Đồng bộ vào nhật ký |

---

## 🔧 Kỹ Thuật Sử Dụng

| Thư viện | Phiên bản | Mục đích |
|---------|-----------|---------|
| Expo Router | v3 | File-based routing |
| @tanstack/react-query | v5 | Server state management |
| Zustand | v4 | Client state management |
| expo-linear-gradient | latest | Gradient UI |
| @expo/vector-icons | latest | Icon set |
| axios | latest | HTTP client |

---

## 📊 Luồng Dữ Liệu

```
User Action (UI)
    ↓
Hook (useStreaks / useSubscription / useQuery)
    ↓
Service (streakService / menuService / subscriptionService)
    ↓
apiClient (axios + interceptors)
    ↓
Backend REST API (.NET 8)
    ↓
MySQL Database
```

---

## ✅ Tóm Tắt Commit

| Commit | Nội dung |
|--------|---------|
| `up streak` | + `streak-history.tsx`, `StreakMilestoneCard`, `StreakDetailStats`, cập nhật `streaks.tsx` |
| `up premium` | + `premium-benefits.tsx`, `PremiumFeatureCard` |
| `up menu` | + `menu-detail.tsx`, `BAOCAO_FRONTEND.md` |
