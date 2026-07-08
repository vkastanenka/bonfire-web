import { createConfig } from "./config";
import { BonfireHttpClient, ScopedClient } from "./client";
import { AuthService } from "./services";

class BonfireSdk {
  public readonly auth: AuthService;

  constructor(envBaseUrl?: string) {
    const config = createConfig({ baseURL: envBaseUrl });
    const transport = new BonfireHttpClient("BonfireGateway", config);

    this.auth = new AuthService(
      new ScopedClient(transport, "/auth", "AuthService"),
    );
  }
}

export const bonfire = new BonfireSdk(
  (import.meta.env.VITE_API_BASE_URL as string) || undefined,
);

export * from "./errors";
export * from "./schema";
