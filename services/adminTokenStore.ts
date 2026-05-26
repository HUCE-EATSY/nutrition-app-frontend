/**
 * In-memory storage for the Admin token.
 * This ensures that the admin session does not persist across page reloads.
 */

let memoryAdminToken: string | null = null;

export const adminTokenStore = {
  getToken: (): string | null => {
    return memoryAdminToken;
  },
  
  setToken: (token: string | null): void => {
    memoryAdminToken = token;
  },
  
  clearToken: (): void => {
    memoryAdminToken = null;
  }
};
