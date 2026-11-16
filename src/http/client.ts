import { httpRequest, resolveBaseOptions } from "./request";
import type {
  BeforeRequestFn,
  HttpClientConfig,
  HttpRequestOptions,
  ResolvedHttpClientConfig,
  ResponseErrorFn,
  ResponseSuccessFn,
} from "./types";
import { buildHeaders, joinUrl, parseUrl } from "./utils";

export class HttpClient {
  public readonly config: ResolvedHttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = resolveClientConfig(config);
  }

  public async get(options: Omit<HttpRequestOptions, "method">) {
    return this.request({ ...options, method: "GET" });
  }

  public async post(options: Omit<HttpRequestOptions, "method">) {
    return this.request({ ...options, method: "POST" });
  }

  public async put(options: Omit<HttpRequestOptions, "method">) {
    return this.request({ ...options, method: "PUT" });
  }

  public async patch(options: Omit<HttpRequestOptions, "method">) {
    return this.request({ ...options, method: "PATCH" });
  }

  public async delete(options: Omit<HttpRequestOptions, "method">) {
    return this.request({ ...options, method: "DELETE" });
  }

  public async request(options: HttpRequestOptions) {
    return httpRequest({
      ...this.config,
      ...options,
      url: joinUrl(this.config.baseUrl, options.url),
      headers: buildHeaders(this.config.headers, options.headers, options.data),
      retry: {
        ...this.config.retry,
        ...options.retry,
      },
      beforeRequest: [
        ...this.config.beforeRequest,
        ...(options.beforeRequest ?? []),
      ],
      onResponseSuccess: [
        ...this.config.onResponseSuccess,
        ...(options.onResponseSuccess ?? []),
      ],
      onResponseError: [
        ...this.config.onResponseError,
        ...(options.onResponseError ?? []),
      ],
    });
  }

  public addBeforeRequest(hooks: BeforeRequestFn | BeforeRequestFn[]): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.beforeRequest.push(...list);
  }

  public addResponseSuccess(
    hooks: ResponseSuccessFn | ResponseSuccessFn[],
  ): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.onResponseSuccess.push(...list);
  }

  public addResponseError(hooks: ResponseErrorFn | ResponseErrorFn[]): void {
    const list = Array.isArray(hooks) ? hooks : [hooks];
    this.config.onResponseError.push(...list);
  }
}

const resolveClientConfig = (
  config: HttpClientConfig,
): ResolvedHttpClientConfig => {
  const parsedBaseUrl = parseUrl(config.baseUrl);
  return {
    ...resolveBaseOptions(config),
    baseUrl: parsedBaseUrl.origin + parsedBaseUrl.pathname.replace(/\/+$/, ""),
  };
};
