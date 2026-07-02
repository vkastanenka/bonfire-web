import { BaseApiService, createApiClient } from "@/lib";
import {
  registerSchema,
  type RegisterInputs,
} from "../register/register.validation";

const authConfig = {
  name: "AuthService",
  baseUrl: "/api/v1/auth",
  endpoints: { register: "/register", login: "/login" },
};

class AuthService extends BaseApiService<typeof authConfig> {
  async register(data: RegisterInputs) {
    return this.instance.validatedPost(
      this.config.endpoints.register,
      data,
      registerSchema,
    );
  }
}

export const authService = new AuthService(
  createApiClient(
    { baseURL: authConfig.baseUrl },
    { serviceName: authConfig.name },
  ),
  authConfig,
);
