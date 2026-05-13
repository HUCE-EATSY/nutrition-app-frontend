# 📱 Màn hình: Hồ sơ thể chất (Physical Profile)

## 1. Navbar (Thanh điều hướng)
- **[ < ] Icon Back**: Trở về màn hình trước đó.
- **Tiêu đề**: `Hồ sơ thể chất` (Căn giữa).

---

## 2. Card 1: Thông tin cơ bản (Basic Info)
> **Mô tả**: Vùng hiển thị các chỉ số nhân trắc học tĩnh của người dùng.
> **Hành động**: Nhấn vào icon `✎` để mở màn hình "Chỉnh sửa thông tin".

| Thành phần UI | Nhãn (Label) | Giá trị (Value) | Thuộc tính / UX Logic |
| :--- | :--- | :--- | :--- |
| **Header** | Thông tin cơ bản | Icon `✎` | Header Card, căn trái. |
| **Row 1** | NICKNAME | Hùng | Chữ đậm, kích thước lớn nhất trong thẻ[cite: 1]. |
| **Row 2 (Cột 1)** | GIỚI TÍNH | Nam | Chữ đậm, chia lưới ngang (Grid 3 cột)[cite: 1]. |
| **Row 2 (Cột 2)** | TUỔI | 15 | Chữ đậm, chia lưới ngang[cite: 1]. |
| **Row 2 (Cột 3)** | CHIỀU CAO | 160 cm | Chữ đậm, chia lưới ngang[cite: 1]. |

---

## 3. Card 2: Mục tiêu cân nặng (Weight Goal)
> **Mô tả**: Vùng hiển thị mục tiêu hiện tại và các thông số đo lường.
> **Hành động**: Nhấn vào icon `ⓘ` để hiển thị Tooltip giải thích cách tính toán.

**Trạng thái mục tiêu chính**: `Tăng cân` (Nổi bật, nằm độc lập ở đầu thẻ)[cite: 1].

### ▤ Danh sách thông số (List Items)

| Nhãn (Left) | Giá trị (Right) | Tương tác (Affordance) & Logic UI |
| :--- | :--- | :--- |
| **Mục tiêu hàng tuần** | Tăng 0.2 kg/tuần | Có icon `>` (Chevron Right). **Clickable**: Mở Bottom Sheet chọn mức tăng[cite: 1]. |
| **Cường độ vận động** | Vận động nhẹ n... | Có icon `>` (Chevron Right). **Clickable**. *Logic*: Dữ liệu dài sẽ bị cắt gọn bằng dấu `...` (Truncation)[cite: 1]. |
| **Calo mục tiêu** | 2225 calo | Không có icon `>`. **Read-only**: Tự động tính toán dựa trên các chỉ số trên[cite: 1]. |
| **Dự kiến hoàn thành** | 26 thg 12, 2026 | Không có icon `>`. **Read-only**: Tự động tính toán ngày đích[cite: 1]. |

---

## 4. Fixed Bottom Area (Khu vực ghim dưới cùng)
> **Mô tả**: Vùng chứa nút Call-to-Action (CTA) chính, luôn ghim ở dưới cùng màn hình để dễ bấm.

- **Nút bấm (Primary Button)**:
  - **Icon**: `🔄` (Refresh/Setup)[cite: 1].
  - **Text**: `Thiết lập mục tiêu mới`[cite: 1].
  - **Trạng thái**: Active.
  - **Hành động**: Chuyển hướng người dùng sang luồng (Flow) tạo mục tiêu mới (Onboarding/Goal Setup).
  # Bắt đầu mục tiêu mới

Wao sẽ làm mới hành trình dựa trên cân nặng hiện tại và mục tiêu của bạn.

### Khi bạn thiết lập lại mục tiêu, Wao sẽ:

1. Tính lại TDEE, BMR và lượng calo mục tiêu.
2. Cập nhật lại hành trình để phản ánh đúng tiến độ theo mục tiêu mới.

---

| [ Từ chối ] | [ Thiết lập mới ] |
### sau khi nhấn vào thiết lập mới 
1. gọi lại phần thiết lập mục tiêu của @onboarding-flow.md
