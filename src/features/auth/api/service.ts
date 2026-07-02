import { type AxiosRequestConfig } from "axios";
import { BaseApiService, createApiClient } from "@/lib"; // Verify if this should be "@/services/api" like Geocoding
import {
  registerResponseSchema,
  type RegisterInputs,
} from "../register/register.validation";
import { z } from "zod";

// 1. Define configuration
const AUTH_CONFIG = {
  name: "AuthService",
  baseUrl: "http://localhost:8080/api/v1/auth",
  endpoints: { register: "/register", login: "/login" },
} as const;

// 2. Export configuration type
export type AuthApiConfig = typeof AUTH_CONFIG;

// 3. Define the Service Class matching GeocodingService syntax
class AuthService extends BaseApiService<AuthApiConfig> {
  public register = (
    data: RegisterInputs,
    config?: AxiosRequestConfig,
  ): Promise<z.infer<typeof registerResponseSchema>> => {
    return this.instance.validatedPost(
      this.config.endpoints.register,
      data,
      registerResponseSchema, // Note: Ensure this is your Response schema, not Input schema!
      config,
    );
  };
}

const config = AUTH_CONFIG;

// 4. Instantiate API client cleanly
const client = createApiClient(
  { baseURL: config.baseUrl },
  { serviceName: config.name },
);

// 5. Export singleton service instance
export const authService = new AuthService(client, config);
