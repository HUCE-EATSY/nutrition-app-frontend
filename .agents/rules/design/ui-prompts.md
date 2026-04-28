# Phân tích giao diện và prompt chi tiết để dựng UI tương tự

## 1) Tóm tắt nhanh bộ giao diện

Bộ ảnh gồm **18 màn hình mobile app** cho một ứng dụng dinh dưỡng / sức khỏe cá nhân hóa với phong cách:

- **Dark theme** nền tím đen rất sâu
- **Accent tím phát sáng** làm màu chủ đạo
- **Mascot hoạt hình** dẫn dắt toàn bộ onboarding
- **UI thiên về cảm xúc + data**: vừa thân thiện, vừa có dashboard dinh dưỡng, biểu đồ, progress
- **Thiết kế bo tròn mạnh**, card lớn, nút CTA full-width, bottom navigation nổi bật
- **Ngôn ngữ thị giác:** “cute nhưng vẫn premium và công nghệ”

## 2) Luồng màn hình theo bộ ảnh

### Cụm A0–A2: Chào mừng / giới thiệu / đăng nhập
- **A0**: Splash/hero onboarding  
  Logo ở trên, mascot ở giữa, headline lớn, mô tả ngắn, pagination dots, nút CTA full-width ở đáy.
- **A1**: Đăng nhập mạng xã hội  
  Background gradient tím đen, headline lớn ở giữa, 2 nút social login dạng pill (Google, Facebook), text legal ở dưới.
- **A2**: Mascot greeting  
  Bong bóng chat trắng rất to ở phần trên, mascot full-body ở trung tâm, các icon nổi xung quanh, CTA ở đáy.

### Cụm A3–A11: Onboarding dạng hội thoại + form
- **A3**: Nhập nickname
- **A4**: Chọn giới tính bằng 2 thẻ lớn
- **A5**: Chọn ngày sinh bằng wheel picker
- **A6**: Chọn chiều cao bằng thước/ruler dọc ngang
- **A7**: Chọn mục tiêu cân nặng bằng option cards
- **A8**: Chọn cân nặng hiện tại bằng thước/ruler + hiển thị BMI
- **A9**: Chọn cân nặng mong muốn bằng thước/ruler + BMI
- **A10**: Chọn cường độ tập luyện bằng danh sách option cards
- **A11**: Chọn tốc độ/mục tiêu hàng tuần bằng slider

Điểm chung của cụm này:
- Header rất tối giản: nút back + progress bar
- Mascot nhỏ ở bên trái, bong bóng chat trắng chứa câu hỏi
- Vùng nội dung lớn, thoáng, tập trung một tác vụ
- CTA “Tiếp tục” cố định gần đáy
- Typography lớn, rõ, dễ thao tác bằng một tay

### Cụm A12–A14: Tóm tắt và tính toán kết quả
- **A12**: Review thông tin đầu vào  
  Card lớn tóm tắt mục tiêu, cân nặng, mức vận động; có minh họa; dưới là BMI scale nhiều màu.
- **A13**: Loading / calculating  
  Danh sách các bước tính toán với progress bars; dưới có testimonial/review dạng card carousel.
- **A14**: Kết quả kế hoạch sức khỏe  
  Hero chart ở đầu trang, số calo theo ngày/tuần, breakdown TDEE và deficit, dự đoán ngày đạt mục tiêu, biểu đồ macro hình donut, CTA “Bắt đầu hành trình”.

### Cụm A15–A17: Sản phẩm chính sau onboarding
- **A15**: Nhật ký theo timeline giờ  
  Thanh tiêu thụ calories/macros ở trên, danh sách mốc giờ, nút cộng ở từng dòng, bottom nav.
- **A16**: Hồ sơ cá nhân / tài khoản  
  Avatar, gói dùng thử, chỉ số cơ bản, hành trình cân nặng, mục tiêu dinh dưỡng & macros, lối vào các báo cáo, social links, support.
- **A17**: Thực đơn / meal plan empty state  
  Title lớn, segmented tabs, minh họa empty state, 2 CTA lớn.

---

## 3) DNA thiết kế của bộ UI

