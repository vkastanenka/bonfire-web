import type { HttpAuthManager } from "../http/middleware";
import { authService } from "./service";
import { useTokenStore } from "./tokens";

// TODO: DI the store
class AuthManager implements HttpAuthManager {
  private activeRefreshPromise: Promise<string | null> | null = null;

  public getAccessToken(): string | null {
    return useTokenStore.getState().accessToken;
  }

  public setAccessToken(token: string): void {
    useTokenStore.getState().setAccessToken(token);
  }

  public clearTokens(): void {
    useTokenStore.getState().clearTokens();
  }

  public async restore(): Promise<string | null> {
    const activeToken = this.getAccessToken();
    if (activeToken) return activeToken;

    try {
      return await this.refreshAccessToken();
    } catch {
      console.warn("[AuthManager] Automatic restore session failed.");
      this.clearTokens();
      return null;
    }
  }

  public async refreshAccessToken(): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const data = await authService.refresh();
        this.setAccessToken(data.access_token);
        return data.access_token;
      } catch {
        this.clearTokens();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }
}

export const authManager = new AuthManager();
