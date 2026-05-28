import { forwardRef } from "react";
import { cn, resolveResponsiveValues } from "@/utils";
import { CHECKBOX_SIZES, CHECKBOX_COLORS } from "./Checkbox.constants";
import { type CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size, color, className, ...props }, ref) => {
    const styles = cn(
      "checkbox",
      size ? resolveResponsiveValues(size, CHECKBOX_SIZES) : "checkbox-lg",
      color && CHECKBOX_COLORS[color],
      className,
    );

    return <input type="checkbox" ref={ref} {...props} className={styles} />;
  },
);
Checkbox.displayName = "Checkbox";
