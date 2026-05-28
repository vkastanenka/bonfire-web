import { type ResponsiveValue } from "@/utils";
import type { MapKey, MapValue } from "@/types";
import {
  BUTTON_SIZES,
  BUTTON_COLORS,
  BUTTON_VARIANTS,
  BUTTON_SHAPES,
  BUTTON_DISPLAYS,
} from "./Button.constants";

/**
 * Constants
 */

export type ButtonSizesKey = MapKey<typeof BUTTON_SIZES>;
export type ButtonSizesValue = MapValue<typeof BUTTON_SIZES>;

export type ButtonColorsKey = MapKey<typeof BUTTON_COLORS>;
export type ButtonColorsValue = MapValue<typeof BUTTON_COLORS>;

export type ButtonVariantsKey = MapKey<typeof BUTTON_VARIANTS>;
export type ButtonVariantsValue = MapValue<typeof BUTTON_VARIANTS>;

export type ButtonShapesKey = MapKey<typeof BUTTON_SHAPES>;
export type ButtonShapesValue = MapValue<typeof BUTTON_SHAPES>;

export type ButtonDisplaysKey = MapKey<typeof BUTTON_DISPLAYS>;
export type ButtonDisplaysValue = MapValue<typeof BUTTON_DISPLAYS>;

/**
 * Components
 */

export interface ButtonStyleProps {
  unstyled?: boolean;
  className?: string;
  size?: ResponsiveValue<ButtonSizesKey>;
  color?: ButtonColorsKey;
  variant?: ButtonVariantsKey;
  shape?: ButtonShapesKey;
  display?: ResponsiveValue<ButtonDisplaysKey>;
}

export type BaseButtonProps = {
  children: React.ReactNode;
  isLoading?: boolean;
} & ButtonStyleProps;

export type ButtonProps = BaseButtonProps & React.ComponentProps<"button">;

export type ButtonVariantProps = Omit<ButtonProps, "variant">;
