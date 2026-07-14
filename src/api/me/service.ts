import {
  httpClient,
  type HttpScopedClient,
  type HttpServiceRequestOptions,
} from "../http";
import { meSchema, type Me } from "./schema";

class MeService {
  private readonly client: HttpScopedClient;

  constructor(client: HttpScopedClient) {
    this.client = client;
  }

  public get = (options?: HttpServiceRequestOptions): Promise<Me> => {
    return this.client({
      method: "GET",
      url: "/@me",
      schema: meSchema,
      protected: true,
      ...options,
    });
  };
}

export const meService = new MeService(httpClient.scope("/users", "MeService"));
