import { type RequestOptions } from "@/http";
import {
  authClient,
  AuthClient,
  publicAuthClient,
  type PublicAuthClient,
} from "./client";
import { useAuthStore, type AuthStore } from "./store";
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
  private readonly pClient: PublicAuthClient;
  private readonly client: AuthClient;
  private readonly store: AuthStore;
  private activeRefreshPromise: Promise<string | null> | null = null;

  constructor(
    pClient: PublicAuthClient = publicAuthClient,
    client: AuthClient = authClient,
    store: AuthStore = useAuthStore,
  ) {
    this.pClient = pClient;
    this.client = client;
    this.store = store;
  }

  public getMe(): Me | null {
    return this.store.getState().me;
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

  public async register(req: RegisterRequest, options?: RequestOptions) {
    const data = await this.pClient.register(req, options);
    this.store.getState().setAccessToken(data.accessToken);
  }

  public async login(req: LoginRequest, options?: RequestOptions) {
    const data = await this.pClient.login(req, options);
    this.store.getState().setAccessToken(data.accessToken);
  }

  public async logout(options?: RequestOptions) {
    await this.client.logout(options);
    this.store.getState().clearSession();
  }

  public async refresh(): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const data = await this.pClient.refresh();
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

  public async restore(): Promise<string | null> {
    const activeToken = this.store.getState().accessToken;
    if (activeToken) return activeToken;

    return this.refresh();
  }

  public getAccessToken(): string | null {
    return this.store.getState().accessToken;
  }

  public async verify(req: VerifyEmailRequest, options?: RequestOptions) {
    const data = await this.pClient.verify(req, options);
    this.store.getState().setMe(data);
  }

  public async resendVerify(options?: RequestOptions) {
    await this.client.resendVerify(options);
  }

  public async forgotPassword(
    req: ForgotPasswordRequest,
    options?: RequestOptions,
  ) {
    await this.pClient.forgotPassword(req, options);
  }

  public async resetPassword(
    req: ResetPasswordRequest,
    options?: RequestOptions,
  ) {
    const data = await this.pClient.resetPassword(req, options);
    this.store.getState().setAccessToken(data.accessToken);
  }

  public async listValidSessions(
    options?: RequestOptions,
  ): Promise<ListValidSessionsResponse> {
    return this.client.listValidSessions(options);
  }

  public async revokeAllSessions(options?: RequestOptions) {
    await this.client.revokeAllSessions(options);
    this.store.getState().clearSession();
  }

  public async revokeSession(
    id: string,
    isCurrent: boolean,
    options?: RequestOptions,
  ) {
    await this.client.revokeSession(id, options);
    if (isCurrent) {
      this.store.getState().clearSession();
    }
  }
}

export const authService = new AuthService();
