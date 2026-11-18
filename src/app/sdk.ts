import { BonfireSdk } from "@/bonfire-sdk";
import { useAuthStore } from "@/features";
import { logger } from "@/logger";

export const bonfireSdk = new BonfireSdk({
  baseUrl: import.meta.env.VITE_BONFIRE_API_BASE_URL,
  credentials: "include",
  logger,
  logging: import.meta.env.MODE !== "production",
  getToken: () => useAuthStore.getState().accessToken,
  onTokenRefreshed: (newToken) => {
    useAuthStore.getState().setAccessToken(newToken);
  },
  onRefreshFailed: () => {
    useAuthStore.getState().clearSession();
  },
});
