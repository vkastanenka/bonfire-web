import { Client, type RequestOptions } from "@/http";
import { bonfireClient, BaseClient } from "../client";
import { type BootstrapResponse, bootstrapResponseSchema } from "./validation";

export class BootstrapClient extends BaseClient {
  protected readonly routePrefix = "/bootstrap";

  constructor(client: Client = bonfireClient) {
    super(client);
  }

  public bootstrap = (options?: RequestOptions): Promise<BootstrapResponse> => {
    return this.client.get<typeof bootstrapResponseSchema>({
      ...options,
      urlPath: this.url(),
      schema: bootstrapResponseSchema,
    });
  };
}

export const bootstrapClient = new BootstrapClient();
