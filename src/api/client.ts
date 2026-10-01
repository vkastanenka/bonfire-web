import * as http from "@/http";
import { logger } from "@/lib/logger";
import { authService } from "@/bonfire";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "X-Requested-With": "XMLHttpRequest",
};

const DEFAULT_BONFIRE_CONFIG: http.ClientConfig = {
  logger,
  baseUrl: process.env.BONFIRE_API_URL || "http://localhost:8080/api/v1",
  domain: "bonfire-client",
  headers: DEFAULT_HEADERS,
  credentials: "include",
  maxAttempts: Number(process.env.BONFIRE_API_MAX_ATTEMPTS) || 3,
  timeout: Number(process.env.BONFIRE_API_TIMEOUT) || 10000,
  protected: true,
};

export const baseBonfireClient = new http.Client({
  ...DEFAULT_BONFIRE_CONFIG,
  protected: false,
  middleware: [new http.LoggingMiddleware(), new http.RetryMiddleware()],
});

export const bonfireClient = new http.Client({
  ...DEFAULT_BONFIRE_CONFIG,
  protected: true,
  middleware: [
    new http.LoggingMiddleware(),
    new http.AuthMiddleware(authService),
    new http.RetryMiddleware(),
  ],
});
