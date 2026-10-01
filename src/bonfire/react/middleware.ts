import { redirect } from "@tanstack/react-router";
import { authManager } from "../auth";

export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async ({ location }: { location: { href: string } }) => {
    const token = await authManager.restore();

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
    const token = authManager.getAccessToken();

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
