# Thống kê Dinh dưỡng theo Tuần — Tài liệu kỹ thuật

> **Ngày hoàn thành:** 31/05/2026  
> **Phạm vi:** Tính năng tab "Tuần" trong màn hình Thống kê Dinh dưỡng (`nutrition.tsx`)

---

## 1. Bối cảnh & Mục tiêu

Màn hình `stats/nutrition.tsx` trước đây chỉ có tab **Ngày** hoạt động. Tab **Tuần** hiển thị dòng chữ "Đang phát triển". Mục tiêu là kế thừa các component từ màn hình Thống kê Bước chân (`steps.tsx`) để hoàn thiện tab này.

**Thiết kế chốt:**
- Biểu đồ cột (BarChart) 7 ngày — mỗi ngày T2→CN là 1 cột
- Thanh kẻ ngang = Calo mục tiêu (tái sử dụng prop `averageValue` của BarChart)
- **Không bôi màu** cột xanh/đỏ như bước chân — chỉ hiển thị cột vượt qua hay chưa vượt thanh mục tiêu
- Điều hướng lùi/tiến tuần (< Tuần >)
- Card tổng kết: Trung bình calo & macro tính theo 7 ngày (chia cho 7, kể cả ngày không log)

---

## 2. Các thay đổi Backend

### 2.1 `Services/FoodLog/IFoodLogService.cs`

Thêm 1 method mới vào interface:

```csharp
Task<List<DailySummaryResponse>> GetTimelineSummaryAsync(Guid userId, DateOnly from, DateOnly to);
```

### 2.2 `Services/FoodLog/FoodLogService.cs`

Triển khai `GetTimelineSummaryAsync`:

**Logic chính:**
1. **Query 1** — Lấy toàn bộ `FoodLog` của user trong khoảng `[startDt, endDt]` (DateTime range)
2. **Query 2** — Lấy `UserGoal` có `IsActive = true` (dùng chung cho tất cả ngày)
3. **Vòng lặp fill** `for (var d = from; d <= to; d = d.AddDays(1))` — đảm bảo trả về đủ **tất cả ngày trong khoảng**, kể cả ngày không có log (macro = 0)
4. **Tái sử dụng DTO** — `DailySummaryResponse` + `DailyTargetDto` (không tạo class mới)

**Thiết kế 2 query, không N+1:**
```
Query 1: lấy toàn bộ logs trong [from, to]
Query 2: lấy active goal
Ngày 1..7: lọc từ danh sách logs đã có trong bộ nhớ (không query thêm)
```

### 2.3 `Controllers/LogsController.cs`

Thêm endpoint mới, đồng bộ hoàn toàn với `GetStepsTimeline`:

```http
GET /api/logs/food/timeline?from={DateOnly}&to={DateOnly}
Authorization: Bearer {token}

Response: ApiResponse<List<DailySummaryResponse>>
```

**Lý do tạo mới thay vì sửa `/food/summary`:**  
API `summary` trả về 1 Object, dùng cho tab Ngày. Sửa thành List sẽ phá vỡ chức năng đang hoạt động.

---

## 3. Các thay đổi Frontend

### 3.1 `services/nutritionLogService.ts`

Thêm hàm gọi API mới:

```typescript
export async function getNutritionTimeline(from: string, to: string): Promise<DailySummaryResponse[]> {
  const res = await apiClient.get("/api/logs/food/timeline", { params: { from, to } });
  return res.data.data;
}
```

### 3.2 `store/statsStore.ts` — `NutritionState`

Thêm các field và action vào store:

| Field/Action | Kiểu | Mô tả |
|---|---|---|
| `weekOffset` | `number` | Độ lệch tuần (0 = tuần hiện tại, -1 = tuần trước...) |
| `weeklyTimeline` | `DailySummaryResponse[]` | Mảng 7 ngày trả về từ API |
| `isLoadingWeek` | `boolean` | Trạng thái loading riêng cho tab Tuần |
| `setWeekOffset(offset)` | action | Cập nhật offset tuần |
| `fetchWeeklyTimeline(offset?)` | action | Tính `from`/`to` rồi gọi API |

**Logic tính `from`/`to` trong `fetchWeeklyTimeline`:**
```typescript
// Đồng bộ với getPeriodRange(StepsPeriod.WEEK) trong steps.tsx
const day = now.getDay();
const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
monday.setDate(monday.getDate() + offset * 7);  // áp dụng offset
const sunday = new Date(monday);
sunday.setDate(sunday.getDate() + 6);
```

