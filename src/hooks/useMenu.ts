import { useState, useCallback, useId } from "react";

export interface UseMenuOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

export const useMenu = <T extends HTMLElement = HTMLElement>(
  options: UseMenuOptions = {},
) => {
  const id = useId();
  const buttonId = `${id}-button`;
  const menuId = `${id}-menu`;
  const { onOpen, onClose } = options;
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback(
    (event: React.MouseEvent<T> | React.KeyboardEvent<T>) => {
      setAnchorEl(event.currentTarget as T);
      onOpen?.();
    },
    [onOpen],
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(
    (event: React.MouseEvent<T> | React.KeyboardEvent<T>) => {
      if (open) {
        handleClose();
      } else {
        handleOpen(event);
      }
    },
    [open, handleOpen, handleClose],
  );

  return {
    buttonId,
    menuId,
    open,
    anchorEl,
    handleOpen,
    handleClose,
    toggle,
    setAnchorEl,
  };
};
