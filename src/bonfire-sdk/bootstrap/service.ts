import { BaseService, type ServiceCallOptions } from "../shared";
import { bootstrapResponseSchema, type BootstrapResponse } from "./validation";

const endpoints = {
  me: "/users/@me",
} as const;

export class BootstrapService extends BaseService {
  public bootstrap(options?: ServiceCallOptions): Promise<BootstrapResponse> {
    return this.get({
      ...options,
      url: endpoints.me,
      schema: bootstrapResponseSchema,
    });
  }
}
