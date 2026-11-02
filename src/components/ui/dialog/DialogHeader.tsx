import type { ReactNode } from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DialogHeaderProps {
  title?: string;
  children?: ReactNode;
  handleClose?: () => void;
}

export const DialogHeader = ({
  title,
  children,
  handleClose,
}: DialogHeaderProps) => {
  if (!title && !children && !handleClose) {
    return null;
  }

  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        gap: 2,
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {title && !children && (
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
      )}
      {children && children}
      {handleClose && (
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      )}
    </Stack>
  );
};
