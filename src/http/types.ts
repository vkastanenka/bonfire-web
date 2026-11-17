export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export type CustomFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface RetryConfig {
  maxAttempts?: number;
  statusCodes?: number[];
  methods?: HttpMethod[];
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface BaseHttpOptions {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  queryParams?: QueryParams;
  timeout?: number;
  fetch?: CustomFetch;
  retry?: RetryConfig;
  beforeRequest?: BeforeRequestFn[];
  onResponseSuccess?: ResponseSuccessFn[];
  onResponseError?: ResponseErrorFn[];
}

export interface HttpClientConfig extends BaseHttpOptions {
  baseUrl: string;
}

export interface HttpRequestOptions extends BaseHttpOptions {
  url: string;
  method?: HttpMethod;
  data?: unknown;
  signal?: AbortSignal;
}

export interface HttpRequestContext {
  readonly requestId: string;
  readonly startTime: number;
  attemptCount: number;
  meta: Record<string, unknown>;
}

export interface BeforeRequestArgs {
  options: ResolvedHttpRequestOptions;
  context: HttpRequestContext;
}

export interface ResponseSuccessArgs {
  options: ResolvedHttpRequestOptions;
  context: HttpRequestContext;
  result: unknown;
}

export interface ResponseErrorArgs {
  options: ResolvedHttpRequestOptions;
  context: HttpRequestContext;
  error: unknown;
  retry: () => Promise<unknown>;
}

export type BeforeRequestFn = (args: BeforeRequestArgs) => Promise<void> | void;
export type ResponseSuccessFn = (
  args: ResponseSuccessArgs,
) => Promise<void> | void;
export type ResponseErrorFn = (
  args: ResponseErrorArgs,
) => Promise<unknown | void> | unknown | void;

export type ResolvedRetryConfig = Readonly<
  Required<Omit<RetryConfig, "shouldRetry">> & Pick<RetryConfig, "shouldRetry">
>;

type ResolvedBaseFields = {
  headers: Headers;
  timeout: number;
  fetch: CustomFetch;
  retry: ResolvedRetryConfig;
  beforeRequest: BeforeRequestFn[];
  onResponseSuccess: ResponseSuccessFn[];
  onResponseError: ResponseErrorFn[];
};

export type ResolveOptions<T extends BaseHttpOptions> = Readonly<
  Omit<T, keyof ResolvedBaseFields> & ResolvedBaseFields
>;

export type ResolvedHttpClientConfig = ResolveOptions<HttpClientConfig>;
export type ResolvedHttpRequestOptions = ResolveOptions<HttpRequestOptions>;
