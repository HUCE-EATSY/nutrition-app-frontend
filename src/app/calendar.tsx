import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, radius } from '@/constants';

import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from "@/constants/i18n";
import { useDiaryStore } from '@/store/diaryStore';

// Cấu hình Locale tiếng Việt cho Lịch
LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'],
  dayNames: ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};

LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  today: 'Today'
};

LocaleConfig.defaultLocale = 'vi';

export default function CalendarPickerModal() {
  const t = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const theme = useSettingsStore((state) => state.theme);
  const selectedDate = useDiaryStore((state) => state.selectedDate);
  const setDate = useDiaryStore((state) => state.setDate);
  
  React.useEffect(() => {
    LocaleConfig.defaultLocale = language;
  }, [language]);

  const insets = useSafeAreaInsets();
  
  // Lấy ngày hiện tại format YYYY-MM-DD
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  const [selected, setSelected] = useState(selectedDate || todayString);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleDayPress = (day: { dateString: string }) => {
    setSelected(day.dateString);
    setDate(day.dateString);
    
    // Tạo cảm giác mượt mà, delay 300ms rồi đóng để user thấy hiệu ứng màu
    setTimeout(() => {
      handleClose();
    }, 300);
  };

  // Format header title: "Hôm nay, 29 Tháng 04" / "Today, April 29"
  const formattedHeader = React.useMemo(() => {
    const today = new Date();
    if (language === 'en') {
      const monthNamesEng = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `Today, ${monthNamesEng[today.getMonth()]} ${today.getDate()}`;
    }
    return `${t.common.today}, ${today.getDate()} ${t.stats.periods.month} ${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  }, [language, t]);

  const Container = Platform.OS === 'ios' ? BlurView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { intensity: 40, tint: theme === "light" ? "light" : "dark", style: styles.container } as any
    : { style: [styles.container, { backgroundColor: theme === "light" ? "rgba(244, 245, 247, 0.95)" : "rgba(18, 16, 25, 0.95)" }] } as any;

  return (
    <Container {...containerProps}>
      {/* Box Lịch nửa trên */}
      <View style={[styles.topSheet, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        
        {/* Header Modal */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{formattedHeader}</Text>
          <Pressable onPress={handleClose} hitSlop={15} style={styles.headerIcon}>
            <Ionicons name="calendar" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>
 
        {/* Lịch */}
        <Calendar
          key={`${language}-${theme}`}
          current={selected}
          onDayPress={handleDayPress}
          theme={{
            backgroundColor: "transparent",
            calendarBackground: "transparent",
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.textPrimary,
            todayTextColor: colors.primary,
            dayTextColor: colors.textPrimary,
            textDisabledColor: theme === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.1)",
            dotColor: colors.primary,
            selectedDotColor: colors.textPrimary,
            arrowColor: colors.textPrimary,
            disabledArrowColor: colors.textMuted,
            monthTextColor: colors.textPrimary,
            indicatorColor: colors.primary,
            textDayFontFamily: typography.body.fontFamily,
            textMonthFontFamily: typography.h3.fontFamily,
            textDayHeaderFontFamily: typography.caption.fontFamily,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
            "stylesheet.calendar.header": {
              header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 10,
                paddingRight: 10,
                marginTop: 6,
                alignItems: 'center',
                marginBottom: 10,
              },
            },
            "stylesheet.day.basic": {
              base: {
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 18,
              },
              selected: {
                backgroundColor: colors.primary,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: "rgba(161, 124, 243, 0.4)",
              }
            }
          } as any}
          markedDates={{
            [selected]: { selected: true, disableTouchEvent: true },
          }}
          firstDay={1} // Bắt đầu tuần từ Thứ 2 (T2)
          hideExtraDays={true} // Ẩn các ngày của tháng trước/sau
        />
      </View>

      {/* Vùng mờ bên dưới để bấm ra ngoài đóng */}
      <Pressable style={styles.backdrop} onPress={handleClose} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  topSheet: {
    backgroundColor: colors.bgBase,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});