## 3.1 Màu sắc ước lượng từ ảnh
Dùng các giá trị này như **design tokens khởi điểm**:

- `bg.base`: `#111020`
- `bg.elevated`: `#1C1A2C`
- `surface.1`: `#252238`
- `surface.2`: `#302C44`
- `primary.500`: `#A56CFF`
- `primary.600`: `#8E57F5`
- `primary.700`: `#6D3DE6`
- `primary.soft`: `rgba(165,108,255,0.16)`
- `text.primary`: `#FFFFFF`
- `text.secondary`: `#C7C3D8`
- `text.muted`: `#9B97AE`
- `border.soft`: `rgba(255,255,255,0.08)`
- `warning`: `#F2B437`
- `protein`: `#FF5A5F`
- `carbs`: `#3D8BFF`
- `fat`: `#F5B323`
- `success`: `#5CD67A`

### 3.2 Gradient
- Background top glow: tím đậm lan mờ từ trên xuống
- Primary CTA: gradient ngang từ tím sáng sang tím pastel
- Card hero/chart: có glow tím rất nhẹ ở nền

Gợi ý:
- `linear-gradient(180deg, #4A1F76 0%, #151124 28%, #111020 100%)`
- `linear-gradient(90deg, #9F6CFF 0%, #B07EFF 100%)`

### 3.3 Typography
- Font sans hiện đại, bo mềm, đọc tốt trên mobile
- Headline: đậm, to, line-height thoáng
- Body: xám tím nhạt, không quá trắng
- Số liệu: cực lớn, đậm, tương phản cao

Gợi ý scale:
- Display: 36–44
- H1: 30–36
- H2: 24–28
- H3: 20–22
- Body: 16–18
- Caption: 12–14

### 3.4 Spacing & shape
- Safe area padding: 20–24
- Khoảng cách section: 24–32
- Card radius: 20–28
- Button radius: 24–28
- Icon container radius: 14–20
- Thành phần đều bo tròn mềm, ít góc vuông

### 3.5 Thành phần UI lặp lại
- **Mascot chat bubble**
- **Progress header**
- **Pill / segmented tabs**
- **Option card**
- **Ruler input**
- **Bottom CTA**
- **Stat card**
- **Macro donut**
- **Bottom navigation**
- **Timeline row**
- **Empty state illustration**

---

## 4) Phân tích chi tiết từng pattern để code lại

### 4.1 Welcome hero screen
Cấu trúc:
1. Status bar + logo
2. Hero illustration/mascot ở giữa
3. Headline 2 dòng
4. Description 2 dòng
5. Pagination dots
6. CTA full width ở dưới

Cảm giác:
- Cần nhiều khoảng thở
- Mascot là tâm điểm
- Dùng glow + vignette để tạo chiều sâu

### 4.2 Social login screen
Cấu trúc:
1. Nút close ở góc phải trên
2. Headline căn giữa
3. Subtext căn giữa
4. 2 social buttons full width
5. Legal text
6. Decorative particle/wave ở dưới đáy

Yêu cầu code:
- Nút social không dùng màu thương hiệu quá gắt
- Chỉ icon giữ màu hãng; phần nền vẫn tối

### 4.3 Conversational onboarding
Mỗi màn gồm:
1. Back button
2. Thin progress bar
3. Mascot avatar nhỏ bên trái
4. Speech bubble trắng với câu hỏi
5. Input zone theo loại câu hỏi
6. CTA ở đáy

Các loại input:
- Text input
- 2-choice gender cards
- Wheel picker cho ngày sinh
- Ruler/scale cho chiều cao/cân nặng
- Option cards nhiều dòng
- Slider mức độ mục tiêu

Điểm UX quan trọng:
- Câu hỏi luôn nổi bật nhất
- Input rất lớn để dễ thao tác
- Nút CTA disable khi chưa chọn

### 4.4 Summary screen
- Speech bubble ở trên
- 1 card lớn tóm tắt mục tiêu + minh họa nhân vật
- 1 thanh BMI nhiều màu với marker
- 1 card cảnh báo/nhận xét BMI
- CTA

### 4.5 Loading / calculation screen
- Headline vui vẻ kiểu “đang tính toán cho bạn”
- Nhiều progress row
- Spinner tròn nhỏ ở bên phải mỗi dòng
- Review carousel ở phần dưới
- Có thể animate tuần tự từng bước

