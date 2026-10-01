import * as api from "@/api";
import { useTokenStore, type TokenStore } from "./store";

export class AuthService {
  private readonly api: api.PublicAuthService;
  private readonly store: TokenStore;
  private activeRefreshPromise: Promise<string | null> | null = null;

  constructor(
    apiService: api.PublicAuthService = api.publicAuthService,
    store: TokenStore = useTokenStore,
  ) {
    this.api = apiService;
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
        const data = await this.api.refresh();
        this.store.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        this.store.getState().clearTokens();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }
}

export const authService = new AuthService();
