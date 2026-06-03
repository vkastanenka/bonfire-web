import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import AddIcon from "@mui/icons-material/Add";

const AppSearchButton = () => {
  return (
    <>
      <Button variant="contained" size="small">
        {"Find or start a conversation"}
      </Button>
    </>
  );
};

const AppDirectMessagesHeader = () => {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {"Direct Messages"}
      </Typography>
      <Tooltip placement="top" title="Create Message">
        <IconButton color="inherit">
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const AppDirectMessages = () => {
  return (
    <Stack sx={{ gap: (t) => t.spacingTokens.tight }}>
      <AppDirectMessagesHeader />
    </Stack>
  );
};

interface AppSideBarItemProps {
  children: React.ReactNode;
}

const AppSideBarItem = ({ children }: AppSideBarItemProps) => {
  return (
    <Stack
      sx={{
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
        "& > :not(:last-of-type)": {
          borderWidth: "1px",
          borderBottomStyle: "solid",
          borderColor: "divider",
        },
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
      <AppSideBarItem>
        <AppDirectMessages />
      </AppSideBarItem>
    </Stack>
  );
};
