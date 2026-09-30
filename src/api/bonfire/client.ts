import { HttpClient, LoggingMiddleware, RetryMiddleware } from "../lib";
import { authManager } from "../auth";
import { AuthMiddleware } from "./middleware";

export const bonfireClient = new HttpClient({
  baseURL: process.env.BONFIRE_API_URL || "http://localhost:8080/api/v1",
  credentials:
    (process.env.BONFIRE_API_CREDENTIALS as RequestCredentials) || "include",
  maxAttempts: Number(process.env.BONFIRE_API_MAX_ATTEMPTS) || 5,
  timeout: Number(process.env.BONFIRE_API_TIMEOUT) || 10000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  middleware: [
    new LoggingMiddleware(),
    new AuthMiddleware(authManager),
    new RetryMiddleware(3),
  ],
});
