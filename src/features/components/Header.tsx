import type { ReactNode } from "react";
import { Stack } from "@mui/material";

export const Header = ({ children }: { children: ReactNode }) => {
  return (
    <Stack
      sx={{
        height: 53,
        p: 1,
        justifyContent: "center",
        borderWidth: "1px",
        borderBottomStyle: "solid",
        borderColor: "divider",
      }}
    >
      {children}
    </Stack>
  );
};
