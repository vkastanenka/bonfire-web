import { Children, forwardRef, isValidElement } from "react";
import { LoaderCircle } from "lucide-react";
import type { ButtonProps } from "./Button.types";
import { getButtonStyles } from "./Button.utils";
import { cn } from "@/utils";

export const Button = forwardRef(
  (
    { children, isLoading, onClick, ...props }: ButtonProps,
    ref: React.Ref<HTMLButtonElement | null> | undefined,
  ) => {
    const { styles, rest } = getButtonStyles(props);

    const isSvgOnly = (() => {
      // 1. Safe conversion to an array (handles text, fragments, arrays, and empty states gracefully)
      const childrenArray = Children.toArray(children);

      // 2. If there isn't exactly one child item, it's not an icon-only button
      if (childrenArray.length !== 1) return false;

      const child = childrenArray[0];

      console.log("child", child);

      // 3. Make sure it's actually a valid React Element (not a plain text string)
      if (!isValidElement(child)) return false;

      // 4. Matches native <svg> tags
      if (child.type === "svg") return true;

      if (
        typeof child.type === "object" &&
        child.type !== null &&
        "render" in child.type
      ) {
        const componentName = (child.type as any).displayName || "";

        // Lucide explicitly sets a displayName on every single icon component
        if (componentName) {
          return true;
        }
      }

      return false;
    })();

    console.log(isSvgOnly);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        aria-disabled={isLoading ? true : undefined}
        aria-live="polite"
        onClick={handleClick}
        className={cn(
          styles,
          isLoading && "btn-disabled",
          "[&>svg]:w-[1.25em] [&>svg]:h-[1.25em]",
        )}
        {...rest}
      >
        {isLoading && <LoaderCircle className="animate-spin" />}
        {isSvgOnly ? !isLoading && children : children}
      </button>
    );
  },
);
