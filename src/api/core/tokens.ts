import { getAccessToken, setAccessToken, clearAuth } from "./store";
import { httpConfig } from "./config";

export class BonfireTokenProvider {
  private readonly baseURL: string;

  constructor(baseURL: string = httpConfig.baseURL) {
    this.baseURL = baseURL.replace(/\/$/, "");
  }

  async getAccessToken(): Promise<string | null> {
    return getAccessToken();
  }

  async refreshAccessToken(): Promise<string | null> {
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

      const data = await response.json();

      if (data && typeof data.accessToken === "string") {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }

      return null;
    } catch (error) {
      console.error(
        "[TokenProvider] Critical network error during token rotation:",
        error,
      );
      return null;
    }
  }

  async onSessionExpired(): Promise<void> {
    clearAuth();
  }
}

export const tokenProvider = new BonfireTokenProvider();
