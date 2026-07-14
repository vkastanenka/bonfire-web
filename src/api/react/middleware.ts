import { redirect } from "@tanstack/react-router";
import { sessionManager } from "../session/manager";

export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async ({ location }: { location: { href: string } }) => {
    const token = await sessionManager.bootstrapSession();

    if (!token) {
      await sessionManager.handleSessionExpired();

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

  return async () => {
    const token = sessionManager.getAccessToken();

    // if (!token) {
    //   token = await sessionManager.bootstrapSession();
    // }

    if (token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
