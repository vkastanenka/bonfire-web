import { AipError, AppError, statusCodes } from "@/errs";
import {
  apiErrorCodes,
  requestErrors,
  type BeforeRequestFn,
  type ResponseErrorFn,
} from "@/http";
import type { AccessTokenResponse } from "../auth";

export interface AuthInterceptorOptions {
  getToken?: () => string | Promise<string | null>;
  onTokenRefreshed?: (newToken: string) => void;
  onRefreshFailed?: () => void;
  refreshToken?: () => Promise<AccessTokenResponse>;
}

export const setAuthHeader = (
  getToken?: AuthInterceptorOptions["getToken"],
): BeforeRequestFn => {
  return async (options) => {
    if (options.protected === false || !getToken) return;

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
}: Omit<AuthInterceptorOptions, "getToken">): ResponseErrorFn => {
  let refreshPromise: Promise<string | null> | null = null;

  return async (options, context, error, retry) => {
    if (
      options.protected === false ||
      context.meta.hasRetriedAuth ||
      !refreshToken
    ) {
      return;
    }

    if (
      !(error instanceof AipError) ||
      error.httpCode !== statusCodes.unauthorized ||
      error.getErrorInfoReason() !== apiErrorCodes.tokenExpired
    ) {
      return;
    }

    context.logger?.debug("Access token expired. Attempting token refresh.");
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
        throw new AppError({
          code: requestErrors.tokenRefreshFailed.code,
          message: requestErrors.tokenRefreshFailed.message,
        });
      }

      context.logger?.debug("Token refresh succeeded. Retrying request.");
      options.headers.set("Authorization", `Bearer ${newToken}`);

      return await retry();
    } catch (refreshError) {
      context.logger?.error("Authentication failed. Clearing session tokens.", {
        error: refreshError,
      });
      throw refreshError;
    }
  };
};

export const createAuthInterceptors = (config: AuthInterceptorOptions) => {
  return {
    setAuthHeader: setAuthHeader(config.getToken),
    handleAuthError: handleAuthError({
      refreshToken: config.refreshToken,
      onTokenRefreshed: config.onTokenRefreshed,
      onRefreshFailed: config.onRefreshFailed,
    }),
  };
};
