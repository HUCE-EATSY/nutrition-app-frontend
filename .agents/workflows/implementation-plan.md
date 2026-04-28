---
description: 
---

# Kế hoạch Vibecode UI DNT Cho `nutrition-app-frontend`

## Tóm tắt

- Mục tiêu vòng đầu: dựng đủ 18 màn, bám sát visual dark premium, có flow điều hướng thật, mock data cục bộ và state onboarding đủ để demo end-to-end.
- Giữ `expo-router` của repo hiện tại; không đổi sang `react-navigation`.
- Cách làm phù hợp cho vibecoding: đi theo lát cắt dọc, mỗi prompt chỉ xử lý 1 lát cắt và 1 vùng file rõ ràng, tránh prompt “làm hết app”.

## Thay đổi kiến trúc và interface

- Chuẩn hóa route theo Expo Router:
  - `app/(public)` cho A0-A2.
  - `app/(onboarding)` cho A3-A14.
  - `app/(tabs)` cho Home placeholder, Diary, Meal Plan, Account.
  - `app/quick-add.tsx` và `app/webview.tsx` là placeholder/modal.
- Dùng `src/` làm nơi chứa logic thật:
  - `src/theme` lấy `dnt_design_tokens.json` + `dnt_theme.ts` làm source of truth.
  - `src/components` chia `layout`, `buttons`, `onboarding`, `dashboard`, `diary`, `meal`, `account`.
  - `src/features` chứa screen containers theo cụm `auth`, `onboarding`, `diary`, `mealPlan`, `account`.
  - `src/store` + `src/domain` giữ draft onboarding, validator và calculator.
- Giữ nguyên shape từ `dnt_react_native_contracts.ts` cho các type chính: `OnboardingDraft`, `NutritionPlan`, `DiaryDaySummary`, `MealPlan`, `Testimonial`.
- Thêm dependency phục vụ UI thật: `zustand`, `@react-native-async-storage/async-storage`, `expo-linear-gradient`, `react-native-svg`. Chỉ thêm animation nâng cao khi màn đó thực sự cần.

## Trình tự vibecode

### Lát 1, Foundation

- khóa dark theme trong Expo, tạo token/colors/spacing/radius/typography/shadow.
- dựng `ScreenBackground`, `SafeScreen`, `GradientButton`, `SocialAuthButton`, `BottomCtaBar`.
- chuẩn hóa mock assets: mascot, icon, chart placeholder.

### Lát 2, Public flow A0-A2

- dựng Welcome, Social Login, Mascot Intro với route thật và CTA nối tiếp.
- chốt visual baseline: gradient nền, glow, speech bubble, CTA full-width.

### Lát 3, Onboarding shell A3-A11

- dựng `OnboardingHeader`, `MascotQuestionBubble`, `OptionCard`, `WheelDatePicker`, `HorizontalRulerPicker`, `WeeklyGoalSlider`.
- nối Zustand persisted; mỗi màn chỉ đọc/ghi một field, CTA disable đúng rule, back/forward không mất draft.

### Lát 4, Summary + Result A12-A14

- thêm BMI/BMR/TDEE/macro calculator local.
- dựng loading đa bước, summary cards, BMI scale, result chart và macro donut.

### Lát 5, Main app A15-A17

- custom tab bar theo DNT.
- Diary có timeline theo giờ + macro summary.
- Meal Plan chỉ empty state + segmented tabs local.
- Account dùng mock data cho stats, banner, support rows.
- Home và Quick Add là placeholder có chủ đích.

### Lát 6, Polish

- safe area/notch pass, mobile scroll behavior, haptics nhẹ, icon pass, lint và so UI với bundle mẫu.

## Test và nghiệm thu

### Unit

- validator nickname, target weight, weekly goal.
- calculator BMI, TDEE, macro gram, target date.

### Component

- `GradientButton`, `OnboardingHeader`, `OptionCard`, `HorizontalRulerPicker`, `WeeklyGoalSlider`, `MacroDonutChart`, `TimelineHourRow`.

### Integration/E2E

- A0 -> A14 đi hết không crash.
- relaunch app khôi phục onboarding draft.
- từ result vào tabs đúng màn mặc định.
- đổi ngày diary, đổi segmented tab meal plan, mở quick-add placeholder được.

### Done khi

- 18 màn render đúng flow và dark theme.
- UI chạy end-to-end với mock data.
- không nhét business formula trực tiếp trong screen.
- mọi CTA chính đều có destination hợp lệ dù backend chưa có.

## Giả định đã khóa

- Repo hiện là scaffold gần như trống; coi đây là greenfield UI build trong `nutrition-app-frontend`.
- V1 chỉ làm UI + flow demo, chưa làm auth/backend/AI thật.
- Bám sát look DNT; nếu thiếu font hoặc mascot gốc thì dùng asset tạm nhưng không đổi API component.

- Home tab thật, Quick Add flow thật và meal-plan non-empty state để placeholder rõ ràng ở vòng đầu.
