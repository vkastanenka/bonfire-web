import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import type { ButtonProps, ButtonVariantProps } from "./Button.types";
import { getButtonStyles } from "./Button.utils";
import { cn } from "@/utils";

const ButtonBase = forwardRef(
  (
    { children, isLoading, disabled, onClick, ...props }: ButtonProps,
    ref: React.Ref<HTMLButtonElement | null> | undefined,
  ) => {
    const { styles, rest } = getButtonStyles(props);
    const isComponentDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        aria-disabled={isComponentDisabled ? true : undefined}
        aria-live="polite"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (isComponentDisabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        className={cn(
          styles,
          isComponentDisabled && "btn-disabled",
          "[&>svg]:w-[1.25em] [&>svg]:h-[1.25em]",
        )}
        {...rest}
      >
        {isLoading && (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);

ButtonBase.displayName = "Button";

const createButtonVariant = (variant: NonNullable<ButtonProps["variant"]>) => {
  const Component = forwardRef<HTMLButtonElement, ButtonVariantProps>(
    (props, ref) => <ButtonBase ref={ref} {...props} variant={variant} />,
  );
  Component.displayName = `Button.${variant.charAt(0).toUpperCase() + variant.slice(1)}`;
  return Component;
};

export const Button = Object.assign(ButtonBase, {
  Soft: createButtonVariant("soft"),
  Outline: createButtonVariant("outline"),
  Dash: createButtonVariant("dash"),
  Active: createButtonVariant("active"),
  Ghost: createButtonVariant("ghost"),
  Link: createButtonVariant("link"),
});
