import { type ClientRequestOptions } from "@/http";
import { authClient } from "./client";
import { useAuthStore } from "./store";
import type {
  ForgotPasswordRequest,
  ListValidSessionsResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./validation";
import type { Me } from "../user";
import { Presence } from "../gateway/presence";

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
      return preferred === Presence.invisible ? Presence.offline : preferred;
    }

    return preferred ?? null;
  }

  public async register(req: RegisterRequest, options?: ClientRequestOptions) {
    const data = await authClient.register(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public async login(req: LoginRequest, options?: ClientRequestOptions) {
    const data = await authClient.login(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public async logout(options?: ClientRequestOptions) {
    await authClient.logout(options);
    useAuthStore.getState().clearSession();
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

  public async verify(req: VerifyEmailRequest, options?: ClientRequestOptions) {
    const data = await authClient.verify(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async resendVerify(options?: ClientRequestOptions) {
    await authClient.resendVerify(options);
  }

  public async forgotPassword(
    req: ForgotPasswordRequest,
    options?: ClientRequestOptions,
  ) {
    await authClient.forgotPassword(req, options);
  }

  public async resetPassword(
    req: ResetPasswordRequest,
    options?: ClientRequestOptions,
  ) {
    const data = await authClient.resetPassword(req, options);
    useAuthStore.getState().setAccessToken(data.accessToken);
  }

  public async listValidSessions(
    options?: ClientRequestOptions,
  ): Promise<ListValidSessionsResponse> {
    return authClient.listValidSessions(options);
  }

  public async revokeAllSessions(options?: ClientRequestOptions) {
    await authClient.revokeAllSessions(options);
    useAuthStore.getState().clearSession();
  }

  public async revokeSession(
    id: string,
    isCurrent: boolean,
    options?: ClientRequestOptions,
  ) {
    await authClient.revokeSession(id, options);
    if (isCurrent) {
      useAuthStore.getState().clearSession();
    }
  }
}

export const authService = new AuthService();
