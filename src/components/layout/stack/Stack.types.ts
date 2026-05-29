import type { HTMLDivProps, MapKey, MapValue } from "@/types";
import { type ResponsiveValue } from "@/utils";
import {
  FLEX_ALIGN_MAP,
  FLEX_DIRECTION_MAP,
  FLEX_GAP_MAP,
  FLEX_JUSTIFY_MAP,
} from "./Stack.constants";

/**
 * Constants
 */

export type FlexAlignMapKey = MapKey<typeof FLEX_ALIGN_MAP>;
export type FlexAlignMapValue = MapValue<typeof FLEX_ALIGN_MAP>;

export type FlexDirectionMapKey = MapKey<typeof FLEX_DIRECTION_MAP>;
export type FlexDirectionMapValue = MapValue<typeof FLEX_DIRECTION_MAP>;

export type FlexGapMapKey = MapKey<typeof FLEX_GAP_MAP>;
export type FlexGapMapValue = MapValue<typeof FLEX_GAP_MAP>;

export type FlexJustifyMapKey = MapKey<typeof FLEX_JUSTIFY_MAP>;
export type FlexJustifyMapValue = MapValue<typeof FLEX_JUSTIFY_MAP>;

/**
 * Components
 */

export interface FlexProps extends HTMLDivProps {
  children: React.ReactNode;
  direction?: ResponsiveValue<FlexDirectionMapKey>;
  justify?: ResponsiveValue<FlexJustifyMapKey>;
  align?: ResponsiveValue<FlexAlignMapKey>;
  gap?: ResponsiveValue<FlexGapMapKey>;
  wrap?: ResponsiveValue<boolean>;
  stretchItems?: boolean;
}
