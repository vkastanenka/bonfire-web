import {
  HttpError,
  type BeforeRequestFn,
  type HttpRequestContext,
  type HttpRequestOptions,
  type ResponseErrorFn,
  type ResponseSuccessFn,
} from "@/http";
import { AipError } from "../errors";
import { resolveLogger, type LogContext, type LogOptions } from "../shared";

const messages = {
  initiated: "HTTP request initiated.",
  succeeded: "HTTP request succeeded.",
  failed: "HTTP request failed.",
  retrying: "Retrying HTTP request.",
  rejected: "Rejected HTTP request.",
} as const;

export const createLogInterceptors = (options: LogOptions) => {
  const log = resolveLogger(options, {
    component: "bonfire-sdk.logInterceptors",
  });

  const beforeRequest: BeforeRequestFn = ({ options, context }) => {
    log?.debug(messages.initiated, createBaseContext(options, context));
  };

  const onResponseSuccess: ResponseSuccessFn = ({
    options,
    context,
    result,
  }) => {
    log?.debug(messages.succeeded, {
      ...createBaseContext(options, context),
      result,
    });
  };

  const onResponseError: ResponseErrorFn = ({ options, context, error }) => {
    if (!log) return;

    const maxAttempts = options.retry?.maxAttempts ?? 1;
    const isFinalAttempt = context.attemptCount >= maxAttempts;
    const ctx: LogContext = {
      ...createBaseContext(options, context),
      ...extractErrorContext(error),
    };

    if (!isFinalAttempt) {
      log.debug(`${messages.failed} ${messages.retrying}`, ctx);
      return;
    }

    const status = typeof ctx.status === "number" ? ctx.status : undefined;
    if (status !== undefined && status >= 400 && status < 500) {
      log.warn(messages.rejected, ctx);
      return;
    }

    log.error(messages.failed, ctx);
  };

  return {
    beforeRequest,
    onResponseSuccess,
    onResponseError,
  };
};

const createBaseContext = (
  options: HttpRequestOptions,
  context: HttpRequestContext,
): LogContext => {
  const durationMs = Math.max(
    0,
    Math.round(performance.now() - context.startTime),
  );

  return {
    requestId: context.requestId,
    method: options.method ?? "GET",
    url: options.url,
    attemptCount: context.attemptCount,
    ...(durationMs !== undefined ? { durationMs } : {}),
  };
};

const extractErrorContext = (error: unknown): LogContext => {
  if (error instanceof AipError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      reason: error.getErrorInfoReason(),
    };
  }

  if (error instanceof HttpError) {
    return {
      name: error.name,
      message: error.message,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
};
