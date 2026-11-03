import * as React from "react";
import { type Presence } from "@/presence";
import { type presenceOptions } from "./constants";

export const usePresenceMenu = (onClosePopover: () => void) => {
  const id = React.useId();
  const presenceMenuId = `${id}-presence-menu`;
  const presenceMenuButtonId = `${id}-presence-menu-button`;
  const durationMenuId = `${id}-duration-menu`;

  const [presenceAnchor, setPresenceAnchor] =
    React.useState<null | HTMLElement>(null);
  const [durationAnchor, setDurationAnchor] =
    React.useState<null | HTMLElement>(null);
  const [selectedPresence, setSelectedPresence] =
    React.useState<Presence | null>(null);

  const handleOpenPresenceMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setPresenceAnchor(event.currentTarget);
  };

  const handleCloseMenus = () => {
    setPresenceAnchor(null);
    setDurationAnchor(null);
    setSelectedPresence(null);
  };

  const handlePresenceItemClick = (
    option: (typeof presenceOptions)[number],
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (option.hasSubmenu) {
      setSelectedPresence(option.key as Presence);
      setDurationAnchor(event.currentTarget);
    } else {
      // Immediate selection (e.g., Online)
      handleCloseMenus();
      onClosePopover();
    }
  };

  const handleDurationSelect = (durationKey: string) => {
    // TODO: Dispatch update presence API action with `selectedPresence` and `durationKey`
    handleCloseMenus();
    onClosePopover();
  };

  return {
    ids: { presenceMenuId, presenceMenuButtonId, durationMenuId },
    state: {
      presenceAnchor,
      presenceOpen: Boolean(presenceAnchor),
      durationAnchor,
      durationOpen: Boolean(durationAnchor),
    },
    handlers: {
      handleOpenPresenceMenu,
      handleCloseMenus,
      handlePresenceItemClick,
      handleDurationSelect,
      setDurationAnchor,
    },
  };
};

const EMAILS = ["username@gmail.com", "user02@gmail.com"] as const;

export const useHandleEditProfile = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<string>(EMAILS[1]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value?: string) => {
    setOpen(false);
    if (value) {
      setSelectedValue(value);
    }
  };

  return {
    state: {
      open,
      selectedValue,
      emails: EMAILS,
    },
    handlers: {
      handleClickOpen,
      handleClose,
    },
  };
};
