import { HttpClient, type HttpClientConfig } from "@/http";
import { AuthService } from "./auth";
import { BootstrapService } from "./bootstrap";
import { UserService } from "./user";
import {
  createAuthInterceptors,
  type AuthInterceptorOptions,
} from "./interceptors";

export interface SdkConfig
  extends
    HttpClientConfig,
    Partial<Omit<AuthInterceptorOptions, "refreshToken">> {}

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

  constructor(config: SdkConfig) {
    const httpClientConfig = resolveHttpClientConfig(config);
    this.httpClient = new HttpClient(httpClientConfig);
    this.auth = new AuthService(this.httpClient);
    this.bootstrap = new BootstrapService(this.httpClient);
    this.user = new UserService(this.httpClient);

    if (config.getToken) {
      const { setAuthHeader, handleAuthError } = createAuthInterceptors({
        getToken: config.getToken,
        onTokenRefreshed: config.onTokenRefreshed,
        onRefreshFailed: config.onRefreshFailed,
        refreshToken: () => this.auth.refresh(),
      });

      this.httpClient.addBeforeRequest(setAuthHeader);
      this.httpClient.addResponseError(handleAuthError);
    }
  }
}

export const resolveHttpClientConfig = (
  config: SdkConfig,
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
