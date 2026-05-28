import { forwardRef, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn, resolveResponsiveValues } from "@/utils";
import { Button } from "../button";
import {
  A11Y,
  TEXT_INPUT_SIZES,
  TEXT_INPUT_COLORS,
  TEXT_INPUT_VARIANTS,
  TEXT_INPUT_TYPES,
} from "./TextInput.constants";
import {
  type TextInputProps,
  type TextInputVariantProps,
} from "./TextInput.types";

export const TextInputBase = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      size,
      color,
      variant,
      suggestions,
      type = "text",
      value,
      onClear,
      ...props
    },
    ref,
  ) => {
    console.log("TextInput.tsx TODO: Handle ref", ref);
    const inputRef = useRef<HTMLInputElement>(null);

    const isSearch = type === TEXT_INPUT_TYPES.search;

    const styles = cn(
      "input",
      size ? resolveResponsiveValues(size, TEXT_INPUT_SIZES) : "input-lg",
      color && TEXT_INPUT_COLORS[color],
      variant && TEXT_INPUT_VARIANTS[variant],
      className,
    );

    const handleClear = () => {
      onClear?.();
      inputRef.current?.focus();
    };

    const inputElement = (
      <>
        <input
          {...props}
          ref={inputRef}
          value={value}
          type={type}
          list={suggestions?.id ? suggestions.id : undefined}
          className={cn(isSearch ? "" : styles, "remove-input-decorations")}
        />
        {suggestions?.collection && suggestions?.collection.length > 0 && (
          <datalist id={suggestions.id}>
            {suggestions.collection.map((s, i) => (
              <option key={`${s}-${i}`} value={s} />
            ))}
          </datalist>
        )}
      </>
    );

    if (isSearch) {
      return (
        <label className={cn(styles)}>
          <Search className="w-[1em] h-[1em]" />
          {inputElement}
          {value && (
            <Button.Ghost
              shape="circle"
              onClick={handleClear}
              aria-label={A11Y.clear}
              className="w-[1.75em] h-[1.75em]"
            >
              <X />
            </Button.Ghost>
          )}
        </label>
      );
    }

    return inputElement;
  },
);
TextInputBase.displayName = "TextInput";

const TextInputGhost = forwardRef<HTMLInputElement, TextInputVariantProps>(
  (props, ref) => <TextInputBase ref={ref} {...props} variant="ghost" />,
);
TextInputGhost.displayName = "TextInput.Ghost";

export const TextInput = Object.assign(TextInputBase, {
  Ghost: TextInputGhost,
});
