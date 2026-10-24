import {
  AipError,
  AppError,
  isAipErrorData,
  STATUS_CODES,
  RETRYABLE_STATUS_CODES,
} from "@/errs";
import { z } from "@/validation";
import {
  API_ERROR_CODES,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
} from "./errors";
import type { RequestOptions, RequestContext } from "./request";
import { REQUEST_LOGS } from "./logger";

export interface BeforeRequestParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
}

export interface ResponseSuccessParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
  response: Response;
}

export interface ResponseErrorParams<T extends z.ZodTypeAny = z.ZodTypeAny> {
  options: RequestOptions<T>;
  context: RequestContext;
  response: Response;
  retry: () => Promise<unknown>;
}

export interface RequestMiddleware {
  beforeRequest?<T extends z.ZodTypeAny>(
    params: BeforeRequestParams<T>,
  ): Promise<void> | void;

  onResponseSuccess?<T extends z.ZodTypeAny>(
    params: ResponseSuccessParams<T>,
  ): Promise<void> | void;

  onResponseError?<T extends z.ZodTypeAny>(
    params: ResponseErrorParams<T>,
  ): Promise<unknown> | void;
}

export class LoggingMiddleware implements RequestMiddleware {
  beforeRequest<T extends z.ZodTypeAny>({
    options,
    context,
  }: BeforeRequestParams<T>) {
    context.logger.debug(REQUEST_LOGS.INITIATED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      attemptCount: context.attemptCount,
    });
  }

  onResponseSuccess<T extends z.ZodTypeAny>({
    options,
    context,
    response,
  }: ResponseSuccessParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);

    context.logger.debug(REQUEST_LOGS.SUCCEEDED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      status: response.status,
      durationMs,
      attemptCount: context.attemptCount,
    });
  }

  onResponseError<T extends z.ZodTypeAny>({
    options,
    context,
    response,
  }: ResponseErrorParams<T>) {
    const durationMs = Math.round(performance.now() - context.startTime);
    const isFinalAttempt = context.attemptCount >= context.maxAttempts;

    const logMethod = isFinalAttempt
      ? context.logger.error
      : context.logger.debug;

    logMethod.call(context.logger, REQUEST_LOGS.FAILED, {
      requestId: context.requestId,
      method: options.method,
      urlPath: options.urlPath,
      status: response.status,
      durationMs,
      attemptCount: context.attemptCount,
    });
  }
}

export interface AuthService {
  refresh(): Promise<string | null>;
}

export interface AuthStore {
  getState: () => {
    accessToken: string | null;
  };
}

export class AuthMiddleware implements RequestMiddleware {
  private readonly authService: AuthService;
  private readonly tokenStore: AuthStore;

  constructor(authService: AuthService, tokenStore: AuthStore) {
    this.authService = authService;
    this.tokenStore = tokenStore;
  }

  async beforeRequest<T extends z.ZodTypeAny>({
    options,
    context,
  }: BeforeRequestParams<T>): Promise<void> {
    if (!options.protected) return;

    const token = this.tokenStore.getState().accessToken;
    if (token) {
      context.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  async onResponseError<T extends z.ZodTypeAny>({
    response,
    options,
    context,
    retry,
  }: ResponseErrorParams<T>): Promise<unknown> {
    if (
      response.status !== STATUS_CODES.UNAUTHORIZED ||
      !options.protected ||
      context.isAuthRetry
    ) {
      return;
    }

    try {
      const errorBody = await response
        .clone()
        .json()
        .catch(() => null);

      if (!isAipErrorData(errorBody)) return;

      const aipError = new AipError(errorBody);
      const reason = aipError.getErrorInfo()?.reason;

      if (reason !== API_ERROR_CODES.TOKEN_EXPIRED) {
        return;
      }

      context.logger.debug(REQUEST_LOGS.AUTH_TOKEN_EXPIRED, {
        requestId: context.requestId,
        method: options.method,
        urlPath: options.urlPath,
        attemptCount: context.attemptCount,
      });

      context.isAuthRetry = true;

      const newToken = await this.authService.refresh();

      if (!newToken) {
        throw new AppError({
          code: REQUEST_ERROR_CODES.TOKEN_REFRESH_FAILED,
          message:
            REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.TOKEN_REFRESH_FAILED],
        });
      }

      context.logger.debug(REQUEST_LOGS.AUTH_REFRESH_SUCCEEDED, {
        requestId: context.requestId,
        method: options.method,
        urlPath: options.urlPath,
        attemptCount: context.attemptCount,
      });

      context.headers.set("Authorization", `Bearer ${newToken}`);

      return await retry();
    } catch (error) {
      context.logger.error(REQUEST_LOGS.AUTH_SESSION_CLEARED, {
        requestId: context.requestId,
        method: options.method,
        urlPath: options.urlPath,
        attemptCount: context.attemptCount,
        error,
      });

      throw error;
    }
  }
}

export class RetryMiddleware implements RequestMiddleware {
  async onResponseError<T extends z.ZodTypeAny>({
    options,
    context,
    response,
    retry,
  }: ResponseErrorParams<T>): Promise<unknown> {
    if (options.retry === false) return;
    if (!RETRYABLE_STATUS_CODES.has(response.status)) return;

    if (context.attemptCount <= context.maxAttempts) {
      const backoff = Math.pow(2, context.attemptCount - 1) * 100;
      const jitter = Math.random() * 50;

      context.logger.debug(REQUEST_LOGS.RETRYING, {
        requestId: context.requestId,
        status: response.status,
        method: options.method,
        urlPath: options.urlPath,
        attemptCount: context.attemptCount,
        maxAttempts: context.maxAttempts,
        delayMs: Math.round(backoff + jitter),
      });

      await new Promise((res) => setTimeout(res, backoff + jitter));

      return await retry();
    }
  }
}
