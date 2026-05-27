import { forwardRef } from "react";
import { cn } from "@/utils";
import type { IconWrapperProps } from "./IconWrapper.types";

export const IconWrapper = forwardRef(
  (
    { children, className, ...props }: IconWrapperProps,
    ref: React.Ref<HTMLDivElement | null> | undefined,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-4 shrink-0 align-middle inline-flex items-center justify-center",
          "[&>svg]:w-full [&>svg]:h-full [&>svg]:block",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
