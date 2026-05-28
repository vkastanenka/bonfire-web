import { type Breakpoints } from "@/types";
import { type ResponsiveValue } from "./resolve-responsive-values.types";

export { type ResponsiveValue } from "./resolve-responsive-values.types";

export const resolveResponsiveValues = <T extends string>(
  values: ResponsiveValue<T>,
  classMap: Record<T, Partial<Record<Breakpoints, string>>>,
): string => {
  if (typeof values === "string") {
    return classMap[values]?.base ?? "";
  }

  return Object.entries(values)
    .map(([bp, val]) => {
      return classMap[val]?.[bp as Breakpoints] || "";
    })
    .filter(Boolean)
    .join(" ");
};

// import { type ResponsiveValue } from "./types";

// export * from "./types";

// export const resolveResponsiveValues = <T extends string | number | boolean>(
//   values: ResponsiveValue<T>,
//   map?: Record<string, string>,
//   prefix: string = "",
// ): string | string[] => {
//   if (typeof values !== "object" || values === null) {
//     const valStr = String(values);
//     return map ? map[valStr] : `${prefix}${valStr}`;
//   }

//   return Object.entries(values).map(([bp, val]) => {
//     const valStr = String(val);
//     const mappedVal = map ? map[valStr] : `${prefix}${valStr}`;
//     return bp === "base" ? mappedVal : `${bp}:${mappedVal}`;
//   });
// };
