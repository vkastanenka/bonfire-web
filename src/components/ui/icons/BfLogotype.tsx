import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import RawBfLogotype from "@/assets/icons/bf-logotype.svg?react";

export const BfLogotype = (props: SvgIconProps) => {
  return (
    <SvgIcon
      component={RawBfLogotype}
      inheritViewBox
      {...props}
      sx={{
        width: 120,
        height: "auto",
        ...props.sx,
      }}
    />
  );
};
