import { authService } from "./service";
import { getAccessToken, setAccessToken, clearTokens } from "./tokens";

class AuthManager {
  private activeRefreshPromise: Promise<string | null> | null = null;

  public async restoreSession(): Promise<string | null> {
    const activeToken = getAccessToken();
    if (activeToken) return activeToken;

    try {
      return await this.refreshAccessToken();
    } catch {
      console.warn("[AuthManager] Automatic session bootstrap failed.");
      clearTokens();
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
        setAccessToken(data.access_token);
        return data.access_token;
      } catch {
        clearTokens();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }
}

export const authManager = new AuthManager();
