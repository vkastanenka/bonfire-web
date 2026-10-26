import React, { useState, useEffect } from "react";
import { Snackbar, Alert, AlertTitle, Box, Typography } from "@mui/material";
import { toast } from "./toast";

interface ToastState {
  message: string;
  description?: string | string[];
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
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toastState?.severity || "info"}
          variant="filled"
          sx={{ width: "100%", minWidth: "300px" }}
        >
          <AlertTitle sx={{ mb: toastState?.description ? 0.5 : 0 }}>
            {toastState?.message}
          </AlertTitle>

          {toastState?.description && (
            <Box component="div" sx={{ fontSize: "0.875rem", opacity: 0.9 }}>
              {Array.isArray(toastState.description) ? (
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {toastState.description.map((desc, index) => (
                    <Box component="li" key={index}>
                      {desc}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">
                  {toastState.description}
                </Typography>
              )}
            </Box>
          )}
        </Alert>
      </Snackbar>
    </>
  );
};
