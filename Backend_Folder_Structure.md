
# Phân tích Cấu trúc Thư mục Backend (ASP.NET Core Web API)

Tài liệu này cung cấp một cái nhìn chi tiết và chuyên sâu về cấu trúc thư mục, kiến trúc và ý nghĩa của từng thành phần trong mã nguồn backend của dự án **DNT Nutrition App** (`nutrition-app-backend`).

---

## 🗺️ Sơ đồ Cấu trúc Thư mục Tổng quan
Dưới đây là cây thư mục rút gọn biểu diễn kiến trúc phân lớp của dự án:

```text
nutrition-app-backend/
├── Program.cs                   # Điểm khởi chạy của ứng dụng, cấu hình DI & Middleware
├── appsettings.json             # Cấu hình môi trường (Database connection, JWT, Cloudinary)
├── nutrition-app-backend.csproj  # File cấu hình project .NET & Quản lý NuGet Packages
│
├── Controllers/                 # Tầng Giao tiếp (Presentation Layer - HTTP Requests)
│   ├── AuthController.cs
│   ├── DiaryController.cs
│   ├── FoodsController.cs
│   └── ...
│
├── Services/                    # Tầng Nghiệp vụ (Business Logic Layer)
│   ├── Auth/ (IAuthService.cs, AuthService.cs)
│   ├── Food/ (IFoodService.cs, FoodService.cs)
│   ├── Streak/ (StreakCronJob.cs, StreakService.cs)
│   └── ...
│
├── Models/                      # Tầng Dữ liệu (Domain Entities - Biểu diễn MySQL Database)
│   ├── Users/ (User.cs, UserGoal.cs, UserStreak.cs, ...)
│   ├── Foods/ (FoodItem.cs, FoodCategory.cs, ...)
│   ├── Diaries/ (FoodLog.cs, WeightLog.cs, ...)
│   └── ...
│
├── DTOs/                        # Tầng Giao tiếp Dữ liệu (Data Transfer Objects)
│   ├── Auth/
│   ├── Users/
│   ├── Foods/
│   └── ApiResponse.cs           # Cấu trúc Response chuẩn hóa cho toàn bộ API
│
├── Data/                        # Tầng Truy cập Dữ liệu (Data Access Layer - EF Core)
│   ├── WaoDbContext.cs          # DbContext kết nối & định nghĩa quan hệ bảng
│   └── WaoDbContextFactory.cs   # Factory phục vụ cho các câu lệnh Migration
│
├── Migrations/                  # Lịch sử và cấu trúc Database Migrations
│   └── SQL/                     # Các file script SQL mẫu (Seed Data)
│
├── Mappings/                    # Cấu hình Ánh xạ Dữ liệu (Object Mapping)
│   ├── MappingProfile.cs        # AutoMapper Profile mapping giữa Models <-> DTOs
│   └── ImageUrlResolvers.cs     # Xử lý tạo link ảnh tuyệt đối
│
├── Exceptions/                  # Quản lý và xử lý lỗi tập trung
│   ├── BusinessException.cs     # Các Custom Exception cho Business Logic
│   └── GlobalExceptionHandler.cs# Middleware bắt lỗi toàn cục
│
├── Filters/                     # Các bộ lọc ASP.NET Core Action Filters
│   └── RequiresPremiumAttribute.cs # Filter kiểm tra trạng thái Premium của User
│
├── Extensions/                  # Các phương thức mở rộng (Extension Methods)
│   └── ClaimsPrincipalExtensions.cs # Trích xuất thông tin từ JWT nhanh chóng
│
├── Enums/                       # Định nghĩa các kiểu liệt kê toàn hệ thống
│   └── Gender.cs
│
└── Properties/                  # Cấu hình khởi chạy môi trường cục bộ
    └── launchSettings.json      # Định nghĩa cổng chạy HTTP/HTTPS, IIS, profile Debug
```

---

## 🔍 Chi tiết và Ý nghĩa các Thư mục

### 1. `Controllers/` (Tầng Giao tiếp - Presentation Layer)
*   **Ý nghĩa**: Là điểm đón nhận các yêu cầu HTTP (HTTP Requests) từ phía React Native Mobile App gửi lên. Mỗi Controller tương ứng với một cụm tài nguyên/nghiệp vụ.
*   **Vai trò**:
    *   Nhận dữ liệu đầu vào thông qua URI, Query String, hoặc Request Body (được gán vào các **DTOs**).
    *   Gọi các **Services** tương ứng để thực hiện xử lý nghiệp vụ cốt lõi.
    *   Đóng gói kết quả xử lý và trả về mã trạng thái HTTP thích hợp (200 OK, 201 Created, 400 Bad Request, v.v.) qua chuẩn chung `ApiResponse`.
