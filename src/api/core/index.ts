import { resolveConfig } from "./config";
import { AuthService } from "./services";
import { newClient } from "./utils";

const config = resolveConfig();

const client = newClient("BonfireService", config);

export const authService = new AuthService(client, {
  name: "AuthService",
  basePath: "/auth",
});

export * from "./errors";
export * from "./schema";
