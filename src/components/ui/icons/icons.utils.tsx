import React, { forwardRef } from "react";
import { cn } from "@/utils";
import { IconWrapper, type IconWrapperProps } from "../icon-wrapper";

export function createIcon(
  SvgComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  displayName: string,
  defaultClassName?: string,
) {
  const Component = forwardRef<
    HTMLDivElement,
    Omit<IconWrapperProps, "children">
  >(({ className, ...props }, ref) => {
    return (
      <IconWrapper
        ref={ref}
        className={cn(defaultClassName, className)}
        {...props}
      >
        <SvgComponent />
      </IconWrapper>
    );
  });

  Component.displayName = displayName;
  return Component;
}
