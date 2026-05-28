import { forwardRef } from "react";
import { cn, resolveResponsiveValues } from "@/utils";
import {
  SELECT_SIZES,
  SELECT_COLORS,
  SELECT_VARIANTS,
} from "./Select.constants";
import { type SelectProps, type SelectVariantProps } from "./Select.types";

export const SelectBase = forwardRef<HTMLSelectElement, SelectProps>(
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
SelectBase.displayName = "Select";

const SelectGhost = forwardRef<HTMLSelectElement, SelectVariantProps>(
  (props, ref) => <SelectBase ref={ref} {...props} variant="ghost" />,
);
SelectGhost.displayName = "Select.Ghost";

export const Select = Object.assign(SelectBase, {
  Ghost: SelectGhost,
});
