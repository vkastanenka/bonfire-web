import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { RootLayout } from "@/features";

interface RouterContext {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    accessToken: string | null;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
