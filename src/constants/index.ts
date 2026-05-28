import type { AppRoute } from "@/types";

/**
 * Navigation
 */

export const APP_ROUTES = {
  home: { path: "/", label: "Home" },
} as const satisfies Record<string, AppRoute>;

export const SOCIAL_LINKS = {
  linkedIn: "https://www.linkedin.com/in/vkastanenka",
  portfolio: "https://www.vkastanenka.com",
  github: "https://github.com/vkastanenka",
} as const;
