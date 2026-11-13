import { HttpClient, type HttpClientConfig } from "@/http";
import { AuthService } from "./auth";
import { BootstrapService } from "./bootstrap";
import { UserService } from "./user";

export const defaultSdkConfig = {
  headers: {
    Accept: "application/json",
  },
  credentials: "include",
  maxAttempts: 3,
  timeout: 10_000,
  protected: true,
} as const;

export class BonfireSdk {
  public readonly httpClient: HttpClient;
  public readonly auth: AuthService;
  public readonly bootstrap: BootstrapService;
  public readonly user: UserService;

  constructor(config: HttpClientConfig) {
    const resolvedConfig = resolveSdkConfig(config);
    this.httpClient = new HttpClient(resolvedConfig);
    this.auth = new AuthService(this.httpClient);
    this.bootstrap = new BootstrapService(this.httpClient);
    this.user = new UserService(this.httpClient);
  }
}

export const resolveSdkConfig = (
  config: HttpClientConfig,
): HttpClientConfig => {
  return {
    ...defaultSdkConfig,
    ...config,
    baseUrl: config.baseUrl?.replace(/\/+$/, ""),
    headers: {
      ...defaultSdkConfig.headers,
      ...config.headers,
    },
  };
};
