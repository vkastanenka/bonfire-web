export type Breakpoints = "base" | "sm" | "md" | "lg" | "xl" | "2xl";

export type MapKey<T> = keyof T;
export type MapValue<T> = T[keyof T];
