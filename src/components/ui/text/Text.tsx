import { cn, resolveResponsiveValues } from "@/utils";
import { TEXT_SIZES } from "./Text.constants";
import type { TextProps } from "./Text.types";

const TextBase = ({
  children,
  className,
  element: Component = "p",
  size = "md",
  ...props
}: TextProps) => {
  return (
    <Component
      className={cn(resolveResponsiveValues(size, TEXT_SIZES), className)}
      {...props}
    >
      {children}
    </Component>
  );
};

const TextHeading = ({
  children,
  element = "h2",
  size = "4xl",
  ...props
}: TextProps) => {
  return (
    <TextBase element={element} size={size} {...props}>
      {children}
    </TextBase>
  );
};

const TextBody = ({ ...props }: TextProps) => {
  return <TextBase {...props} />;
};

export const Text = Object.assign(TextBase, {
  Heading: TextHeading,
  Body: TextBody,
});