### 4.6 Result plan screen
- Hero chart ở đầu trang
- Card số liệu 2 cột: calories/day, calories/week
- Breakdown cards
- Goal projection card
- Macro donut card
- Information banner
- CTA lớn

### 4.7 Diary timeline screen
- App bar: menu, ngày hiện tại, nút chuyển ngày
- Macro summary ngang ở trên
- Danh sách timeline theo giờ
- Mỗi dòng có nhãn giờ và nút dấu cộng
- Bottom navigation cố định

### 4.8 Profile screen
- Title lớn
- Avatar tròn + nút edit nhỏ
- Trial banner
- Quick stats (tuổi, chiều cao, cân nặng)
- Card hành trình
- Card macro goals
- Shortcut icons cho báo cáo
- Community banner
- Social links
- Support row
- App footer + version
- Bottom navigation

### 4.9 Meal plan empty state
- Title lớn + subtitle
- Segmented tabs ngang
- Empty illustration ở giữa
- 2 CTA stacked
- Bottom navigation

---

## 5) Prompt tổng quát để AI tạo giao diện tương tự (thiên về UI/visual)

Sao chép prompt này vào công cụ tạo UI, Figma AI, Midjourney-style UI generator, Galileo, v0 visual mode, hoặc ChatGPT image/UI mode:

```text
Thiết kế giao diện mobile app cho ứng dụng dinh dưỡng và sức khỏe cá nhân hóa dành cho người Việt, phong cách dark premium + cute mascot, hiện đại, mềm mại, công nghệ nhưng thân thiện.

Mục tiêu là tạo một bộ UI hoàn chỉnh cho app hỗ trợ:
- onboarding bằng hội thoại
- nhập hồ sơ thể chất
- tính toán mục tiêu calo và macro
- nhật ký ăn uống theo khung giờ
- thực đơn AI
- hồ sơ cá nhân và tiến trình cân nặng

Phong cách hình ảnh:
- nền tím đen rất sâu, có glow tím nhẹ ở vùng trên
- accent tím pastel phát sáng
- thẻ/card bo tròn lớn
- nút CTA full-width, gradient tím sáng
- typography sans hiện đại, đậm, dễ đọc
- icon line hoặc duotone tinh gọn
- mascot mèo tím đáng yêu nhưng hơi tinh nghịch, xuất hiện xuyên suốt onboarding
- dùng nhiều khoảng thở, không chật chội
- dữ liệu sức khỏe hiển thị theo cách trực quan và thân thiện

Thiết kế theo mobile Android kích thước 1080x2340, safe area chuẩn, ưu tiên trải nghiệm một tay, giao diện rất mượt và có chiều sâu bằng blur, glow, overlay, translucent surfaces nhẹ.

Tạo các màn hình sau:
1. màn hình chào mừng với logo, mascot lớn, headline, mô tả, dots và CTA
2. màn hình đăng nhập social với Google và Facebook
3. màn hình mascot greeting với speech bubble trắng lớn
4. chuỗi onboarding dạng chat gồm:
   - nickname
   - giới tính
   - ngày sinh
   - chiều cao
   - mục tiêu cân nặng
   - cân nặng hiện tại
   - cân nặng mục tiêu
   - cường độ tập luyện
   - mục tiêu hàng tuần
5. màn hình tổng hợp thông tin đầu vào
6. màn hình đang tính toán với progress bars và review card
7. màn hình kết quả kế hoạch sức khỏe gồm:
   - biểu đồ tiến trình ở đầu trang
   - lượng calo mỗi ngày và mỗi tuần
   - breakdown TDEE và calorie deficit
   - dự đoán ngày đạt mục tiêu
   - donut chart macro protein/carb/fat
   - CTA bắt đầu hành trình
8. màn hình nhật ký theo giờ
9. màn hình hồ sơ cá nhân
10. màn hình thực đơn empty state

Yêu cầu chi tiết:
- tất cả nút và card bo tròn lớn, tối giản, premium
- dùng màu tím làm hệ nhận diện chính, không dùng quá nhiều màu phụ
- văn bản tiếng Việt
- số liệu và phần quan trọng phải cực kỳ nổi bật
- tránh phong cách enterprise cứng nhắc
- tránh thiết kế quá sáng hoặc flat
- tránh dùng màu neon gắt
- ưu tiên cảm giác giống một health app cao cấp dành cho Gen Z và Millennials

Kết quả cần trả ra:
- bộ mockup hoàn chỉnh theo từng màn
- nhất quán về design system
- có component lặp lại
- có state selected, disabled, empty
- có bottom navigation cho phần app chính
```

