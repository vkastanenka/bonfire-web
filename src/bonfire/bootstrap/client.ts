import { Client, type RequestOptions } from "@/http";
import { baseBonfireClient } from "../client";
import { type BootstrapResponse, bootstrapResponseSchema } from "./validation";

export class BootstrapClient {
  protected readonly client: Client;

  constructor(client: Client = baseBonfireClient) {
    this.client = client;
  }

  public bootstrap = (options?: RequestOptions): Promise<BootstrapResponse> => {
    return this.client.get<typeof bootstrapResponseSchema>({
      ...options,
      urlPath: "/users/@me",
      schema: bootstrapResponseSchema,
    });
  };
}

export const bootstrapClient = new BootstrapClient();
