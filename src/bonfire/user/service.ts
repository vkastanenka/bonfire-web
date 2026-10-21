import { type RequestOptions } from "@/http";
import { useAuthStore, type AuthStore } from "../auth";
import { type UserClient, userClient } from "./client";
import {
  type DisableRequest,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";

export class UserService {
  private readonly client: UserClient;
  private readonly authStore: AuthStore;

  constructor(
    client: UserClient = userClient,
    authStore: AuthStore = useAuthStore,
  ) {
    this.client = client;
    this.authStore = authStore;
  }

  public async updateEmail(req: UpdateEmailRequest, options?: RequestOptions) {
    const data = await this.client.updateEmail(req, options);
    this.authStore.getState().setMe(data);
  }

  public async updateUsername(
    req: UpdateUsernameRequest,
    options?: RequestOptions,
  ) {
    const data = await this.client.updateUsername(req, options);
    this.authStore.getState().setMe(data);
  }

  public async updatePreferredPresence(
    req: UpdatePreferredPresenceRequest,
    options?: RequestOptions,
  ) {
    const data = await this.client.updatePreferredPresence(req, options);
    this.authStore.getState().setMe(data);
  }

  public async updateProfile(
    req: UpdateProfileRequest,
    options?: RequestOptions,
  ) {
    const data = await this.client.updateProfile(req, options);
    this.authStore.getState().setMe(data);
  }

  public async updatePassword(
    req: UpdatePasswordRequest,
    options?: RequestOptions,
  ) {
    return this.client.updatePassword(req, options);
  }

  public async disable(req: DisableRequest, options?: RequestOptions) {
    await this.client.disable(req, options);
    this.authStore.getState().clearSession();
  }

  public async scheduleDelete(req: DisableRequest, options?: RequestOptions) {
    await this.client.scheduleDelete(req, options);
    this.authStore.getState().clearSession();
  }
}

export const userService = new UserService();
