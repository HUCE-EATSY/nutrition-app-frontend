# Clear Onboarding Storage

## Vấn đề hiện tại
Dữ liệu onboarding cũ đang được cache trong storage, dẫn đến currentWeightKg = 62 (giá trị cũ) thay vì giá trị mới (58).

## Giải pháp

### Option 1: Clear storage từ app
Mở browser console hoặc React Native Debugger và chạy:

```javascript
// For web (browser console)
localStorage.removeItem('dnt-onboarding-store')
```

Hoặc thêm button tạm thời trong app:

```typescript
import { useOnboardingStore } from '@/store/onboardingStore';

// In component
const clearStore = () => {
  useOnboardingStore.getState().reset();
  // Also clear persisted storage
  if (Platform.OS === 'web') {
    localStorage.removeItem('dnt-onboarding-store');
  }
};

<Button onPress={clearStore}>Clear Onboarding Data</Button>
```

### Option 2: Hard refresh
- **Web**: Ctrl + Shift + R (hoặc Cmd + Shift + R trên Mac)
- **Mobile**: Xóa app data hoặc reinstall app

### Option 3: Add reset button in dev
Tạo một dev tool để clear storage khi cần thiết.

## Logs cần kiểm tra
Khi test lại, check console logs:

1. `[CurrentWeight] Component mounted:` - xem currentWeightFromStore là gì
2. `[useOnboardingForm] CurrentWeight - Submitting:` - xem giá trị đang submit (should be 58)
3. `[useOnboardingForm] CurrentWeight - Updated store:` - xem giá trị sau khi update store
4. `[TargetWeight] Debug info:` - xem currentWeightKg đọc được từ store (should be 58, not 62)

Nếu bước 4 vẫn show 62, nghĩa là:
- Persist middleware chưa kịp write
- Hoặc có race condition trong Zustand rehydration
- Hoặc component đang đọc từ stale closure

## Next Steps
Nếu vẫn không work sau khi clear storage, sẽ cần refactor để:
1. Đợi persist middleware complete bằng cách lắng nghe onRehydrateStorage event
2. Hoặc pass data qua navigation params thay vì rely on global store