*   **Các thành phần chính**:
    *   `AuthController.cs`: Tiếp nhận yêu cầu đăng ký, đăng nhập thông thường hoặc qua Google Sign-In, làm mới Access Token bằng Refresh Token.
    *   `UserController.cs`: Xử lý luồng Onboarding (thiết lập thông tin cá nhân lần đầu), cập nhật hồ sơ, mục tiêu (Goal Weight, Activity Level).
    *   `DiaryController.cs`: Quản lý nhật ký dinh dưỡng hàng ngày (thêm/sửa/xóa món ăn đã nạp, lịch sử cân nặng).
    *   `FoodsController.cs` & `MealTypesController.cs`: Tìm kiếm món ăn trong thư viện, tạo món ăn custom, tạo công thức món ăn (Recipe).
    *   `ExercisesController.cs`: Theo dõi và lưu trữ nhật ký tập luyện thể thao của người dùng.
    *   `StreaksController.cs` & `SubscriptionsController.cs`: Quản lý chuỗi ngày tích cực và gói tài khoản Premium nâng cao.

### 2. `Services/` (Tầng Logic Nghiệp vụ - Business Logic Layer)
*   **Ý nghĩa**: Nơi chứa đựng "trí tuệ" của toàn bộ hệ thống. Tất cả các tính toán, quy tắc nghiệp vụ (Business Rules), kiểm tra ràng buộc đều nằm ở đây.
*   **Đặc điểm kiến trúc**:
    *   Áp dụng nguyên lý **Dependency Inversion** (chữ D trong SOLID): Mỗi dịch vụ đều đi kèm một Interface (ví dụ: `IUserService.cs`) và một lớp triển khai cụ thể (`UserService.cs`).
    *   Giúp dễ dàng đăng ký trong Dependency Injection (DI) Container của .NET và hỗ trợ tốt cho việc viết Unit Test sau này.
*   **Các dịch vụ cốt lõi**:
    *   `AuthService` & `TokenService`: Xử lý tạo và xác thực mã JWT, liên kết với Google Firebase Auth / Google API Client để xác minh tài khoản mạng xã hội.
    *   `UserService` & `WeightLogService`: Tính toán các chỉ số sức khỏe của người dùng (BMI, BMR, TDEE, lượng Calo & Macro cần thiết hàng ngày).
    *   `StreakService` & `StreakCronJob`: Tích hợp **Hangfire** để định cấu hình Cron Job tự động chạy vào lúc **23:59** hàng ngày nhằm kiểm tra, cập nhật chuỗi Streak của người dùng (và áp dụng Streak Freeze nếu người dùng có sở hữu giao dịch bảo lưu).
    *   `StorageService`: Quản lý tải ảnh lên Cloudinary (lưu ảnh đại diện, ảnh món ăn).

### 3. `Models/` (Tầng Dữ liệu - Domain Entities)
*   **Ý nghĩa**: Định nghĩa cấu trúc các đối tượng thực tế sẽ tương tác với cơ sở dữ liệu MySQL.
*   **Phân nhóm**: Các thực thể được gom cụm chặt chẽ theo phân hệ (domain):
    *   `Users/`: Chứa `User` (Thông tin tài khoản chính), `UserProfile` (Chiều cao, cân nặng, giới tính, mục tiêu calo), `UserGoal` (Lịch sử thay đổi mục tiêu), `UserStreak`, `Subscription` (Thông tin thời hạn premium), `RefreshToken` (Token duy trì phiên đăng nhập).
    *   `Diaries/`: Chứa `FoodLog` (Nhật ký ăn uống) liên kết giữa User, FoodItem và MealType (Bữa sáng, trưa, tối, phụ) tại một ngày cụ thể. `WeightLog` ghi nhận lịch sử cân nặng.
    *   `Foods/`: Chứa `FoodItem` (Món ăn), `FoodCategory` (Phân loại), `FoodNutrition` (Hàm lượng chất dinh dưỡng chi tiết trên mỗi 100g như Carbs, Protein, Fat, Sodium, Fiber, ...), `FoodItemComponent` (Dùng cho công thức món ăn ghép từ nhiều nguyên liệu).
    *   `Exercises/`: `Exercise` (Danh mục bài tập như Chạy bộ, Gym) và `ExerciseLog` (Nhật ký tập của user, tính toán Calo tiêu thụ dựa trên MET và thời gian).
    *   `Notifications/`: Quản lý các loại thông báo nhắc nhở và cấu hình thông báo (`UserNotificationSetting`) của từng user.

