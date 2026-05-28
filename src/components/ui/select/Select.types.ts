import { type ResponsiveValue } from "@/utils";
import type { MapKey, MapValue } from "@/types";
import {
  SELECT_SIZES,
  SELECT_COLORS,
  SELECT_VARIANTS,
} from "./Select.constants";

/**
 * Constants
 */

export type SelectSizesKey = MapKey<typeof SELECT_SIZES>;
export type SelectSizesValue = MapValue<typeof SELECT_SIZES>;

export type SelectColorsKey = MapKey<typeof SELECT_COLORS>;
export type SelectColorsValue = MapValue<typeof SELECT_COLORS>;

export type SelectVariantsKey = MapKey<typeof SELECT_VARIANTS>;
export type SelectVariantsValue = MapValue<typeof SELECT_VARIANTS>;

/**
 * Components
 */

export interface SelectProps extends Omit<
  React.ComponentPropsWithoutRef<"select">,
  "size"
> {
  size?: ResponsiveValue<SelectSizesKey>;
  color?: SelectColorsKey;
  variant?: SelectVariantsKey;
}

export type SelectVariantProps = Omit<SelectProps, "variant">;
