import type { z } from "zod";
import {
  API_ERROR_CODES,
  getErrorInfoReason,
  isAppError,
  type RequestMiddleware,
  type RequestContext,
  type RequestOptions,
} from "../lib";
import type { AuthManager } from "../auth";

export class AuthMiddleware implements RequestMiddleware {
  private authManager: AuthManager;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  async beforeRequest<T extends z.ZodTypeAny>(
    options: RequestOptions<T>,
    _context: RequestContext,
    headers: Headers,
  ) {
    if (!options.protected) return;
    const token = await this.authManager.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  private async safeRefresh(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = Promise.resolve(
        this.authManager.refreshAccessToken(),
      ).finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  async onResponseError<T extends z.ZodTypeAny>(
    response: Response,
    options: RequestOptions<T>,
    context: RequestContext,
    retry: () => Promise<unknown>,
  ) {
    if (response.status !== 401 || !options.protected || context.isAuthRetry) {
      return;
    }

    try {
      const errorBody = await response
        .clone()
        .json()
        .catch(() => null);

      const isExpired =
        isAppError(errorBody) &&
        getErrorInfoReason(errorBody) === API_ERROR_CODES.TOKEN_EXPIRED;

      if (!isExpired) return;

      context.isAuthRetry = true;
      const newToken = await this.safeRefresh();
      if (!newToken) throw new Error("Token refresh failed.");

      return await retry();
    } catch (error) {
      await this.authManager.clearTokens();
      throw error;
    }
  }
}
