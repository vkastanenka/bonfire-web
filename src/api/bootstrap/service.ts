import { Client, type RequestOptions } from "@/http";
import { bonfireClient } from "../client";
import { BaseService } from "../service";
import { type BootstrapResponse, bootstrapResponseSchema } from "./validation";

export class BootstrapService extends BaseService {
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

export const bootstrapService = new BootstrapService();
