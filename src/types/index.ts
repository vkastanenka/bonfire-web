import type { LinkProps } from "@tanstack/react-router";

export interface AppRoute {
  path: LinkProps["to"];
  label: string;
}

export type Breakpoints = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export type MapKey<T> = keyof T;
export type MapValue<T> = T[keyof T];
