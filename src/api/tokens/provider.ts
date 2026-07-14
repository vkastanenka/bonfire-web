import { getAccessToken, setAccessToken, clearAuth } from "./store";

export class BonfireTokenProvider {
  async getAccessToken(): Promise<string | null> {
    return getAccessToken();
  }

  async setAccessToken(token: string): Promise<void> {
    setAccessToken(token);
  }

  async clearSession(): Promise<void> {
    clearAuth();
  }
}

export const tokenProvider = new BonfireTokenProvider();
