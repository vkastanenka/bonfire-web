import type { MapKey, MapValue } from "@/types";
import { type ResponsiveValue } from "@/utils";
import { TEXT_SIZES } from "./Text.constants";

/**
 * Constants
 */

export type TextElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span";

export type TextSizesKey = MapKey<typeof TEXT_SIZES>;
export type TextSizesValue = MapValue<typeof TEXT_SIZES>;

/**
 * Components
 */

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  element?: TextElement;
  size?: ResponsiveValue<TextSizesKey>;
}
