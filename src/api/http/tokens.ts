import { getAccessToken, setAccessToken, clearAuth } from "./store";
import { httpConfig } from "./config";
import { refreshResponseSchema } from "../http/schema";

export class BonfireTokenProvider {
  private readonly baseURL: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string = httpConfig.baseURL) {
    this.baseURL = baseURL.replace(/\/$/, "");
  }

  async getAccessToken(): Promise<string | null> {
    return getAccessToken();
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          return null;
        }

        const rawData = await response.json();

        const parsed = refreshResponseSchema.safeParse(rawData);

        if (parsed.success) {
          const token = parsed.data.access_token;
          setAccessToken(token);
          return token;
        }

        console.error(
          "[TokenProvider] Refresh payload failed validation schema.",
        );
        return null;
      } catch (error) {
        console.error(
          "[TokenProvider] Critical network error during token rotation:",
          error,
        );
        return null;
      }
    })();

    return this.refreshPromise.finally(() => {
      this.refreshPromise = null;
    });
  }

  async onSessionExpired(): Promise<void> {
    clearAuth();
  }
}

export const tokenProvider = new BonfireTokenProvider();
