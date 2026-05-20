# API Integration Guide

## Overview
Frontend đã được tích hợp với Backend APIs sử dụng React Query hooks.

## API Hooks

### Food APIs (`hooks/api/useFoodApi.ts`)

#### 1. Search Foods
```typescript
import { useFoodSearch } from '@/hooks/api';

function MyComponent() {
  const { data, isLoading, error } = useFoodSearch({
    query: 'phở',
    categoryId: 1, // optional
    page: 1,
    pageSize: 20,
  });

  // data.foods: FoodDto[]
  // data.totalCount: number
  // data.totalPages: number
}
```

#### 2. Get Food by ID
```typescript
import { useFoodById } from '@/hooks/api';

function MyComponent() {
  const foodId = 'some-guid';
  const { data: food, isLoading } = useFoodById(foodId);

  // food: FoodDto
}
```

#### 3. Create Food
```typescript
import { useCreateFood } from '@/hooks/api';

function MyComponent() {
  const createFood = useCreateFood();

  const handleCreate = async () => {
    try {
      const newFood = await createFood.mutateAsync({
        nameVi: 'Phở bò',
        categoryId: 1,
        servingSizeG: 100,
        caloriesKcal: 150,
        proteinG: 10,
        carbsG: 20,
        fatG: 5,
      });
      console.log('Created:', newFood);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <Button onPress={handleCreate} disabled={createFood.isPending}>
      {createFood.isPending ? 'Creating...' : 'Create Food'}
    </Button>
  );
}
```

### Diary APIs (`hooks/api/useDiaryApi.ts`)

#### 1. Get Daily Summary
```typescript
import { useDailySummary } from '@/hooks/api';

function MyComponent() {
  const date = '2026-05-13'; // YYYY-MM-DD format
  const { data: summary, isLoading } = useDailySummary(date);

  // summary.totalCalories: number
  // summary.totalProtein: number
  // summary.logs: FoodLogDto[]
}
```

#### 2. Create Food Log
```typescript
import { useCreateFoodLog } from '@/hooks/api';

function MyComponent() {
  const createLog = useCreateFoodLog();

  const handleAddLog = async () => {
    try {
      const log = await createLog.mutateAsync({
        foodItemId: 'food-guid',
        mealTypeId: 1, // 1=Breakfast, 2=Lunch, 3=Dinner, 4=Snacks
        logDate: '2026-05-13',
        quantityG: 150,
        note: 'Ngon!',
      });
      console.log('Log created:', log);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <Button onPress={handleAddLog} disabled={createLog.isPending}>
      Add to Diary
    </Button>
  );
}
```

#### 3. Update Food Log
```typescript
import { useUpdateFoodLog } from '@/hooks/api';

function MyComponent() {
  const updateLog = useUpdateFoodLog();

  const handleUpdate = async (logId: number) => {
    try {
      await updateLog.mutateAsync({
        logId,
        dto: {
          quantityG: 200,
          note: 'Updated note',
        },
      });
    } catch (error) {
      console.error('Failed:', error);
    }
  };
}
```

#### 4. Delete Food Log
```typescript
import { useDeleteFoodLog } from '@/hooks/api';

function MyComponent() {
  const deleteLog = useDeleteFoodLog();

  const handleDelete = async (logId: number, date: string) => {
    try {
      await deleteLog.mutateAsync({ logId, date });
    } catch (error) {
      console.error('Failed:', error);
    }
  };
}
```

## API URLs Configuration

File: `constants/api.ts`

```typescript
export const API_URLS = {
  auth: {
    google: '/api/Auth/google',
    refresh: '/api/Auth/refresh',
    logout: '/api/Auth/logout',
  },
  diary: {
    daily: '/api/Diary/daily',
    logs: '/api/Diary/logs',
  },
  food: {
    base: '/api/Food',
    search: '/api/Food/search',
  },
  user: {
    onboarding: '/api/User/onboarding',
    profile: '/api/User/profile',
    goal: '/api/User/goal',
    info: '/api/User/info',
  }
};
```

## Data Types

### FoodDto
```typescript
interface FoodDto {
  id: string;
  nameVi: string;
  nameEn?: string;
  categoryId: number;
  categoryNameVi: string;
  servingSizeG: number;
  servingUnitVi: string;
  thumbnailUrl?: string;
  barcode?: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}
```

### FoodLogDto
```typescript
interface FoodLogDto {
  id: number;
  foodItemId: string;
  foodNameVi: string;
  mealTypeId: number;
  mealTypeNameVi: string;
  logDate: string; // YYYY-MM-DD
  quantityG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  note?: string;
  createdAt: string;
}
```

### DailySummaryDto
```typescript
interface DailySummaryDto {
  date: string; // YYYY-MM-DD
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalLogs: number;
  logs: FoodLogDto[];
}
```

## Meal Type IDs
- `1` - Breakfast (Sáng)
- `2` - Lunch (Trưa)
- `3` - Dinner (Tối)
- `4` - Snacks (Phụ)

## Authentication
All API calls automatically include the JWT token from `authStore` in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Error Handling
```typescript
const { data, error, isLoading } = useFoodSearch({ query: 'phở' });

if (error) {
  // Handle error
  console.error('API Error:', error);
}
```

## Cache & Refetching
React Query automatically:
- Caches responses
- Refetches on window focus
- Invalidates cache after mutations
- Provides loading/error states

Stale times:
- Food search: 5 minutes
- Food by ID: 10 minutes
- Daily summary: 1 minute

## Example Component

See `components/diary/FoodSearchModal.tsx` for a complete example of using the Food Search API.

## Migration from Old Code

### Before (Old API calls):
```typescript
const res = await fetch(`${API_BASE}/api/v1/Food?search=${query}`);
const json = await res.json();
setFoods(json.data);
```

### After (New React Query hooks):
```typescript
const { data } = useFoodSearch({ query });
// data.foods is automatically available
```

## Benefits
✅ Automatic caching
✅ Loading & error states
✅ Automatic refetching
✅ Type safety
✅ Optimistic updates
✅ Request deduplication
