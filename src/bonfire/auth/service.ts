import { publicAuthClient, type PublicAuthClient } from "./client";
import { useAuthStore, type AuthStore } from "./store";

export class AuthService {
  private readonly publicClient: PublicAuthClient;
  private readonly store: AuthStore;
  private activeRefreshPromise: Promise<string | null> | null = null;

  constructor(
    publicClient: PublicAuthClient = publicAuthClient,
    store: AuthStore = useAuthStore,
  ) {
    this.publicClient = publicClient;
    this.store = store;
  }

  public async restore(): Promise<string | null> {
    const activeToken = this.store.getState().accessToken;
    if (activeToken) return activeToken;

    return this.refreshAccessToken();
  }

  public async refreshAccessToken(): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const data = await this.publicClient.refresh();
        this.store.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        this.store.getState().clearSession();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }
}

export const authService = new AuthService();
