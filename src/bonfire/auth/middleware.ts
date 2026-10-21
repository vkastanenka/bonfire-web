import { redirect } from "@tanstack/react-router";
import { authService } from "./service";

export function requireAuth(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/login" } = options;

  return async () => {
    const token = await authService.restore();

    if (!token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}

export function requireGuest(options: { redirectTo?: string } = {}) {
  const { redirectTo = "/channels/@me" } = options;

  return async () => {
    const token = await authService.getAccessToken();

    if (token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
