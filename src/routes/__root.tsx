import { createRootRouteWithContext } from "@tanstack/react-router";
import { type RouterContext } from "@/app";
import { RootLayout } from "@/features";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
