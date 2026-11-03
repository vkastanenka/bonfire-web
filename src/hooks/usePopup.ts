import { useState, useCallback, type RefObject } from "react";

export interface UsePopupOptions<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T | null>;
  onOpen?: () => void;
  onClose?: () => void;
}

export const usePopup = <T extends HTMLElement = HTMLElement>(
  options: UsePopupOptions<T>,
) => {
  const { ref, onOpen, onClose } = options;
  const [anchorEl, setAnchorEl] = useState<T | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback(() => {
    if (ref.current) {
      setAnchorEl(ref.current);
      onOpen?.();
    }
  }, [ref, onOpen]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (open) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [open, handleOpen, handleClose]);

  return {
    open,
    anchorEl,
    handleOpen,
    handleClose,
    toggle,
    setAnchorEl,
  };
};
