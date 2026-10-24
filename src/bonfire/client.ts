import {
  Client,
  LoggingMiddleware,
  RetryMiddleware,
  AuthMiddleware,
  type ClientConfig,
} from "@/http";
import { logger } from "@/logger";
import { publicAuthClient, useAuthStore } from "./auth";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const DEFAULT_BONFIRE_CONFIG: ClientConfig = {
  baseUrl: process.env.BONFIRE_API_URL || "http://localhost:8080/api/v1",
  domain: "bonfire-client",
  headers: DEFAULT_HEADERS,
  credentials: "include",
  maxAttempts: Number(process.env.BONFIRE_API_MAX_ATTEMPTS) || 3,
  timeout: Number(process.env.BONFIRE_API_TIMEOUT) || 10000,
  protected: true,
  logger,
};

export const baseBonfireClient = new Client({
  ...DEFAULT_BONFIRE_CONFIG,
  protected: false,
  middleware: [new LoggingMiddleware(), new RetryMiddleware()],
});

export const bonfireClient = new Client({
  ...DEFAULT_BONFIRE_CONFIG,
  protected: true,
  middleware: [
    new LoggingMiddleware(),
    new AuthMiddleware({
      // Read token directly from the store primitive
      getToken: () => useAuthStore.getState().accessToken,

      // Perform low-level refresh directly via transport client
      refreshToken: async () => {
        try {
          const data = await publicAuthClient.refresh();
          useAuthStore.getState().setAccessToken(data.accessToken);
          return data.accessToken;
        } catch {
          useAuthStore.getState().clearSession();
          return null;
        }
      },
    }),
    new RetryMiddleware(),
  ],
});
