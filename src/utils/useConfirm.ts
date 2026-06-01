import { Alert, Platform } from 'react-native';

export const confirmDelete = (
  itemName: string,
  onConfirm: () => void
) => {
  if (Platform.OS === 'web') {
    // Logic dành riêng cho Web
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${itemName} này không? Thao tác này không thể hoàn tác.`)) {
      onConfirm();
    }
  } else {
    // Logic dành riêng cho iOS / Android
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa ${itemName} này không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: onConfirm 
        }
      ]
    );
  }
};