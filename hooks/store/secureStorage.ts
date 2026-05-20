import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { StateStorage } from "zustand/middleware";

const isWeb = Platform.OS === "web";

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isWeb) {
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isWeb) {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (isWeb) {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};
