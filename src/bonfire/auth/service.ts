import { type ClientRequestOptions } from "../http";
import { type Presence, presences } from "@/presence";
import { authClient } from "./client";
import { useAuthStore } from "./store";
import type {
  AccessTokenResponse,
  ForgotPasswordRequest,
  ListValidSessionsResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./validation";
import type { Me } from "../user";

export class AuthService {
  private activeRefreshPromise: Promise<string | null> | null = null;

  public getMe(): Me | null {
    return useAuthStore.getState().me;
  }

  public getEffectivePresence(): Presence | null {
    const me = this.getMe();
    const preferred = me?.preferredPresence;
    const preferredUntil = me?.preferredPresenceUntil;

    if (preferredUntil && new Date() > preferredUntil) {
      return null;
    }

    if (preferred) {
      return preferred === presences.invisible ? presences.offline : preferred;
    }

    return preferred ?? null;
  }

  public async register(
    req: RegisterRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ) {
    const data = await authClient.register(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public async login(
    req: LoginRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ) {
    const data = await authClient.login(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public logout(options?: ClientRequestOptions): Promise<unknown> {
    const requestPromise = authClient.logout(options);
    useAuthStore.getState().clearSession();
    return requestPromise;
  }

  public async refresh(): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const data = await authClient.refresh();
        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        useAuthStore.getState().clearSession();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }

  public async restore(): Promise<string | null> {
    const activeToken = useAuthStore.getState().accessToken;
    if (activeToken) return activeToken;

    return this.refresh();
  }

  public getAccessToken(): string | null {
    return useAuthStore.getState().accessToken;
  }

  public async verify(
    req: VerifyEmailRequest,
    options?: ClientRequestOptions<Me>,
  ) {
    const data = await authClient.verify(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async resendVerify(options?: ClientRequestOptions<unknown>) {
    await authClient.resendVerify(options);
  }

  public async forgotPassword(
    req: ForgotPasswordRequest,
    options?: ClientRequestOptions<unknown>,
  ) {
    await authClient.forgotPassword(req, options);
  }

  public async resetPassword(
    req: ResetPasswordRequest,
    options?: ClientRequestOptions<AccessTokenResponse>,
  ) {
    const data = await authClient.resetPassword(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public async listValidSessions(
    options?: ClientRequestOptions<ListValidSessionsResponse>,
  ): Promise<ListValidSessionsResponse> {
    return authClient.listValidSessions(options);
  }

  public revokeAllSessions(
    options?: ClientRequestOptions<unknown>,
  ): Promise<unknown> {
    const requestPromise = authClient.revokeAllSessions(options);
    useAuthStore.getState().clearSession();
    return requestPromise;
  }

  public async revokeSession(
    id: string,
    options?: ClientRequestOptions<unknown>,
  ) {
    await authClient.revokeSession(id, options);
  }
}

export const authService = new AuthService();
