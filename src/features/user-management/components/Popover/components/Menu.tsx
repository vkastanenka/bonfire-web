import * as React from "react";
import { Menu as MuiMenu, MenuItem as MuiMenuItem } from "@mui/material";
import { itemStyles } from "../constants";
import { Content } from "./Content";

export interface MenuProps {
  children: React.ReactNode;
  id: string;
  buttonId: string;
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
}

export const Menu = ({
  children,
  id,
  buttonId,
  anchorEl,
  open,
  handleClose,
}: MenuProps) => {
  return (
    <MuiMenu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        paper: { sx: { ml: 1 } },
        list: {
          "aria-labelledby": buttonId,
          sx: (t) => ({
            ...t.styles.card,
            minWidth: 200,
          }),
        },
      }}
    >
      {children}
    </MuiMenu>
  );
};

export interface MenuItemProps {
  icon?: React.ElementType;
  color?: string;
  label: string;
  description?: string;
  hasSubmenu?: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const MenuItem = ({
  icon,
  color,
  label,
  description,
  hasSubmenu,
  onClick,
}: MenuItemProps) => (
  <MuiMenuItem onClick={onClick} sx={itemStyles}>
    <Content
      icon={icon}
      iconColor={color}
      iconSize={12}
      gap={2}
      label={label}
      description={description}
      hasSubmenu={hasSubmenu}
    />
  </MuiMenuItem>
);
