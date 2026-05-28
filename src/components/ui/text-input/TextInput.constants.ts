export const A11Y = {
  clear: "Clear search input",
} as const;

export const TEXT_INPUT_SIZES = {
  xs: {
    base: "input-xs",
    sm: "sm:input-xs",
    md: "md:input-xs",
    lg: "lg:input-xs",
    xl: "xl:input-xs",
    "2xl": "2xl:input-xs",
  },
  sm: {
    base: "input-sm",
    sm: "sm:input-sm",
    md: "md:input-sm",
    lg: "lg:input-sm",
    xl: "xl:input-sm",
    "2xl": "2xl:input-sm",
  },
  md: {
    base: "input-md",
    sm: "sm:input-md",
    md: "md:input-md",
    lg: "lg:input-md",
    xl: "xl:input-md",
    "2xl": "2xl:input-md",
  },
  lg: {
    base: "input-lg",
    sm: "sm:input-lg",
    md: "md:input-lg",
    lg: "lg:input-lg",
    xl: "xl:input-lg",
    "2xl": "2xl:input-lg",
  },
  xl: {
    base: "input-xl",
    sm: "sm:input-xl",
    md: "md:input-xl",
    lg: "lg:input-xl",
    xl: "xl:input-xl",
    "2xl": "2xl:input-xl",
  },
} as const;

export const TEXT_INPUT_COLORS = {
  neutral: "input-neutral",
  primary: "input-primary",
  secondary: "input-secondary",
  accent: "input-accent",
  info: "input-info",
  success: "input-success",
  warning: "input-warning",
  error: "input-error",
} as const;

export const TEXT_INPUT_VARIANTS = { ghost: "input-ghost" } as const;

export const TEXT_INPUT_TYPES = {
  date: "date",
  time: "time",
  datetime: "datetime-local",
  search: "search",
  text: "text",
} as const;
