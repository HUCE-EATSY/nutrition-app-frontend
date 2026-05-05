import * as SecureStore from "expo-secure-store";
import { StateStorage } from "zustand/middleware";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isWeb) {
      return localStorage.getItem(name);
    }
    return (await SecureStore.getItemAsync(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isWeb) {
      localStorage.setItem(name, value);
      return;
    }
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (isWeb) {
      localStorage.removeItem(name);
      return;
    }
    await SecureStore.deleteItemAsync(name);
  },
};
