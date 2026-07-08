import type { IHttpClient } from "./client";
import {
  registerRequestSchema,
  registerResponseSchema,
  type RegisterRequest,
  type RegisterResponse,
} from "./schema";

export class AuthService {
  public readonly client: IHttpClient;
  constructor(client: IHttpClient) {
    this.client = client;
  }

  public async register(data: RegisterRequest): Promise<RegisterResponse> {
    const validatedInput = registerRequestSchema.parse(data);

    return this.client.request({
      url: "/auth/register",
      method: "POST",
      data: validatedInput,
      schema: registerResponseSchema,
    });
  }
}
