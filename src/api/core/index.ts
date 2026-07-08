import { createConfig } from "./config";
import { BonfireHttpClient } from "./client";
import { AuthService } from "./services";

const coreConfig = createConfig({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || undefined,
});

const coreClient = new BonfireHttpClient("BonfireService", coreConfig);

export const authService = new AuthService(coreClient, "/auth");

export * from "./errors";
export * from "./schema";
