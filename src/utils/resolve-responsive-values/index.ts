import { type ResponsiveValue } from "./resolve-responsive-values.types";

export * from "./resolve-responsive-values.types";

export const resolveResponsiveValues = <T extends string | number | boolean>(
  values: ResponsiveValue<T>,
  map?: Record<string, string>,
  prefix: string = "",
): string | string[] => {
  if (typeof values !== "object" || values === null) {
    const valStr = String(values);
    return map ? map[valStr] : `${prefix}${valStr}`;
  }

  return Object.entries(values).map(([bp, val]) => {
    const valStr = String(val);
    const mappedVal = map ? map[valStr] : `${prefix}${valStr}`;
    return bp === "base" ? mappedVal : `${bp}:${mappedVal}`;
  });
};
