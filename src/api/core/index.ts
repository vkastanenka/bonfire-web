import { createApiClient } from "./utils";
import { AuthService } from "./services";

const API_BASE_URL = "http://localhost:8080/api/v1";

const coreClient = createApiClient({
  serviceName: "DiscordGateway",
  baseURL: API_BASE_URL,
});

export const authService = new AuthService(coreClient, {
  name: "AuthService",
  basePath: "/auth",
});

export * from "./errors";
export * from "./schema";
