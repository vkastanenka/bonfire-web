import { redirect } from "@tanstack/react-router";
import { tokenProvider } from "../http/tokens";

/**
 * Route middleware to enforce authenticated sessions.
 */
export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async ({ location }: { location: { href: string } }) => {
    let token = await tokenProvider.getAccessToken();

    // If memory token missing, trigger the thread-safe provider refresh method
    if (!token) {
      token = await tokenProvider.refreshAccessToken();
    }

    if (!token) {
      await tokenProvider.onSessionExpired();
      throw redirect({
        to: redirectTo,
        search: {
          redirect: location.href,
        },
      });
    }
  };
}

/**
 * Route middleware to restrict access to unauthenticated guests only.
 */
export function requireGuest(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/channels/@me" } = options;

  return async () => {
    const token = await tokenProvider.getAccessToken();
    if (token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