### 4. `DTOs/` (Data Transfer Objects)
*   **Ý nghĩa**: Các lớp trung gian chuyên chở dữ liệu qua lại giữa Client (Mobile App) và Server qua môi trường mạng.
*   **Tại sao cần thiết?**:
    *   **Bảo mật**: Tránh để lộ cấu trúc bảng vật lý của Database ra bên ngoài.
    *   **Tối ưu băng thông**: Client chỉ nhận đúng những thông tin cần hiển thị, và chỉ gửi đi những thông tin thực sự cần xử lý.
    *   **Ràng buộc Dữ liệu (Validation)**: Sử dụng các Data Annotations (như `[Required]`, `[Range]`, `[EmailAddress]`) trực tiếp trên DTO để tự động kiểm tra tính hợp lệ của dữ liệu đầu vào.
*   **Thành phần đặc trưng**:
    *   Các class Request: `CreateFoodRequest`, `OnboardingRequest`, `GoogleLoginRequest`.
    *   Các class Response: `UserProfileResponse`, `DailySummaryResponse` (Tổng hợp calo nạp và tiêu thụ trong ngày).
    *   `ApiResponse.cs`: Chuẩn hóa định dạng JSON phản hồi từ Server (luôn bao gồm `Success`, `Message`, `Data`, `ErrorCode`), giúp phía React Native xử lý lỗi một cách thống nhất.

### 5. `Data/` (Tầng Truy cập Dữ liệu - EF Core)
*   **Ý nghĩa**: Nơi thiết lập cấu hình kết nối trực tiếp đến MySQL Database.
*   **Các thành phần**:
    *   `WaoDbContext.cs`: Trọng tâm của Entity Framework Core. Chứa các thuộc tính `DbSet<Entity>` tương ứng với các bảng. Nơi định nghĩa các ràng buộc quan hệ (Một-Nhiều, Nhiều-Nhiều), các khóa ngoại và thiết lập kiểu dữ liệu số thực (`decimal(18,2)`) cho các trường chỉ số dinh dưỡng để đảm bảo độ chính xác cao.
    *   `WaoDbContextFactory.cs`: Triển khai `IDesignTimeDbContextFactory`. Giúp công cụ của EF Core CLI có thể khởi tạo DbContext lúc thiết kế (Design Time) để thực hiện lệnh tạo/cập nhật Migration mà không cần chạy toàn bộ ứng dụng.

### 6. `Migrations/` (Lịch sử Cấu trúc Database)
*   **Ý nghĩa**: Quản lý lịch sử tiến hóa của Cơ sở dữ liệu theo phương pháp **Code-First**. Mỗi khi lập trình viên thay đổi code trong Models, một file Migration mới sẽ được sinh ra để cập nhật Database tương ứng.
*   **Đặc trưng dự án**:
    *   Có thư mục `SQL/` lưu các mã SQL thuần để chạy seed data cho các dữ liệu cố định hoặc phức tạp (như danh sách bài tập chuẩn MET, phân loại thực phẩm).

### 7. `Mappings/` (Ánh xạ Đối tượng)
*   **Ý nghĩa**: Chứa cấu hình ánh xạ tự động giữa Domain Models và DTOs.
*   **Công nghệ**: Sử dụng **AutoMapper**.
*   **Các thành phần**:
    *   `MappingProfile.cs`: Định nghĩa ánh xạ, ví dụ: `CreateMap<User, UserProfileResponse>()`.
    *   `ImageUrlResolvers.cs`: Một Custom Resolver đặc biệt để giải quyết đường dẫn ảnh: Nếu ảnh được lưu dưới dạng path tương đối trên server, Resolver này sẽ tự động ghép với Hostname để trả về một URL tuyệt đối đầy đủ cho App có thể hiển thị trực tiếp.

### 8. `Exceptions/` (Quản lý Lỗi Tập Trung)
*   **Ý nghĩa**: Đảm bảo ứng dụng không bao giờ bị sập (crash) và không trả về lỗi thô (stack trace) làm lộ thông tin hệ thống.
*   **Cơ chế hoạt động**:
    *   Hệ thống định nghĩa các lỗi nghiệp vụ riêng: `NotFoundException` (Khi không tìm thấy món ăn/người dùng), `ConflictException` (Khi email đã tồn tại), `ForbiddenException` (Khi user thường cố truy cập tính năng Premium).
    *   `GlobalExceptionHandler.cs`: Sử dụng tính năng mới của **.NET 8** (`IExceptionHandler`). Đây là một middleware trung gian bắt tất cả các Exception ném ra từ bất kỳ đâu (Controller, Service), chuyển đổi nó thành một `ApiResponse` lỗi gọn đẹp và trả về HTTP Status Code tương ứng (404, 400, 403, 500).

