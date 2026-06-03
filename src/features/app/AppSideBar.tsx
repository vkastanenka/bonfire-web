import { Button, Stack } from "@mui/material";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";

const AppSearchButton = () => {
  return (
    <>
      <Button variant="contained" size="small">
        {"Find or start a conversation"}
      </Button>
    </>
  );
};

interface AppSideBarItemProps {
  children: React.ReactNode;
}

const AppSideBarItem = ({ children }: AppSideBarItemProps) => {
  return (
    <Stack
      sx={{
        borderWidth: "1px",
        borderBottomStyle: "solid",
        borderColor: "divider",
        p: (t) => t.spacingTokens.group,
      }}
    >
      {children}
    </Stack>
  );
};

export const AppSideBar = () => {
  return (
    <Stack
      sx={{
        borderWidth: "1px",
        borderLeftStyle: "solid",
        borderTopStyle: "solid",
        borderColor: "divider",
        bgcolor: "grey.50",
        width: 280,
      }}
    >
      <AppSideBarItem>
        <AppSearchButton />
      </AppSideBarItem>
      <AppSideBarItem>
        <Button
          startIcon={<EmojiPeopleIcon />}
          sx={{ justifyContent: "start" }}
        >
          {"Friends"}
        </Button>
      </AppSideBarItem>
    </Stack>
  );
};
