import { type HttpClientRequestOptions } from "@/http";
import { BaseService } from "../shared";
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
    options?: HttpClientRequestOptions<Me>,
  ): Promise<Me> {
    return this.httpClient.patch<Me>({
      ...options,
      urlPath: endpoints.email,
      data,
      schema: meSchema,
    });
  }

  public updateUsername(
    data: UpdateUsernameRequest,
    options?: HttpClientRequestOptions<Me>,
  ): Promise<Me> {
    return this.httpClient.patch<Me>({
      ...options,
      urlPath: endpoints.username,
      data,
      schema: meSchema,
    });
  }

  public updatePreferredPresence(
    data: UpdatePreferredPresenceRequest,
    options?: HttpClientRequestOptions<Me>,
  ): Promise<Me> {
    return this.httpClient.patch<Me>({
      ...options,
      urlPath: endpoints.presence,
      data,
      schema: meSchema,
    });
  }

  public updateProfile(
    data: UpdateProfileRequest,
    options?: HttpClientRequestOptions<Me>,
  ): Promise<Me> {
    return this.httpClient.patch<Me>({
      ...options,
      urlPath: endpoints.profile,
      data,
      schema: meSchema,
    });
  }

  public updatePassword(
    data: UpdatePasswordRequest,
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    return this.httpClient.post<void>({
      ...options,
      urlPath: endpoints.password,
      data,
    });
  }

  public disable(
    data: DisableRequest,
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    return this.httpClient.post<void>({
      ...options,
      urlPath: endpoints.disable,
      data,
    });
  }

  public scheduleDelete(
    data: DisableRequest,
    options?: HttpClientRequestOptions<void>,
  ): Promise<void> {
    return this.httpClient.delete<void>({
      ...options,
      urlPath: endpoints.me,
      data,
    });
  }
}
