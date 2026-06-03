````md
# PROMPT: XÂY DỰNG CHỨC NĂNG PREMIUM VÀ THANH TOÁN VIETQR (HYBRID GATEWAY)

## [NGUYÊN TẮC CỐT LÕI - PHẢI TUÂN THỦ TUYỆT ĐỐI]

- **KHÔNG** sửa, xóa code gốc (đặc biệt là các thư viện cũ). Nếu cần can thiệp file config hoặc middleware hệ thống chung, **BẮT BUỘC** phải xin phép.
- Chỉ viết thêm file/component mới cho đúng phạm vi tính năng dưới đây.
- **Quy tắc Coding C# (.NET):** Tuân thủ nghiêm ngặt việc sử dụng các kiểu dữ liệu tường minh (ví dụ: `Subscription sub = new...`, `string signature = ...`, `bool isValid = ...`). Tuyệt đối KHÔNG dùng từ khóa `var` để đảm bảo code tường minh và đồng nhất với dự án.

---

## [PHẦN 1: TỔNG QUAN TÍNH NĂNG (SCOPE)]

- **Mục tiêu:** Xây dựng luồng nâng cấp Premium qua VietQR.
- **Kiến trúc Hybrid Gateway:** Hệ thống phải hỗ trợ 2 chế độ chạy dựa trên file `appsettings.json`.
  - **Chế độ "Live":** Tích hợp với dịch vụ cổng thanh toán thật (ví dụ: PayOS hoặc SePay) để nhận Webhook tự động.
  - **Chế độ "Mock":** Tự động bỏ qua việc gọi API bên thứ 3, cho phép gọi một API giả lập (chạy Local) để tự bắn Webhook phục vụ việc demo offline.

---

## [PHẦN 2: YÊU CẦU BACKEND C# (.NET) & API]

### 1. Cấu hình hệ thống (`appsettings.json`)

Thêm các biến cấu hình để điều khiển luồng Gateway:

```json
"PaymentGateway": {
  "Mode": "Live", // Có thể đổi thành "Mock"
  "ClientId": "...",
  "SecretKey": "...",
  "WebhookUrl": "..."
}
```
````

### 2. Luồng Thanh toán VietQR (SubscriptionController)

**Tạo đơn hàng VietQR (POST /api/Subscription/vietqr/create-order):**

- Sinh string orderId duy nhất.
- Tạo URL ảnh VietQR bằng cách nối chuỗi chuẩn NAPAS:

```csharp
string qrUrl = $"https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={amount}&addInfo={Uri.EscapeDataString("Thanh toan " + orderId)}";
```

- Trả về Frontend: `orderId` và `qrUrl`.

**Polling Trạng thái (GET /api/Subscription/vietqr/{orderId}/status):**

- API để Frontend gọi liên tục kiểm tra trạng thái đơn hàng (PENDING, PAID, FAILED).

**Webhook Callback (POST /api/Subscription/vietqr/callback):**

- Xác thực:
  - Đọc config `PaymentGateway:Mode`.
  - Nếu là "Live", dùng `SecretKey` của nhà cung cấp (PayOS/SePay) để băm HMAC-SHA256 và so sánh Header chữ ký.
  - Nếu là "Mock", dùng logic xác thực nội bộ.
  - Sai chữ ký -> trả HTTP 401.

- Lưu vết:
  - Append `raw_payload` vào bảng `subscription_events`.

- Cập nhật DB:
  - Đổi status trong `subscriptions` thành Active.
  - Cộng thêm ngày vào `current_period_end`.

---

### 3. Các API Premium Cốt Lõi

**Lấy thông tin (GET /api/Subscription/me):**

- Trả về trạng thái gói hiện tại.
- Nếu chưa mua, trả:

```json
{ "plan": "Free", "status": "active" }
```

- Tuyệt đối không lỗi 404.

**Middleware [RequiresPremium]:**

- Cho phép đi tiếp nếu:
  - status IN (Active, Trial)
  - current_period_end > NOW()

- Nếu Webhook báo huỷ gói, giữ nguyên quyền đến hết `current_period_end` (Graceful downgrade).
- Trả 403 nếu vi phạm.

---

## [PHẦN 3: YÊU CẦU FRONTEND (UI/UX)]

**Màn hình Kế hoạch & Quét mã QR:**

- Gọi API `create-order`, lấy `qrUrl` và hiển thị trực tiếp qua:

```html
<img src="{qrUrl}" />
```

- Hiển thị trạng thái: "⏳ Đang chờ..."

**Polling & Thành công:**

- Kích hoạt `setInterval` gọi API polling mỗi 3 giây.
- Nếu trả về `PAID`, đổi UI sang "✅ Thành công" và update Global State.

**Nút Giả lập (Fallback Demo):**

- Thêm nút `[Test]` Giả lập thanh toán nhỏ trên màn hình QR.
- Chỉ hiển thị khi môi trường FE là Dev/Mock.
- Khi ấn nút:
  - FE gọi thẳng API Callback Mock của Backend để ép hệ thống duyệt đơn hàng ngay lập tức.

---

## [PHẦN 4: CẤU TRÚC DATABASE]

Sử dụng DB Schema hiện tại:

- `subscription_plans`: Cấu hình tên plan, thời hạn (`duration_days`)
- `subscriptions`: Trạng thái gói, `current_period_end`. Thêm `latest_order_id` để track
- `subscription_events`: Lưu lịch sử webhook (Append-only)

### Index bắt buộc:

```sql
CREATE INDEX idx_sub_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_sub_event       ON subscription_events(subscription_id, received_at);
```

## Hành động tiếp theo (Dành cho AI/Dev):

Hãy xác nhận bạn đã hiểu rõ quy tắc KHÔNG dùng var, kiến trúc Hybrid thay đổi qua cấu hình, và bắt đầu đề xuất Controller C# xử lý Webhook Callback với chữ ký HMAC trước.
