import React from "react";
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "@tanstack/react-router";
import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  Link as MuiLink,
  type LinkProps as MuiLinkProps,
} from "@mui/material";

type ButtonLinkProps = Omit<MuiButtonProps, "href" | "to" | "type"> &
  RouterLinkProps;

export const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (props, ref) => {
    return (
      <MuiButton ref={ref} component={RouterLink} type={undefined} {...props} />
    );
  },
);

ButtonLink.displayName = "Link.Button";

type TextLinkProps = Omit<MuiLinkProps, "href" | "to"> & RouterLinkProps;

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  (props, ref) => {
    return <MuiLink ref={ref} component={RouterLink} {...props} />;
  },
);

TextLink.displayName = "Link.Text";

export const Link = Object.assign(
  {},
  {
    Text: TextLink,
    Button: ButtonLink,
  },
);