---

## 6) Prompt mạnh hơn để AI sinh **code** chứ không chỉ mockup

Dùng prompt này cho ChatGPT, Claude, Cursor, Windsurf, Bolt, v0, Lovable hoặc bất kỳ AI nào có khả năng sinh code.

### Bản prompt cho React Native + Expo + TypeScript

```text
Hãy đóng vai senior product designer + senior React Native engineer.

Tôi cần bạn code một mobile app React Native bằng Expo + TypeScript, tái hiện phong cách của một ứng dụng dinh dưỡng/sức khỏe cao cấp với dark theme tím đen, mascot dễ thương, onboarding hội thoại và dashboard macro/calorie.

Yêu cầu bắt buộc:
- dùng Expo + TypeScript
- dùng React Navigation
- dùng expo-linear-gradient
- dùng react-native-svg để vẽ chart/donut
- tạo design system rõ ràng: colors, typography, spacing, radius, shadows
- tách reusable components
- code sạch, có cấu trúc thư mục rõ
- không dùng UI library nặng; ưu tiên custom components
- hỗ trợ dark theme mặc định
- tất cả text dùng tiếng Việt
- giao diện phải giống tinh thần sau: dark purple premium, rounded cards, bright purple CTA, soft glow, minimal but emotional

Hãy tạo các màn hình:
1. WelcomeScreen
2. SocialLoginScreen
3. MascotIntroScreen
4. NicknameScreen
5. GenderScreen
6. BirthDateScreen
7. HeightScreen
8. GoalTypeScreen
9. CurrentWeightScreen
10. TargetWeightScreen
11. ActivityLevelScreen
12. WeeklyGoalScreen
13. SummaryScreen
14. CalculatingScreen
15. HealthPlanResultScreen
16. DiaryTimelineScreen
17. ProfileScreen
18. MealPlanEmptyScreen

Thiết kế và hành vi mong muốn:
- Header onboarding có nút back và progress bar mảnh
- Speech bubble trắng với avatar mascot ở bên trái
- CTA full width ở đáy, disabled state khi chưa nhập/chọn
- Ruler input cho chiều cao/cân nặng bằng horizontal scale
- Slider cho weekly goal
- Summary screen có BMI bar nhiều màu và card nhận xét
- Calculating screen có nhiều progress rows animate tuần tự
- HealthPlanResultScreen có:
  - hero line chart đầu trang
  - calories/day và calories/week
  - cards breakdown
  - target date card
  - donut chart macro protein/carb/fat
- DiaryTimelineScreen có timeline giờ từ 07:00 đến 23:00, mỗi dòng có nút cộng
- ProfileScreen có avatar, trial banner, quick stats, progress card, macro card, social section, support row
- MealPlanEmptyScreen có segmented tabs + empty state illustration + 2 CTA

Hãy dùng palette gần như sau:
- background: #111020
- elevated: #1C1A2C
- surface: #252238
- surfaceAlt: #302C44
- primary: #A56CFF
- primaryDark: #6D3DE6
- primaryGradientFrom: #9F6CFF
- primaryGradientTo: #B07EFF
- textPrimary: #FFFFFF
- textSecondary: #C7C3D8
- textMuted: #9B97AE
- warning: #F2B437
- protein: #FF5A5F
- carbs: #3D8BFF
- fat: #F5B323

Kiến trúc thư mục mong muốn:
- src/theme
- src/components
- src/screens/onboarding
- src/screens/main
- src/navigation
- src/data
- src/utils

Hãy trả ra theo thứ tự:
1. cấu trúc thư mục
2. package dependencies
3. theme tokens
4. reusable components
5. navigation setup
6. code đầy đủ cho từng màn hình
7. mock data
8. hướng dẫn chạy dự án

Quy tắc output:
- luôn xuất code hoàn chỉnh, không pseudo-code
- không bỏ sót import
- không dùng lorem ipsum
- dùng dữ liệu mẫu thực tế bằng tiếng Việt
- chú ý spacing, radius, bóng đổ, gradient, trạng thái selected/disabled
- code phải chạy được khi copy vào dự án Expo mới
```

