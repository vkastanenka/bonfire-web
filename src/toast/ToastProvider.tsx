import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { toast } from "./toast";

interface ToastState {
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return toast.subscribe((event) => {
      if (event) {
        setToastState(event);
        setOpen(true);
      } else {
        setOpen(false);
      }
    });
  }, []);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toastState?.severity || "info"}
          variant="filled"
          sx={{ width: "100%", minWidth: "300px" }}
        >
          {toastState?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
