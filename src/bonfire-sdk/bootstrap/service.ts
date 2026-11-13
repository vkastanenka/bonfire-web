import { type HttpClientRequestOptions } from "@/http";
import { BaseService } from "../shared";
import { type BootstrapResponse, bootstrapResponseSchema } from "./validation";

const endpoints = {
  me: "/users/@me",
} as const;

export class BootstrapService extends BaseService {
  public bootstrap(
    options?: HttpClientRequestOptions<BootstrapResponse>,
  ): Promise<BootstrapResponse> {
    return this.httpClient.get<BootstrapResponse>({
      ...options,
      urlPath: endpoints.me,
      schema: bootstrapResponseSchema,
    });
  }
}
