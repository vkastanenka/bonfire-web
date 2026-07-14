import { getAccessToken, setAccessToken, clearAuth } from "./store";

export class BonfireTokenProvider {
  getAccessToken(): string | null {
    return getAccessToken();
  }

  setAccessToken(token: string): void {
    setAccessToken(token);
  }

  clearSession(): void {
    clearAuth();
  }
}

export const tokenProvider = new BonfireTokenProvider();
