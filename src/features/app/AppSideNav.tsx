import { Divider, Stack } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExploreIcon from "@mui/icons-material/Explore";
import DownloadIcon from "@mui/icons-material/Download";
import { AppSideNavButton } from "./AppSideNavButton";

export const AppSideNav = () => {
  return (
    <Stack sx={{ bgcolor: "grey.50", gap: (t) => t.spacingTokens.group }}>
      <AppSideNavButton src="/" />
      <Divider sx={{ width: "75%", alignSelf: "center" }} />
      <AppSideNavButton src="/" />
      <AppSideNavButton src="/" />
      <AppSideNavButton src="/" />
      <AppSideNavButton Icon={<AddCircleIcon />} />
      <AppSideNavButton Icon={<ExploreIcon />} />
      <AppSideNavButton Icon={<DownloadIcon />} />
    </Stack>
  );
};