### 3.3 `hooks/stats/useNutritionStats.ts`

Thêm logic và computed values:

**Trigger fetch:**
```typescript
useEffect(() => {
  if (period === NutritionPeriod.WEEK) {
    fetchWeeklyTimeline(weekOffset);
  }
}, [period, weekOffset]);
```

**Computed values được export:**

| Biến | Công thức |
|---|---|
| `barChartData` | `weeklyTimeline.map(item => { label: thứ, value: total_calories })` |
| `targetCalories` | `weeklyTimeline[0].target.target_calories` |
| `weeklyAvgCalories` | `sum(total_calories) / 7` |
| `weeklyAvgProtein` | `sum(total_protein_g) / 7` |
| `weeklyAvgCarbs` | `sum(total_carbs_g) / 7` |
| `weeklyAvgFat` | `sum(total_fat_g) / 7` |
| `canGoNext` | `weekOffset < 0` (disable nút ">" khi đang ở tuần hiện tại) |

> **Lưu ý quan trọng:** Tất cả trung bình đều chia cho **7** (tổng ngày trong tuần), không phải chỉ chia cho số ngày có dữ liệu. Ngày không log = 0 vẫn tính vào mẫu.

### 3.4 `app/stats/nutrition.tsx`

Thay thế toàn bộ khối `activeTabLabel === "Tuần"` bằng:

```
┌─────────────────────────────────────┐
│  <  26/05 - 01/06               >  │  ← Điều hướng tuần
├─────────────────────────────────────┤
│  [BarChart 7 cột — màu tím]        │
│  - - - - - - - ← Target line      │  ← averageValue = targetCalories
│  T2   T3   T4   T5   T6   T7   CN │
├─────────────────────────────────────┤
│ 📊 Tổng kết tuần                   │
│ ┌──────────────┐ ┌──────────────┐  │
│ │ TB Calo      │ │ Mục tiêu     │  │
│ │   1250       │ │   1738       │  │
│ │ kcal/ngày    │ │ kcal/ngày    │  │
│ └──────────────┘ └──────────────┘  │
│                                     │
│ Trung bình macro                    │
│ [Chất đạm] [Đường bột] [Chất béo] │
└─────────────────────────────────────┘
```

---

## 4. Decision Log

| # | Quyết định | Lựa chọn khác | Lý do chọn |
|---|---|---|---|
| 1 | Tạo API `/food/timeline` mới | Sửa `/food/summary` thành List | Tránh breaking change cho tab Ngày |
| 2 | Tái sử dụng `DailySummaryResponse` | Tạo DTO mới `WeeklyNutritionDto` | Không cần class mới, đủ dữ liệu |
| 3 | Backend fill đủ 7 ngày (ngày 0 = 0 calo) | Frontend xử lý ngày thiếu | Đơn giản hóa frontend, dữ liệu nhất quán |
| 4 | 2 query DB, không N+1 | Gọi `GetDailySummaryAsync` 7 lần | Tối ưu performance |
| 5 | Trung bình chia cho 7 | Chia cho số ngày có dữ liệu | Phản ánh đúng thực tế cả tuần |
| 6 | Không bôi màu cột | Bôi xanh/đỏ như Steps | Theo yêu cầu — chỉ cần thấy vượt target hay không |
| 7 | Thanh mục tiêu = `averageValue` prop | Thêm prop mới vào BarChart | Tái sử dụng component `BarChart` hiện có |

---

## 5. Danh sách file đã thay đổi

### Backend
```
nutrition-app-backend/
├── Services/FoodLog/
│   ├── IFoodLogService.cs       [MODIFIED] — thêm GetTimelineSummaryAsync
│   └── FoodLogService.cs        [MODIFIED] — implement GetTimelineSummaryAsync
└── Controllers/
    └── LogsController.cs        [MODIFIED] — thêm GET /food/timeline endpoint
```

### Frontend
```
nutrition-app-frontend/src/
├── services/
│   └── nutritionLogService.ts   [MODIFIED] — thêm getNutritionTimeline()
├── store/
│   └── statsStore.ts            [MODIFIED] — thêm weekly state vào NutritionState
├── hooks/stats/
│   └── useNutritionStats.ts     [MODIFIED] — thêm computed weekly + navigation
└── app/stats/
    └── nutrition.tsx            [MODIFIED] — UI tab Tuần hoàn chỉnh
```
