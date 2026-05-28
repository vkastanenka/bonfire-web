import { type ResponsiveValue } from "@/utils";
import type { MapKey, MapValue } from "@/types";
import {
  TEXT_INPUT_SIZES,
  TEXT_INPUT_COLORS,
  TEXT_INPUT_VARIANTS,
  TEXT_INPUT_TYPES,
} from "./TextInput.constants";

/**
 * Constants
 */

export type TextInputSizesKey = MapKey<typeof TEXT_INPUT_SIZES>;
export type TextInputSizesValue = MapValue<typeof TEXT_INPUT_SIZES>;

export type TextInputColorsKey = MapKey<typeof TEXT_INPUT_COLORS>;
export type TextInputColorsValue = MapValue<typeof TEXT_INPUT_COLORS>;

export type TextInputVariantsKey = MapKey<typeof TEXT_INPUT_VARIANTS>;
export type TextInputVariantsValue = MapValue<typeof TEXT_INPUT_VARIANTS>;

export type TextInputTypesKey = MapKey<typeof TEXT_INPUT_TYPES>;
export type TextInputTypesValue = MapValue<typeof TEXT_INPUT_TYPES>;

/**
 * Components
 */

export interface TextInputProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size" | "color" | "type"
> {
  size?: ResponsiveValue<TextInputSizesKey>;
  color?: TextInputColorsKey;
  variant?: TextInputVariantsKey;
  type?: TextInputTypesKey;
  suggestions?: { id: string; collection: string[] };
  onClear?: () => void;
}
