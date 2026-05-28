import { forwardRef } from "react";
import { cn, resolveResponsiveValues } from "@/utils";
import {
  SELECT_SIZES,
  SELECT_COLORS,
  SELECT_VARIANTS,
} from "./Select.constants";
import { type SelectProps } from "./Select.types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ size, color, variant, className, children, ...props }, ref) => {
    const styles = cn(
      "select",
      size ? resolveResponsiveValues(size, SELECT_SIZES) : "select-lg",
      color && SELECT_COLORS[color],
      variant && SELECT_VARIANTS[variant],
      className,
    );

    return (
      <select ref={ref} {...props} className={styles}>
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";
