import { BaseService, type ServiceCallOptions } from "../shared";
import { meSchema, type Me } from "../validation";
import {
  type DisableRequest,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";

const endpoints = {
  me: "/users/@me",
  email: "/users/@me/email",
  username: "/users/@me/username",
  presence: "/users/@me/presence",
  profile: "/users/@me/profile",
  password: "/users/@me/password",
  disable: "/users/@me/disable",
} as const;

export class UserService extends BaseService {
  public updateEmail(
    data: UpdateEmailRequest,
    options?: ServiceCallOptions,
  ): Promise<Me> {
    return this.patch({
      ...options,
      url: endpoints.email,
      data,
      schema: meSchema,
    });
  }

  public updateUsername(
    data: UpdateUsernameRequest,
    options?: ServiceCallOptions,
  ): Promise<Me> {
    return this.patch({
      ...options,
      url: endpoints.username,
      data,
      schema: meSchema,
    });
  }

  public updatePreferredPresence(
    data: UpdatePreferredPresenceRequest,
    options?: ServiceCallOptions,
  ): Promise<Me> {
    return this.patch({
      ...options,
      url: endpoints.presence,
      data,
      schema: meSchema,
    });
  }

  public updateProfile(
    data: UpdateProfileRequest,
    options?: ServiceCallOptions,
  ): Promise<Me> {
    return this.patch({
      ...options,
      url: endpoints.profile,
      data,
      schema: meSchema,
    });
  }

  public updatePassword(
    data: UpdatePasswordRequest,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.password,
      data,
    });
  }

  public disable(
    data: DisableRequest,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.disable,
      data,
    });
  }

  public scheduleDelete(
    data: DisableRequest,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.delete({
      ...options,
      url: endpoints.me,
      data,
    });
  }
}
