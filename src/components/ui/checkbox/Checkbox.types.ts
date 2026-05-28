import { type ResponsiveValue } from "@/utils";
import type { MapKey, MapValue } from "@/types";
import { CHECKBOX_SIZES, CHECKBOX_COLORS } from "./Checkbox.constants";

/**
 * Constants
 */

export type CheckboxSizesKey = MapKey<typeof CHECKBOX_SIZES>;
export type CheckboxSizesValue = MapValue<typeof CHECKBOX_SIZES>;

export type CheckboxColorsKey = MapKey<typeof CHECKBOX_COLORS>;
export type CheckboxColorsValue = MapValue<typeof CHECKBOX_COLORS>;

/**
 * Components
 */

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "size" | "type"
> {
  color?: CheckboxColorsKey;
  size?: ResponsiveValue<CheckboxSizesKey>;
}
