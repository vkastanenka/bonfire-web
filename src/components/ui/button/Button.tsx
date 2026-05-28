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

const ButtonSoft = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="soft" />,
);
ButtonSoft.displayName = "Button.Soft";

const ButtonOutline = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="outline" />,
);
ButtonOutline.displayName = "Button.Outline";

const ButtonDash = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="dash" />,
);
ButtonDash.displayName = "Button.Dash";

const ButtonActive = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="active" />,
);
ButtonActive.displayName = "Button.Active";

const ButtonGhost = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="ghost" />,
);
ButtonGhost.displayName = "Button.Ghost";

const ButtonLink = forwardRef<HTMLButtonElement, ButtonVariantProps>(
  (props, ref) => <ButtonBase ref={ref} {...props} variant="link" />,
);
ButtonLink.displayName = "Button.Link";

export const Button = Object.assign(ButtonBase, {
  Soft: ButtonSoft,
  Outline: ButtonOutline,
  Dash: ButtonDash,
  Active: ButtonActive,
  Ghost: ButtonGhost,
  Link: ButtonLink,
});
