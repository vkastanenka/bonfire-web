import type { QueryClient } from "@tanstack/react-query";
import { createRouter, redirect } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { authService } from "@/bonfire";
import { queryClient } from "./query-client";

export interface RouterContext {
  queryClient: QueryClient;
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

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
    const token = await authService.restore();

    if (token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
