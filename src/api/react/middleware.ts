import { redirect } from "@tanstack/react-router";
import { sessionManager } from "../session/manager";
import { getAccessToken } from "../tokens";
import { authService } from "../http";

export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async ({ location }: { location: { href: string } }) => {
    const token = await sessionManager.restore(() =>
      authService.refresh({ skipRetry: true }),
    );

    if (!token) {
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
    const token = getAccessToken();

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
