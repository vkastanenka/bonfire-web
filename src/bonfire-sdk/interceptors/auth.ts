import { HttpError, type BeforeRequestFn, type ResponseErrorFn } from "@/http";
import type { AccessTokenResponse } from "../auth";
import { apiErrorCodes, AipError, isAipErrorResponse } from "../errors";
import { resolveLogger, type LogOptions } from "../shared";

const messages = {
  tokenExpired: "Access token expired. Attempting token refresh.",
  refreshFailed: "Failed to refresh authentication token.",
  refreshSucceeded: "Token refresh succeeded. Retrying request.",
};

export interface AuthInterceptorOptions {
  getToken?: () => string | Promise<string | null> | null;
  onTokenRefreshed?: (newToken: string) => void;
  onRefreshFailed?: () => void;
  refreshToken?: () => Promise<AccessTokenResponse>;
}

export const setAuthHeader = (
  getToken?: AuthInterceptorOptions["getToken"],
): BeforeRequestFn => {
  return async ({ options, context }) => {
    if (context.meta.protected === false || !getToken) return;
    if (options.headers.has("Authorization")) return;

    const token = await getToken();
    if (token) {
      options.headers.set("Authorization", `Bearer ${token}`);
    }
  };
};

export const handleAuthError = ({
  refreshToken,
  onTokenRefreshed,
  onRefreshFailed,
  logger,
  logging,
}: Omit<AuthInterceptorOptions, "getToken"> & LogOptions): ResponseErrorFn => {
  const log = resolveLogger(
    { logger, logging },
    { component: "bonfire-sdk.handleAuthError" },
  );

  let refreshPromise: Promise<string | null> | null = null;

  return async ({ options, context, error, retry }) => {
    if (
      context.meta.protected === false ||
      context.meta.hasRetriedAuth ||
      !refreshToken ||
      !isTokenExpiredError(error)
    ) {
      return;
    }

    log?.debug(messages.tokenExpired, {
      requestId: context.requestId,
      method: options.method ?? "GET",
      url: options.url,
    });

    context.meta.hasRetriedAuth = true;

    try {
      let newToken: string | null = null;

      if (refreshPromise) {
        newToken = await refreshPromise;
      } else {
        refreshPromise = (async () => {
          try {
            const data = await refreshToken();
            onTokenRefreshed?.(data.accessToken);
            return data.accessToken;
          } catch {
            onRefreshFailed?.();
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
        newToken = await refreshPromise;
      }

      if (!newToken) {
        throw new Error(messages.refreshFailed);
      }

      log?.debug(messages.refreshSucceeded, {
        requestId: context.requestId,
        method: options.method ?? "GET",
        url: options.url,
      });

      options.headers.set("Authorization", `Bearer ${newToken}`);
      return await retry();
    } catch (refreshError) {
      log?.error(messages.refreshFailed, {
        requestId: context.requestId,
        method: options.method ?? "GET",
        url: options.url,
        name:
          refreshError instanceof Error ? refreshError.name : "UnknownError",
        message:
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError),
      });
      throw refreshError;
    }
  };
};

export const createAuthInterceptors = (
  config: AuthInterceptorOptions & LogOptions,
) => {
  return {
    setAuthHeader: setAuthHeader(config.getToken),
    handleAuthError: handleAuthError({
      refreshToken: config.refreshToken,
      onTokenRefreshed: config.onTokenRefreshed,
      onRefreshFailed: config.onRefreshFailed,
      logger: config.logger,
      logging: config.logging,
    }),
  };
};

const isTokenExpiredError = (error: unknown): boolean => {
  if (error instanceof AipError) {
    return (
      error.code === 401 &&
      error.getErrorInfoReason() === apiErrorCodes.tokenExpired
    );
  }

  if (error instanceof HttpError && isAipErrorResponse(error.data)) {
    const aipError = new AipError(error.data.error);
    return (
      aipError.code === 401 &&
      aipError.getErrorInfoReason() === apiErrorCodes.tokenExpired
    );
  }

  return false;
};
