// api/session/manager.ts
import { authService } from "../http/services";
import { bonfireTokenProvider } from "../tokens";
import type { RefreshResponse } from "../http/schema";

class SessionManager {
  private bootstrapPromise: Promise<RefreshResponse | null> | null = null;
  private refreshPromise: Promise<RefreshResponse | null> | null = null;

  public async getAccessToken(): Promise<string | null> {
    return bonfireTokenProvider.getAccessToken();
  }

  public async handleSessionExpired(): Promise<void> {
    await bonfireTokenProvider.clearSession();
  }

  public async bootstrapSession(): Promise<string | null> {
    const activeToken = await bonfireTokenProvider.getAccessToken();
    if (activeToken) return activeToken;

    if (this.bootstrapPromise) {
      const result = await this.bootstrapPromise;
      return result?.access_token ?? null;
    }

    this.bootstrapPromise = (async () => {
      try {
        const data = await authService.refresh({ skipRetry: true });
        await bonfireTokenProvider.setAccessToken(data.access_token);
        return data;
      } catch {
        console.warn(
          "[SessionManager] Auto-session restoration skipped or invalid token cookie.",
        );
        await bonfireTokenProvider.clearSession();
        return null;
      }
    })();

    try {
      const result = await this.bootstrapPromise;
      return result?.access_token ?? null;
    } catch {
      return null;
    } finally {
      this.bootstrapPromise = null;
    }
  }

  public async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      const result = await this.refreshPromise;
      return result?.access_token ?? null;
    }

    this.refreshPromise = (async () => {
      try {
        const data = await authService.refresh({ skipRetry: true });
        await bonfireTokenProvider.setAccessToken(data.access_token);
        return data;
      } catch (error) {
        this.handleSessionExpired();
        throw error;
      }
    })();

    try {
      const result = await this.refreshPromise;
      return result?.access_token ?? null;
    } finally {
      this.refreshPromise = null;
    }
  }
}

export const sessionManager = new SessionManager();
