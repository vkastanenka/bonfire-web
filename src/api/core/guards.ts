import { redirect } from "@tanstack/react-router";
import { authService, type RefreshResponse } from "../core";
import { getAccessToken, setAccessToken, clearAuth } from "../core/store";

let globalRefreshPromise: Promise<RefreshResponse> | null = null;

async function getOrFetchFreshToken(): Promise<boolean> {
  if (getAccessToken()) {
    return true;
  }

  try {
    if (!globalRefreshPromise) {
      globalRefreshPromise = authService.refresh();
    }
    const data = await globalRefreshPromise;
    setAccessToken(data.access_token);
    return true;
  } catch {
    clearAuth();
    return false;
  } finally {
    globalRefreshPromise = null;
  }
}

export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async ({ location }: { location: { href: string } }) => {
    const isAuthenticated = await getOrFetchFreshToken();

    if (!isAuthenticated) {
      throw redirect({
        to: redirectTo,
        search: {
          redirect: location.href,
        },
      });
    }
  };
}

export function requireGuest(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/channels/@me" } = options;

  return () => {
    if (getAccessToken()) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
