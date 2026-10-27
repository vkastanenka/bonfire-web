import type { JSX } from "react";
import { Avatar, Divider, Stack, IconButton, Tooltip } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExploreIcon from "@mui/icons-material/Explore";
import DownloadIcon from "@mui/icons-material/Download";

export const Sidenav = () => {
  return (
    <Stack sx={{ bgcolor: "grey.50", gap: (t) => t.spacingTokens.group }}>
      <SidenavButton src="/" />
      <Divider sx={{ width: "75%", alignSelf: "center" }} />
      <SidenavButton src="/" />
      <SidenavButton src="/" />
      <SidenavButton src="/" />
      <SidenavButton Icon={<AddCircleIcon />} />
      <SidenavButton Icon={<ExploreIcon />} />
      <SidenavButton Icon={<DownloadIcon />} />
    </Stack>
  );
};

interface SidenavButtonProps {
  src?: string;
  Icon?: JSX.Element;
}

export const SidenavButton = ({ src, Icon }: SidenavButtonProps) => {
  return (
    <SidenavButtonWrapper>
      {src && <Avatar src={src} sx={{ bgcolor: "grey.400" }} />}
      {Icon && Icon}
    </SidenavButtonWrapper>
  );
};

interface SidenavButtonWrapperProps {
  children: React.ReactNode;
}

const SidenavButtonWrapper = ({ children }: SidenavButtonWrapperProps) => {
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