---

## 7) Prompt nếu bạn muốn AI dựng theo **screen spec cực chi tiết**

```text
Hãy code một ứng dụng mobile health app theo đúng screen spec sau.

## Global style
- dark background #111020
- top purple glow
- white large headings
- secondary text light lavender gray
- primary CTA button gradient from #9F6CFF to #B07EFF
- border radius 24
- section gap 24
- padding horizontal 24
- use safe area
- bottom navigation fixed for main app screens
- all cards rounded, soft, premium, slightly elevated
- mascot style: purple cat, cute but a little mischievous

## Screen A0 - Welcome
- center logo on upper half
- large mascot illustration in center
- headline: "Ứng dụng dinh dưỡng top #1 App Store"
- subtitle under headline
- pagination dots
- bottom full-width CTA "Bắt đầu ngay"

## Screen A1 - Social login
- top right close icon
- centered title and subtitle
- 2 pill social buttons: Google, Facebook
- legal text below
- decorative glowing wave on bottom

## Screen A2 - Mascot intro
- back button top left
- large white speech bubble near top with introduction text
- mascot centered, large, with floating icons around
- bottom CTA "Chào DNT nha!"

## Screen A3 - Nickname
- back button
- thin progress bar
- mascot small avatar left
- large speech bubble with question
- helper text
- large text input field
- disabled CTA until valid input

## Screen A4 - Gender
- same onboarding shell
- two large option cards side by side
- selected state with purple glow

## Screen A5 - Birth date
- same onboarding shell
- 3-column wheel picker for day, month, year
- focused row highlighted

## Screen A6 - Height
- same onboarding shell
- large numeric display
- horizontal ruler scale
- CTA

## Screen A7 - Goal type
- same onboarding shell
- 3 stacked option cards with title + description

## Screen A8 - Current weight
- same onboarding shell
- large number display with kg
- horizontal ruler scale
- BMI analysis card below

## Screen A9 - Target weight
- same layout as current weight

## Screen A10 - Activity level
- same onboarding shell
- 5 stacked option cards with icons

## Screen A11 - Weekly goal
- same onboarding shell
- large number display in kg
- horizontal slider from slow to fast
- small recommendation text

## Screen A12 - Summary
- speech bubble top
- large summary card with illustration and key profile facts
- colored BMI bar with current marker
- BMI feedback card
- CTA

## Screen A13 - Calculating
- centered title
- 3 progress rows
- small circular loaders on the right
- testimonial carousel at bottom

## Screen A14 - Result
- top hero goal line chart
- title section
- calories/day and calories/week split card
- TDEE and deficit cards
- target date card
- recommendation paragraph
- macro donut chart card
- bottom info banner
- large CTA

## Screen A15 - Diary timeline
- top app bar with date and arrows
- horizontal macro summary row
- time-based list from 07:00 to 23:00
- plus button each row
- bottom nav active tab: Nhật ký

## Screen A16 - Profile
- profile title
- circular avatar with edit button
- free trial banner
- quick stats row
- body profile button
- progress journey card
- macro goal card
- report shortcuts row
- community banner
- social links cards
- support row
- footer logo/version
- bottom nav active tab: Tài khoản

## Screen A17 - Meal plan empty
- page title and subtitle
- segmented tabs
- centered empty illustration
- main CTA "Tạo thực đơn bằng AI"
- secondary CTA "Chọn từ kế hoạch đã lưu"
- bottom nav active tab: Thực đơn

Yêu cầu cuối:
- tạo reusable components cho onboarding shell, gradient button, option card, ruler input, donut chart, bottom nav
- tạo navigation giữa các màn
- tạo mock data
- code chạy được
```

---

