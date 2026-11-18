import { Stack } from "@mui/material";
import type { ReactNode } from "react";

export const Dashboard = ({ children }: { children: ReactNode }) => {
  return (
    <Stack
      sx={{
        border: "inherit",
        borderWidth: "1px",
        borderTopStyle: "solid",
        borderColor: "divider",
        width: "100%",
      }}
    >
      {children}
    </Stack>
  );
};
