import { redirect } from "@tanstack/react-router";
import { authService } from "../core";
import { getAccessToken, setAccessToken, clearAuth } from "../core/store";

// Scoped safely to the SDK module to handle React StrictMode double-mounts
let refreshPromise: Promise<{ access_token: string }> | null = null;

interface AuthGuardOptions {
  /** @default '/login' */
  redirectTo?: string;
}

/**
 * Higher-order route guard for TanStack Router to enforce authentication.
 * Automatically handles background session restoration via refresh cookies.
 */
export function requireAuth(options: AuthGuardOptions = {}) {
  const { redirectTo = "/login" } = options;

  // This returns the exact async function TanStack Router's beforeLoad expects
  return async ({ location }: { location: { href: string } }) => {
    // 1. Memory check (fast-path)
    if (getAccessToken()) {
      return;
    }

    // 2. Network check (slow-path session restoration)
    try {
      if (!refreshPromise) {
        refreshPromise = authService.refresh();
      }

      const data = await refreshPromise;
      setAccessToken(data.access_token);
    } catch (error) {
      console.error("[SDK Auth Guard] Session restoration rejected:", error);
      clearAuth();

      // 3. Fallback to login redirect
      throw redirect({
        to: redirectTo,
        search: {
          redirect: location.href,
        },
      });
    } finally {
      refreshPromise = null;
    }
  };
}
