Viewed Google_signIn_Test-Guild.md:1-48
Listed directory nutrition-app-backend
Viewed appsettings.json:1-18
Viewed appsettings.Development.json:1-34
Listed directory Properties
Viewed launchSettings.json:1-41
Listed directory nutrition-app-frontend
Viewed .env:1-4
Viewed package.json:1-65

Dưới đây là hướng dẫn chi tiết từng bước để cấu hình và chạy cả **Backend (ASP.NET Core)** và **Frontend (React Native / Expo)** của dự án **Wao Health App**.

---

### PHẦN 1: HƯỚNG DẪN CHẠY BACKEND

Thư mục Backend: `E:\2.FileGhiChu\3-ki2\LapTrinhDaNenTang\đồ án\nutrition-app\nutrition-app-backend`

#### 1. Chuẩn bị Cơ sở dữ liệu (MySQL)
* Đảm bảo rằng máy chủ **MySQL** của bạn đang chạy.
* Mở và kiểm tra cấu hình kết nối trong file [appsettings.Development.json](file:///e:/2.FileGhiChu/3-ki2/LapTrinhDaNenTang/đồ%20án/nutrition-app/nutrition-app-backend/appsettings.Development.json):
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=wao_health_app;User=root;Password=1234;"
  }
  ```
  *(Hãy thay đổi `User` và `Password` cho khớp với tài khoản MySQL trên máy của bạn).*

* Nếu bạn chạy cơ sở dữ liệu lần đầu tiên hoặc dự án có các cập nhật cơ sở dữ liệu mới (Entity Framework Migrations), hãy mở Terminal tại thư mục Backend và chạy lệnh sau để áp dụng các thay đổi cấu trúc bảng:
  ```powershell
  dotnet ef database update
  ```

#### 2. Khởi chạy Backend API
Mở một cửa sổ Terminal mới, di chuyển đến thư mục Backend và khởi chạy server:

```powershell
cd "E:\2.FileGhiChu\3-ki2\LapTrinhDaNenTang\đồ án\nutrition-app\nutrition-app-backend"
dotnet run --launch-profile http
dotnet clean && dotnet run
```dotnet run --launch-profile http

> [!TIP]
> **Tại sao nên chạy `--launch-profile http`?**
> Cấu hình này sẽ lắng nghe trên cổng `http://0.0.0.0:5184`. Việc binding vào `0.0.0.0` cho phép thiết bị di động thật (điện thoại của bạn) hoặc máy ảo giả lập kết nối tới Backend thông qua mạng Wi-Fi nội bộ bằng địa chỉ IP máy tính của bạn.
> 
> Sau khi chạy, bạn có thể kiểm tra xem API đã hoạt động chưa bằng cách truy cập Swagger UI:
> `http://localhost:5184/swagger/index.html`

---

### PHẦN 2: HƯỚNG DẪN CHẠY FRONTEND (React Native / Expo)

Thư mục Frontend: `E:\2.FileGhiChu\3-ki2\LapTrinhDaNenTang\đồ án\nutrition-app\nutrition-app-frontend`

#### 1. Cấu hình biến môi trường (`.env`)
Mở file [.env](file:///e:/2.FileGhiChu/3-ki2/LapTrinhDaNenTang/đồ%20án/nutrition-app/nutrition-app-frontend/.env) ở Frontend và cấu hình như sau:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=37494016896-lausg65jmt062frh5o4r2uuf84rla3f7.apps.googleusercontent.com

# Địa chỉ IP máy tính chạy Backend của bạn (Không dùng localhost hay 127.0.0.1)
EXPO_PUBLIC_API_URL=http://<IP_MÁY_TÍNH_CỦA_BẠN>:5184

# Sử dụng dữ liệu thật từ Backend (Gán = true nếu bạn chỉ muốn test UI bằng dữ liệu giả lập)
EXPO_PUBLIC_USE_MOCK=false
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=37494016896-lausg65jmt062frh5o4r2uuf84rla3f7.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://192.168.102.85:5184
EXPO_PUBLIC_USE_MOCK=false
> [!IMPORTANT]
> **Cách lấy IP máy tính của bạn trên Windows:**
> 1. Mở Terminal / PowerShell.
> 2. Gõ lệnh: `ipconfig`
> 3. Tìm dòng **IPv4 Address** (thường có dạng `192.168.1.XX` hoặc `192.168.100.XX`).
> 4. Thay thế địa chỉ đó vào `EXPO_PUBLIC_API_URL` (ví dụ: `http://192.168.1.15:5184`). 
> *(Không sử dụng `localhost` vì các thiết bị di động / giả lập ngoài máy tính sẽ không hiểu `localhost` là máy chủ của bạn).*

#### 2. Cài đặt các thư viện (Dependencies)
Mở một cửa sổ Terminal mới khác, di chuyển đến thư mục Frontend và cài đặt các thư viện cần thiết:

```powershell
cd "E:\2.FileGhiChu\3-ki2\LapTrinhDaNenTang\đồ án\nutrition-app\nutrition-app-frontend"
npm install
```

#### 3. Khởi chạy Expo Server
Khởi động dự án Expo bằng lệnh:

```powershell
npx expo start
```
Hoặc:
```powershell
npm start
```

#### 4. Xem ứng dụng trên thiết bị
Sau khi chạy lệnh khởi động, một mã **QR Code** lớn sẽ hiện ra trên Terminal của bạn:

* **Đối với thiết bị thật (Android):** Tải ứng dụng **Expo Go** từ Google Play Store, mở ứng dụng và quét mã QR này.
* **Đối với thiết bị thật (iOS):** Mở ứng dụng **Camera mặc định** của iPhone và quét mã QR để mở qua ứng dụng **Expo Go** (đã được cài từ App Store).
* **Đối với máy ảo (Simulator):**
  * Nhấn phím `a` trên bàn phím Terminal để khởi chạy trên giả lập Android.
  * Nhấn phím `i` trên bàn phím Terminal để khởi chạy trên giả lập iOS (Yêu cầu macOS).
* **Nếu muốn reset cache của Expo** khi gặp lỗi cache:
  ```powershell
  npx expo start -c
  ```