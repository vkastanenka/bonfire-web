import type { LinkProps } from "@tanstack/react-router";

export interface AppRoute {
  path: LinkProps["to"];
  label: string;
}
