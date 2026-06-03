import { Avatar, Stack, IconButton, Tooltip } from "@mui/material";
import type { JSX } from "react";

interface AppSideNavButtonWrapperProps {
  children: React.ReactNode;
}

const AppSideNavButtonWrapper = ({
  children,
}: AppSideNavButtonWrapperProps) => {
  return (
    <Stack
      sx={{
        width: 72,
        height: 40,
        position: "relative",
        alignItems: "center",
      }}
    >
      <Tooltip title="Direct Messages" placement="right">
        <IconButton
          sx={{
            p: 0,
            width: 40,
            height: 40,
            bgcolor: "grey.200",
            "&:hover": {
              bgcolor: "grey.300",
            },
          }}
        >
          {children}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

interface AppSideNavButtonProps {
  src?: string;
  Icon?: JSX.Element;
}

export const AppSideNavButton = ({ src, Icon }: AppSideNavButtonProps) => {
  return (
    <AppSideNavButtonWrapper>
      {src && <Avatar src={src} sx={{ bgcolor: "grey.400" }} />}
      {Icon && Icon}
    </AppSideNavButtonWrapper>
  );
};
