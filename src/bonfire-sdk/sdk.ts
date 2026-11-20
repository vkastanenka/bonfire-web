import {
  HttpClient,
  type HttpClientConfig,
  type HttpRequestOptions,
} from "@/http";
import { AuthService } from "./auth";
import { BootstrapService } from "./bootstrap";
import { GatewayService } from "./gateway";
import { RelationService } from "./relation";
import { UserService } from "./user";
import {
  createAuthInterceptors,
  createLogInterceptors,
  type AuthInterceptorOptions,
} from "./interceptors";
import { type LogOptions } from "./shared";

export const defaultSdkConfig = {
  credentials: "include",
  retry: {
    maxAttempts: 3,
  },
} as const satisfies Partial<HttpRequestOptions>;

export interface SdkConfig
  extends
    HttpClientConfig,
    Partial<Omit<AuthInterceptorOptions, "refreshToken">>,
    LogOptions {}

export class BonfireSdk {
  private readonly httpClient: HttpClient;
  public readonly auth: AuthService;
  public readonly gateway: GatewayService;
  public readonly bootstrap: BootstrapService;
  public readonly relation: RelationService;
  public readonly user: UserService;

  constructor(config: SdkConfig) {
    const httpClientConfig = resolveHttpClientConfig(config);

    const logOptions: LogOptions = {
      logger: config.logger,
      logging: config.logging ?? true,
    };

    this.httpClient = new HttpClient(httpClientConfig);
    this.auth = new AuthService(this.httpClient);
    this.bootstrap = new BootstrapService(this.httpClient);
    this.gateway = new GatewayService(this.httpClient, logOptions);
    this.relation = new RelationService(this.httpClient);
    this.user = new UserService(this.httpClient);

    const logInterceptors = config.logger
      ? createLogInterceptors(logOptions)
      : undefined;

    if (config.getToken) {
      const { setAuthHeader, handleAuthError } = createAuthInterceptors({
        getToken: config.getToken,
        onTokenRefreshed: config.onTokenRefreshed,
        onRefreshFailed: config.onRefreshFailed,
        refreshToken: () => this.auth.refresh(),
        ...logOptions,
      });

      this.httpClient.addBeforeRequest(setAuthHeader);
      this.httpClient.addResponseError(handleAuthError);
    }

    if (logInterceptors) {
      this.httpClient.addBeforeRequest(logInterceptors.beforeRequest);
      this.httpClient.addResponseSuccess(logInterceptors.onResponseSuccess);
      this.httpClient.addResponseError(logInterceptors.onResponseError);
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
      ...config.headers,
    },
  };
};
