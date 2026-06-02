/**
 * Development utilities for debugging and testing
 * Only use in development mode
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Clear all onboarding data from storage
 * Usage: Open browser console or RN debugger and call:
 *   require('./src/utils/devTools').clearOnboardingStorage()
 */
export async function clearOnboardingStorage() {
  try {
    if (Platform.OS === 'web') {
      // Web: clear localStorage
      localStorage.removeItem('dnt-onboarding-store');
      console.log('✅ Cleared onboarding storage (web)');
    } else {
      // Mobile: clear SecureStore
      await SecureStore.deleteItemAsync('dnt-onboarding-store');
      console.log('✅ Cleared onboarding storage (mobile)');
    }
    console.log('ℹ️ Reload app to see changes');
  } catch (error) {
    console.error('❌ Failed to clear onboarding storage:', error);
  }
}

/**
 * View current onboarding storage data
 */
export async function viewOnboardingStorage() {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem('dnt-onboarding-store');
      console.log('📦 Onboarding storage (web):', JSON.parse(data || '{}'));
    } else {
      const data = await SecureStore.getItemAsync('dnt-onboarding-store');
      console.log('📦 Onboarding storage (mobile):', JSON.parse(data || '{}'));
    }
  } catch (error) {
    console.error('❌ Failed to view onboarding storage:', error);
  }
}

// Make functions available globally in dev mode
if (__DEV__) {
  (global as any).clearOnboardingStorage = clearOnboardingStorage;
  (global as any).viewOnboardingStorage = viewOnboardingStorage;
  console.log('🔧 Dev tools loaded. Available functions:');
  console.log('  - clearOnboardingStorage()');
  console.log('  - viewOnboardingStorage()');
}
