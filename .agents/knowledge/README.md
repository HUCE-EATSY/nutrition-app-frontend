# 🧠 Hệ thống Tri thức & Tài nguyên (Agents Knowledge Base)

Thư mục này đóng vai trò là "bản đồ" và trung tâm điều phối tài nguyên cho các AI Agent. Nó cung cấp cái nhìn tổng quan về các hướng dẫn, đặc tả và công cụ hỗ trợ nhằm đảm bảo tính đồng nhất và chất lượng cao nhất cho dự án **DNT Nutrition App**.

## 📁 Sơ đồ Tài nguyên Agent

### 1. [📜 Quy tắc & Tiêu chuẩn](../rules/)
*Định nghĩa các tiêu chuẩn bắt buộc và hệ thống thiết kế.*
- **Quy trình:** [read-doc-first.md](../rules/read-doc-first.md) - Quy tắc bắt buộc kiểm tra tài liệu trước mỗi tác vụ.
- **[Thiết kế (Design System)](../rules/design/):**
  - `ui-prompts.md`: Bộ quy chuẩn để AI sinh mã giao diện (UI) phong cách premium.
  - `tokens.json`: Hệ thống Design Tokens (Màu sắc, Typography, Spacing).
  - `dnt_theme.ts`: Hiện thực hóa Theme dựa trên các Tokens.
- **[Đặc tả kỹ thuật (Specs)](../rules/specs/):**
  - `technical-spec.md`: Chi tiết về kiến trúc hệ thống và các luồng nghiệp vụ.
  - `contracts.ts`: Định nghĩa tập trung các Interfaces và Typescript Types.
  - `structure.txt`: Quy định về tổ chức thư mục và phân lớp mã nguồn.

### 2. [🛠️ Kỹ năng & Mã mẫu](../skills/)
*Các thành phần mẫu (Templates) và tài nguyên có thể tái sử dụng.*
- **[Blueprints (Mã mẫu)](../skills/blueprints/):**
  - `GradientButton.tsx`: Thành phần nút bấm tiêu chuẩn với hiệu ứng gradient.
  - `OnboardingShell.tsx`: Cấu trúc khung cho các màn hình giới thiệu (Onboarding).

### 3. [📋 Luồng công việc & Kế hoạch](../workflows/)
*Theo dõi lộ trình phát triển và các kế hoạch thực hiện.*
- `implementation-plan.md`: Tài liệu sống ghi lại kế hoạch triển khai chi tiết từng giai đoạn của dự án.

---

> [!IMPORTANT]
> **Dành cho AI Agent:** Bạn PHẢI tham chiếu đến các tài liệu trong `rules/` và `specs/` trước khi thực hiện bất kỳ thay đổi nào. Việc này giúp tránh sai lệch kiến trúc và đảm bảo giao diện luôn đạt tiêu chuẩn "Luxury & Premium" như dự án yêu cầu.
