import { cn, resolveResponsiveValues } from "@/utils";
import {
  BUTTON_SIZES,
  BUTTON_COLORS,
  BUTTON_VARIANTS,
  BUTTON_SHAPES,
  BUTTON_DISPLAYS,
} from "./Button.constants";
import type { ButtonStyleProps } from "./Button.types";

export const getButtonStyles = <T extends ButtonStyleProps>(props: T) => {
  const { size, color, variant, shape, display, unstyled, className, ...rest } =
    props;

  const styles = !unstyled
    ? cn(
        "btn",
        size && resolveResponsiveValues(size, BUTTON_SIZES),
        color && BUTTON_COLORS[color],
        variant && BUTTON_VARIANTS[variant],
        shape && BUTTON_SHAPES[shape],
        display && resolveResponsiveValues(display, BUTTON_DISPLAYS),
        className,
      )
    : cn(
        "bg-transparent",
        "border-none",
        "p-0",
        "appearance-none",
        "transition-all",
        "hover:opacity-70",
        "active:scale-98",
        className,
      );

  return { styles, rest };
};
