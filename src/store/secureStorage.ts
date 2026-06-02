import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { StateStorage } from "zustand/middleware";

const CHUNK_SIZE = 1000;
const CHUNK_PREFIX = "___chunked___:";

// ---------------------------------------------------------------------------
// Web fallback: use browser localStorage (synchronous ops wrapped in Promises)
// ---------------------------------------------------------------------------
const webStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading from localStorage for key ${name}:`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing to localStorage for key ${name}:`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error deleting from localStorage for key ${name}:`, error);
    }
  },
};

// ---------------------------------------------------------------------------
// Mobile: use expo-secure-store with chunking (SecureStore has a 2 KB limit)
// ---------------------------------------------------------------------------
const nativeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const val = await SecureStore.getItemAsync(name);
      if (val && val.startsWith(CHUNK_PREFIX)) {
        const numChunks = parseInt(val.substring(CHUNK_PREFIX.length), 10);
        if (isNaN(numChunks)) {
          return val;
        }
        let combined = "";
        for (let i = 0; i < numChunks; i++) {
          const chunk = await SecureStore.getItemAsync(`${name}_chunk_${i}`);
          if (chunk) {
            combined += chunk;
          }
        }
        return combined;
      }
      return val;
    } catch (error) {
      console.error(`Error reading from SecureStore for key ${name}:`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (value.length <= CHUNK_SIZE) {
        // Clean up any previous chunks if they existed
        const oldVal = await SecureStore.getItemAsync(name);
        if (oldVal && oldVal.startsWith(CHUNK_PREFIX)) {
          const numChunks = parseInt(oldVal.substring(CHUNK_PREFIX.length), 10);
          if (!isNaN(numChunks)) {
            for (let i = 0; i < numChunks; i++) {
              await SecureStore.deleteItemAsync(`${name}_chunk_${i}`);
            }
          }
        }
        await SecureStore.setItemAsync(name, value);
      } else {
        const chunks: string[] = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) {
          chunks.push(value.substring(i, i + CHUNK_SIZE));
        }

        // Clean up extra old chunks if new value has fewer chunks
        const oldVal = await SecureStore.getItemAsync(name);
        let oldChunksCount = 0;
        if (oldVal && oldVal.startsWith(CHUNK_PREFIX)) {
          const parsed = parseInt(oldVal.substring(CHUNK_PREFIX.length), 10);
          if (!isNaN(parsed)) {
            oldChunksCount = parsed;
          }
        }

        // Write new chunks
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${name}_chunk_${i}`, chunks[i]);
        }

        // Clean up remaining old chunks
        if (oldChunksCount > chunks.length) {
          for (let i = chunks.length; i < oldChunksCount; i++) {
            await SecureStore.deleteItemAsync(`${name}_chunk_${i}`);
          }
        }

        // Write chunk manifest
        await SecureStore.setItemAsync(name, `${CHUNK_PREFIX}${chunks.length}`);
      }
    } catch (error) {
      console.error(`Error writing to SecureStore for key ${name}:`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const val = await SecureStore.getItemAsync(name);
      if (val && val.startsWith(CHUNK_PREFIX)) {
        const numChunks = parseInt(val.substring(CHUNK_PREFIX.length), 10);
        if (!isNaN(numChunks)) {
          for (let i = 0; i < numChunks; i++) {
            await SecureStore.deleteItemAsync(`${name}_chunk_${i}`);
          }
        }
      }
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error(`Error deleting from SecureStore for key ${name}:`, error);
    }
  },
};

// ---------------------------------------------------------------------------
// Export: pick the right storage based on the current platform
// ---------------------------------------------------------------------------
export const secureStorage: StateStorage =
  Platform.OS === "web" ? webStorage : nativeStorage;