## 8) Checklist để ép AI sinh code ra đẹp hơn

Thêm đoạn này vào cuối prompt:

```text
Trước khi xuất code, hãy tự kiểm tra:
- spacing đã đủ thoáng chưa
- button radius đã lớn chưa
- card surface đã đủ tách nền chưa
- hierarchy chữ đã rõ chưa
- các màn có nhất quán về shell onboarding chưa
- selected state có rõ không
- disabled state có đủ tương phản nhưng vẫn nhìn inactive không
- bottom nav có đồng bộ icon + label không
- hero/result screens có đủ cảm giác premium và data-driven không
- code có chạy được ngay không
```

---

## 9) Thành phần nên yêu cầu AI tách ra thành reusable components

Nên yêu cầu tách tối thiểu các component sau:

- `ScreenContainer`
- `TopGlowBackground`
- `GradientButton`
- `OnboardingHeader`
- `MascotQuestionBubble`
- `OptionCard`
- `DualChoiceCard`
- `HorizontalRuler`
- `MetricDisplay`
- `MacroSummaryBar`
- `MacroDonutChart`
- `StatSplitCard`
- `ProfileStatChip`
- `BottomTabBar`
- `TimelineHourRow`
- `SectionTitle`
- `InfoBanner`
- `ReviewCarousel`

---

## 10) Cấu trúc dữ liệu gợi ý cho dev/AI code

```ts
type UserProfile = {
  nickname: string;
  gender: 'female' | 'male';
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  goalType: 'lose' | 'gain' | 'maintain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  weeklyGoalKg: number;
};

type NutritionPlan = {
  caloriesPerDay: number;
  caloriesPerWeek: number;
  tdee: number;
  calorieDeficit: number;
  projectedGoalDate: string;
  macros: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
    proteinGram: number;
    carbsGram: number;
    fatGram: number;
  };
};

type DiaryEntry = {
  id: string;
  time: string;
  title?: string;
  calories?: number;
};
```

---

## 11) Gợi ý animation để app giống ảnh hơn

- Progress bar onboarding animate nhẹ từ trái sang phải
- Speech bubble fade + slide up
- CTA button scale rất nhẹ khi nhấn
- Loading rows chạy tuần tự
- Donut chart animate stroke
- Hero chart ở result page animate line draw
- Selected card có purple glow nhẹ
- Bottom nav icon active có tint tím sáng

---

## 12) Sai lầm cần tránh khi prompt

Không nên để AI:
- dùng nền đen thuần 100%
- dùng quá nhiều màu neon
- biến app thành fintech hoặc admin dashboard
- dùng card quá vuông
- nhồi quá nhiều text
- dùng icon quá dày hoặc quá nhiều chi tiết
- dùng chart quá kỹ thuật, thiếu cảm xúc
- bỏ mascot trong onboarding
- làm CTA nhỏ hoặc nhiều nút ngang gây rối

---

## 13) Prompt rút gọn nếu bạn muốn dùng rất nhanh

```text
Tạo mobile app UI bằng React Native Expo TypeScript cho ứng dụng dinh dưỡng cá nhân hóa phong cách dark purple premium. Dùng nền #111020, card #252238, accent tím #A56CFF, button gradient tím sáng, bo góc lớn 24+, chữ trắng, text phụ lavender gray. App gồm onboarding hội thoại có mascot mèo tím, question bubble trắng, input lớn, progress bar mảnh; sau đó có summary, loading, result plan với calories/macro charts; phần app chính có diary timeline, profile dashboard, meal plan empty state, bottom navigation. Yêu cầu code sạch, component hóa, reusable, chạy được ngay.
```

---

## 14) Kết luận thực chiến

Nếu mục tiêu của bạn là **dùng AI để ra code gần giống nhất**, hãy dùng thứ tự này:

1. Dán **Prompt ở mục 6**
2. Dán thêm **screen spec ở mục 7**
3. Dán thêm **checklist ở mục 8**
4. Yêu cầu AI xuất lần lượt:
   - theme tokens
   - reusable components
   - onboarding screens
   - result screen
   - main app screens

Cách này thường cho chất lượng code tốt hơn việc chỉ bảo “clone giao diện này”.

