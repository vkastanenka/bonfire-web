import { AipError, AppError, STATUS_CODES } from "@/errs";
import {
  API_ERROR_CODES,
  REQUEST_ERROR_CODES,
  REQUEST_ERROR_MESSAGES,
  request,
  type BeforeRequestFn,
  type ResponseErrorFn,
} from "@/http";
import { accessTokenResponseSchema, useAuthStore } from "./auth";
import { defaultConfig } from "./client";

export const setAuthHeader: BeforeRequestFn = (options) => {
  if (!options.protected) return;

  const token = useAuthStore.getState().accessToken;
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }
};

let refreshPromise: Promise<string | null> | null = null;

export const handleAuthError: ResponseErrorFn = async (
  options,
  context,
  error,
  retry,
) => {
  if (options.protected === false || context.meta.hasRetriedAuth) {
    return;
  }

  if (
    !(error instanceof AipError) ||
    error.httpCode !== STATUS_CODES.UNAUTHORIZED
  ) {
    return;
  }

  if (error.getErrorInfoReason() !== API_ERROR_CODES.TOKEN_EXPIRED) {
    return;
  }

  context.logger.debug("Access token expired. Attempting token refresh.");
  context.meta.hasRetriedAuth = true;

  try {
    let newToken: string | null = null;

    if (refreshPromise) {
      newToken = await refreshPromise;
    } else {
      refreshPromise = (async () => {
        try {
          const data = await request({
            method: "POST",
            url: `${defaultConfig.baseUrl}/auth/refresh`,
            schema: accessTokenResponseSchema,
            headers: defaultConfig.headers,
            credentials: defaultConfig.credentials,
            timeout: defaultConfig.timeout,
          });
          useAuthStore.getState().setAccessToken(data.accessToken);
          return data.accessToken;
        } catch {
          useAuthStore.getState().clearSession();
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
      newToken = await refreshPromise;
    }

    if (!newToken) {
      throw new AppError({
        code: REQUEST_ERROR_CODES.TOKEN_REFRESH_FAILED,
        message:
          REQUEST_ERROR_MESSAGES[REQUEST_ERROR_CODES.TOKEN_REFRESH_FAILED],
      });
    }

    context.logger.debug("Token refresh succeeded. Retrying request.");
    options.headers.set("Authorization", `Bearer ${newToken}`);

    return await retry();
  } catch (error) {
    context.logger.error("Authentication failed. Clearing session tokens.", {
      error,
    });

    throw error;
  }
};
