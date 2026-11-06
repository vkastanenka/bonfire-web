import type { QueryClient } from "@tanstack/react-query";
import { createRouter, redirect } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { useAuthStore } from "@/bonfire";
import { queryClient } from "./query-client";
import { paths } from "@/constants";

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
  const { redirectTo = paths.login } = options;

  return () => {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}

export function requireGuest(options: { redirectTo?: string } = {}) {
  const { redirectTo = paths.me } = options;

  return () => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      throw redirect({
        to: redirectTo,
      });
    }
  };
}
