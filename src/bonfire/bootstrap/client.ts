import { Client, type ClientRequestOptions } from "@/http";
import { bonfireClient } from "../client";
import { type BootstrapResponse, bootstrapResponseSchema } from "./validation";

export class BootstrapClient {
  protected readonly client: Client;

  constructor(client: Client = bonfireClient) {
    this.client = client;
  }

  public bootstrap = (
    options?: ClientRequestOptions,
  ): Promise<BootstrapResponse> => {
    return this.client.get<typeof bootstrapResponseSchema>({
      ...options,
      urlPath: "/users/@me",
      schema: bootstrapResponseSchema,
    });
  };
}

export const bootstrapClient = new BootstrapClient();
