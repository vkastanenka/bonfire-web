// api/session/manager.ts
import { getAccessToken, setAccessToken, clearTokens } from "../tokens";

export type RefreshFn = () => Promise<{ access_token: string }>;

class SessionManager {
  private activeRefreshPromise: Promise<string | null> | null = null;

  public async restore(refreshFn: RefreshFn): Promise<string | null> {
    const activeToken = getAccessToken();
    if (activeToken) return activeToken;

    try {
      return await this.refreshAccessToken(refreshFn);
    } catch {
      console.warn("[SessionManager] Automatic session bootstrap failed.");
      await clearTokens();
      return null;
    }
  }

  public async refreshAccessToken(
    refreshFn: RefreshFn,
  ): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const data = await refreshFn();
        setAccessToken(data.access_token);
        return data.access_token;
      } catch (error) {
        clearTokens();
        throw error;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }
}

export const sessionManager = new SessionManager();
