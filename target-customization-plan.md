# Kế hoạch triển khai: Tùy chỉnh mục tiêu (Target Customization)

Tài liệu này tổng hợp toàn bộ ý tưởng thiết kế, cấu trúc file và các thay đổi cần thiết cho cả **Backend** và **Frontend** để phát triển tính năng **Tùy chỉnh mục tiêu**.

---

## 1. Luồng hoạt động & Giao diện chính (User Flow & UI)

### 📌 Giao diện Tùy chỉnh mục tiêu chính (`app/account/targets/index.tsx`)
- **Dữ liệu thật**: Thay thế hoàn toàn Mock Data hiện tại bằng cách gọi API `GET /api/User/info` thông qua hook `useGetUserInfo()`.
- **Hiển thị Macro Ring Charts**:
  - **Calo mục tiêu**: Hiển thị số calo từ `activeGoal.targetCalories`.
  - **Chất đạm (Protein)**, **Đường bột (Carbs)**, **Chất béo (Fat)**: Hiển thị vòng tròn tiến trình tỉ lệ phần trăm (%) tương ứng. 
  - *Công thức tính % từ Gram*:
    - $\% \text{Protein} = (\text{Protein} \times 4) / \text{Calo} \times 100$
    - $\% \text{Carbs} = (\text{Carbs} \times 4) / \text{Calo} \times 100$
    - $\% \text{Fat} = (\text{Fat} \times 9) / \text{Calo} \times 100$
- **Thẻ chỉ số năng lượng (BMR, TDEE, Calo cộng thêm)**:
  - **BMR**: Lấy từ `activeGoal.bmrKcal`.
  - **TDEE**: Lấy từ `activeGoal.tdeeKcal`.
  - **Calo cộng thêm/thâm hụt**: Tính toán bằng $\text{TargetCalories} - \text{TDEE}$. Nếu dương hiển thị là cộng thêm, nếu âm hiển thị dạng thâm hụt.
- **Danh sách tùy chỉnh**:
  - Nhấp vào **Calo mục tiêu** -> Điều hướng tới `app/account/targets/calories.tsx`.
  - Nhấp vào **Tỷ lệ dinh dưỡng đa lượng** -> Điều hướng tới `app/account/targets/macros.tsx`.
  - Nhấp vào **Lượng nước** -> Điều hướng tới `app/account/targets/water.tsx`.
  - Nhấp vào **Bước chân mục tiêu** -> Điều hướng tới `app/account/targets/steps.tsx`.

---

## 2. Chi tiết các màn hình con điều chỉnh (Sub-screens)

### 1️⃣ Điều chỉnh Calo mục tiêu (`app/account/targets/calories.tsx`)
- **UI**: Cho phép nhập số lượng Calo trực tiếp.
- **Logic**:
  - Khi lưu, tính toán lại số Gram của các chất đa lượng giữ nguyên tỉ lệ phần trăm cũ nhưng áp dụng theo Calo mới.
  - Gọi API `PUT /api/User/goal` để lưu.

### 2️⃣ Điều chỉnh Tỷ lệ dinh dưỡng đa lượng (`app/account/targets/macros.tsx`)
- **UI**: 3 thanh trượt (Sliders) điều chỉnh phần trăm (%) cho Protein, Carbs, Fat.
- **Ràng buộc**: Tổng tỉ lệ phần trăm của 3 chất bắt buộc phải bằng **100%**. Nếu khác 100%, nút Lưu sẽ bị vô hiệu hóa kèm theo cảnh báo màu đỏ.
- **Logic**:
  - Khi lưu, tính toán ra Gram:
    - $\text{Protein(g)} = (\text{Calo} \times \% \text{Protein}) / 4$
    - $\text{Carbs(g)} = (\text{Calo} \times \% \text{Carbs}) / 4$
    - $\text{Fat(g)} = (\text{Calo} \times \% \text{Fat}) / 9$
  - Gọi API `PUT /api/User/goal` để lưu.

### 3️⃣ Điều chỉnh Lượng nước & Bước chân (`water.tsx` & `steps.tsx`)
- **UI**: Ô nhập số (ml nước hoặc số bước chân).
- **Lưu trữ**: 
  - *Lựa chọn A (Đề xuất)*: Lưu cục bộ thông qua AsyncStorage hoặc store Zustand persist của Frontend.
  - *Lựa chọn B*: Bổ sung API và cột lưu trữ trên database Backend.

---

## 3. Danh sách các File thay đổi & Tạo mới

### 🌐 Frontend (React Native / Expo)

| Trạng thái | Đường dẫn File | Vai trò |
| :--- | :--- | :--- |
| **[MODIFY]** | `app/account/targets/index.tsx` | Kết nối API thật, render vòng tròn dinh dưỡng và thông số BMR/TDEE từ DB. |
| **[NEW]** | `app/account/targets/calories.tsx` | Màn hình con chỉnh sửa Calo mục tiêu. |
| **[NEW]** | `app/account/targets/macros.tsx` | Màn hình con chỉnh sửa tỉ lệ dinh dưỡng đa lượng (Protein/Carb/Fat). |
| **[NEW]** | `app/account/targets/water.tsx` | Màn hình con chỉnh sửa lượng nước mục tiêu. |
| **[NEW]** | `app/account/targets/steps.tsx` | Màn hình con chỉnh sửa số bước chân mục tiêu. |
| **[MODIFY]** | `services/userService.ts` | Khai báo API gọi cập nhật mục tiêu mới. |

### 🖥️ Backend (.NET Web API)

*Nếu lưu trữ Lượng nước & Bước chân trên Backend (Lựa chọn B), các file sau sẽ thay đổi:*

| Trạng thái | Đường dẫn File | Vai trò |
| :--- | :--- | :--- |
| **[MODIFY]** | `Models/Users/UserGoal.cs` | Thêm cột `TargetWaterMl` và `TargetSteps`. |
| **[MODIFY]** | `DTOs/Users/UserGoalResponse.cs` | Bổ sung các trường mới vào Response trả về cho Frontend. |
| **[MODIFY]** | `DTOs/Users/UpdateUserGoalRequest.cs` | Bổ sung các trường mới vào Request khi update mục tiêu. |
| **[MODIFY]** | `Services/User/UserService.cs` | Xử lý logic gán giá trị mặc định lúc onboarding và cập nhật mục tiêu mới. |

---

## 4. Câu hỏi cần làm rõ từ phía bạn

> **Đối với mục tiêu Lượng nước và Bước chân:**
> Bạn muốn triển khai theo **Lựa chọn A** (Lưu offline ngay trên thiết bị app) hay **Lựa chọn B** (Đồng bộ lên database Backend)? 
