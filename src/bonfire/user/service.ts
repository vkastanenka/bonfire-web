import { type RequestOptions } from "@/http";
import { userClient } from "./client";
import {
  type DisableRequest,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";
import { useAuthStore } from "../auth";

export class UserService {
  public async updateEmail(req: UpdateEmailRequest, options?: RequestOptions) {
    const data = await userClient.updateEmail(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async updateUsername(
    req: UpdateUsernameRequest,
    options?: RequestOptions,
  ) {
    const data = await userClient.updateUsername(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async updatePreferredPresence(
    req: UpdatePreferredPresenceRequest,
    options?: RequestOptions,
  ) {
    const data = await userClient.updatePreferredPresence(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async updateProfile(
    req: UpdateProfileRequest,
    options?: RequestOptions,
  ) {
    const data = await userClient.updateProfile(req, options);
    useAuthStore.getState().setMe(data);
  }

  public async updatePassword(
    req: UpdatePasswordRequest,
    options?: RequestOptions,
  ) {
    await userClient.updatePassword(req, options);
  }

  public async disable(req: DisableRequest, options?: RequestOptions) {
    await userClient.disable(req, options);
    useAuthStore.getState().clearSession();
  }

  public async scheduleDelete(req: DisableRequest, options?: RequestOptions) {
    await userClient.scheduleDelete(req, options);
    useAuthStore.getState().clearSession();
  }
}

export const userService = new UserService();
