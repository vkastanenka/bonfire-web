import { useState, useCallback } from "react";

export interface UseDialogOptions {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const useDialog = (options: UseDialogOptions = {}) => {
  const { initialOpen = false, onOpen, onClose } = options;
  const [open, setOpen] = useState(initialOpen);

  const handleOpen = useCallback(() => {
    setOpen(true);
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return {
    open,
    handleOpen,
    handleClose,
    toggle,
    setOpen,
  };
};
