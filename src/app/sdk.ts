import { BonfireSdk } from "@/bonfire-sdk";
import { useAuthStore } from "@/features";
import { logger } from "@/logger";

export const bonfireSdk = new BonfireSdk({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1",
  credentials: "include",
  logger,
  logging: import.meta.env.DEV,
  getToken: () => useAuthStore.getState().accessToken,
  onTokenRefreshed: (newToken) => {
    useAuthStore.getState().setAccessToken(newToken);
  },
  onRefreshFailed: () => {
    useAuthStore.getState().clearSession();
  },
});
