import { Client, type ClientConfig } from "@/http";
import { handleAuthError, setAuthHeader } from "./middleware";

export const defaultConfig: ClientConfig = {
  baseUrl: "http://localhost:8080/api/v1",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  credentials: "include",
  maxAttempts: Number(process.env.BONFIRE_API_MAX_ATTEMPTS) || 3,
  timeout: Number(process.env.BONFIRE_API_TIMEOUT) || 10000,
  protected: true,
};

export const bonfireClient = new Client({
  ...defaultConfig,
  beforeRequest: [setAuthHeader],
  onResponseError: [handleAuthError],
});
