Dưới đây là prompt ngắn gọn, chuẩn cấu trúc Flexbox để bạn cung cấp cho AI agent sinh code (rất phù hợp cho `SectionList` hoặc `FlatList` trong React Native):

---

**Yêu cầu xây dựng UI Component: "Weight History List" (Dark Mode)**

**1. Top Navigation Bar (Header)**

* Cấu trúc: `flex-direction: row`, `align-items: center`, `justify-content: space-between`.
* **Trái:** Icon Back (Mũi tên quay lại).
* **Giữa:** Title "Lịch sử cân nặng" (Màu trắng, font-weight: bold, text-align: center).
* **Phải:** View trống (để cân bằng icon bên trái, giúp Title vào giữa tuyệt đối).

**2. List Layout (Section List)**

* Bố cục danh sách cuộn dọc (Vertical Scroll).
* **Section Header (Tiêu đề nhóm):**
* Text hiển thị tháng năm (VD: "Tháng 5, 2026").
* Styling: Màu trắng, font-weight: bold, size vừa, margin-top (~16px), margin-bottom (~12px).



**3. Cấu trúc Item Card (Bản ghi cân nặng)**

* **Container:** Khối nền màu xám đen (dark gray, nhạt hơn nền tổng thể), bo góc (border-radius: ~12px), padding xung quanh (~12px), margin-bottom (~10px).
* **Bố cục Container:** `flex-direction: row`, `align-items: center`, `justify-content: space-between`.
* **Cụm Trái (Left Content - flex-direction: row, align-items: center):**
* `Thumbnail`: Hình vuông bo góc (~8px), kích thước khoảng 48x48px (hiển thị ảnh hoặc icon placeholder).
* `Info Column` (flex-direction: column, margin-left: ~12px):
* Text Cân nặng: VD "54.1 kg" (Màu trắng, in đậm).
* Nguồn ghi (Row): Icon điện thoại nhỏ + Text "Ghi bởi Wao" (Màu xám nhạt/light gray, size nhỏ, căn giữa theo chiều dọc `align-items: center`, margin-top: ~4px).




* **Cụm Phải (Right Content):**
* Text Ngày tháng: VD "15/05" (Màu xám nhạt, size nhỏ).



**Lưu ý cho AI:** Đảm bảo sử dụng màu nền chuẩn Dark Mode, tạo độ tương phản tốt giữa Container Card và nền màn hình chính. Sử dụng Flexbox để xử lý responsive.