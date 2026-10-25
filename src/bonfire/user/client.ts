import { Client, type ClientRequestOptions } from "@/http";
import { bonfireClient } from "../client";
import {
  meSchema,
  type DisableRequest,
  type Me,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";

export class UserClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  private patchMe = <TData>(
    path: string,
    data: TData,
    options?: ClientRequestOptions,
  ): Promise<Me> => {
    return this.client.patch<typeof meSchema>({
      ...options,
      urlPath: `/users/@me/${path}`,
      data,
      schema: meSchema,
    });
  };

  public updateEmail = (
    data: UpdateEmailRequest,
    options?: ClientRequestOptions,
  ): Promise<Me> => this.patchMe("/email", data, options);

  public updateUsername = (
    data: UpdateUsernameRequest,
    options?: ClientRequestOptions,
  ): Promise<Me> => this.patchMe("/username", data, options);

  public updatePreferredPresence = (
    data: UpdatePreferredPresenceRequest,
    options?: ClientRequestOptions,
  ): Promise<Me> => this.patchMe("/presence", data, options);

  public updateProfile = (
    data: UpdateProfileRequest,
    options?: ClientRequestOptions,
  ): Promise<Me> => this.patchMe("/profile", data, options);

  public updatePassword = (
    data: UpdatePasswordRequest,
    options?: ClientRequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/users/@me/password",
      data,
    });
  };

  public disable = (
    data: DisableRequest,
    options?: ClientRequestOptions,
  ): Promise<unknown> => {
    return this.client.post({
      ...options,
      urlPath: "/users/@me/disable",
      data,
    });
  };

  public scheduleDelete = (
    data: DisableRequest,
    options?: ClientRequestOptions,
  ): Promise<unknown> => {
    return this.client.delete({
      ...options,
      urlPath: "/users/@me",
      data,
    });
  };
}

export const userClient = new UserClient();