### 9. `Filters/` (Bộ lọc Tác vụ)
*   **Ý nghĩa**: Cho phép can thiệp vào vòng đời của một HTTP Request trước hoặc sau khi đi vào Action của Controller.
*   **Nổi bật**:
    *   `RequiresPremiumAttribute.cs`: Một Action Filter tùy chỉnh. Khi đặt trên bất kỳ API Endpoint nào (ví dụ: API phân tích chuyên sâu meal plan), nó sẽ kiểm tra xem tài khoản đang đăng nhập có quyền Premium hoạt động hay không. Nếu không, lập tức trả về `403 Forbidden` trước khi tốn tài nguyên chạy xử lý.

### 10. `Extensions/` (Các Phương thức Mở rộng)
*   **Ý nghĩa**: Tạo ra các hàm tiện ích viết ngắn gọn cho các thư viện sẵn có của .NET.
*   **Nổi bật**:
    *   `ClaimsPrincipalExtensions.cs`: Giúp lập trình viên trong Controller/Service chỉ cần viết `User.GetUserId()` hoặc `User.GetEmail()` để lấy ngay thông tin người dùng hiện tại từ token JWT thay vì phải phân tích chuỗi Claim thủ công.

---

## 🛠️ Các File Cấu hình Hệ thống ở Thư mục Gốc

*   **`Program.cs`**:
    *   Là "trái tim" cấu hình của dự án.
    *   Nơi đăng ký dịch vụ kết nối MySQL (`AddDbContextPool`), cấu hình xác thực JWT, cấu hình phân quyền, cấu hình AutoMapper, Hangfire, Swagger API.
    *   Nơi định nghĩa thứ tự chạy của các Middleware (Routing -> CORS -> Authentication -> Authorization -> Hangfire Dashboard -> Controllers).
*   **`appsettings.json`**:
    *   Lưu trữ các tham số cấu hình hệ thống:
        *   `ConnectionStrings`: Cấu hình truy cập MySQL database.
        *   `JwtSettings`: Khóa bí mật (Secret Key) ký mã JWT, thời gian sống của token.
        *   `CloudinarySettings`: Khóa tài khoản tải ảnh lên cloud.
        *   `Google`: Client ID phục vụ cho xác thực Google OAuth.
*   **`nutrition-app-backend.csproj`**:
    *   Khai báo Target Framework (`net8.0`).
    *   Quản lý danh sách các Nuget Package phụ thuộc của dự án (như Entity Framework Core, AutoMapper, Cloudinary, Hangfire, Pomelo MySQL, v.v.).
*   **`test-all-endpoints.ps1` & `test-food-api.ps1`**:
    *   Các script PowerShell viết sẵn để thực hiện kiểm thử tự động (Integration Testing) hàng loạt endpoints của API trực tiếp từ terminal, giúp lập trình viên kiểm tra độ ổn định sau mỗi lần cập nhật mã nguồn.

---

## 💡 Ưu điểm trong Kiến trúc của Dự án này

1.  **Tính Phân Lớp Rõ Ràng (Clean Separation of Concerns)**: Mỗi thư mục đảm nhận duy nhất một vai trò. Controller chỉ nhận request, Service lo logic, DB Context lo dữ liệu.
2.  **Khả năng Mở rộng Cao (Scalability)**: Các Models và DTOs được nhóm theo nghiệp vụ (Users, Foods, Exercises, Notifications), giúp dễ dàng thêm module mới (ví dụ: Chatbot AI Dinh dưỡng) mà không ảnh hưởng tới các phần cũ.
3.  **Khả năng Phục hồi & Tin cậy**: Tích hợp Hangfire giúp các cron job (như Streak checker) chạy nền ổn định, tự động retry khi lỗi và có Dashboard trực quan để giám sát.
4.  **Bảo mật và Trải nghiệm Người dùng mượt mà**: Việc dùng `GlobalExceptionHandler` kết hợp `ApiResponse` giúp Frontend luôn luôn nhận được dữ liệu có cấu trúc ổn định, dễ dàng hiển thị thông báo lỗi thân thiện cho người dùng cuối.
