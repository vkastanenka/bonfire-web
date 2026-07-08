import { createConfig, type Config } from "./config";
import { HttpClient } from "./client";
import { AuthService } from "./services";

export class BonfireSdk {
  public readonly auth: AuthService;

  constructor(configOverrides?: Partial<Config>) {
    const config = createConfig(configOverrides);
    const client = new HttpClient(config);

    this.auth = new AuthService(client);
  }
}

export const bonfireSdk = new BonfireSdk();

export * from "./errors";
export * from "./schema";
