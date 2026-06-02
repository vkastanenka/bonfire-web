import { Stack } from "@mui/material";

import { AppNav } from "./AppNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Stack sx={{ gap: (t) => t.spacingTokens.stack }}>
      <AppNav />
      {children}
    </Stack>
  );
};
