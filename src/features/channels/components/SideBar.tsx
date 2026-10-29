import {
  Avatar,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import AddIcon from "@mui/icons-material/Add";

const SearchButton = () => {
  return (
    <>
      <Button variant="contained" size="small">
        {"Find or start a conversation"}
      </Button>
    </>
  );
};

const DirectMessagesHeader = () => {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {"Direct Messages"}
      </Typography>
      <Tooltip placement="top" title="Create Message">
        <IconButton>
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const DirectMessagesButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button sx={{ justifyContent: "start" }}>
      <Stack direction={"row"} sx={{ alignItems: "center", gap: 1 }}>
        <Avatar sx={{ bgcolor: "primary.main" }} />
        <Stack>
          <Typography sx={{ fontWeight: 500 }}>{children}</Typography>
        </Stack>
      </Stack>
    </Button>
  );
};

const DirectMessages = () => {
  return (
    <Stack sx={{ gap: (t) => t.tokens.spacing.tight }}>
      <DirectMessagesHeader />
      <DirectMessagesButton>{"Potato Princess"}</DirectMessagesButton>
      <DirectMessagesButton>{"Hexaclover"}</DirectMessagesButton>
      <DirectMessagesButton>{"Snowybot"}</DirectMessagesButton>
      <DirectMessagesButton>{"EradonsRival"}</DirectMessagesButton>
      <DirectMessagesButton>{"Afrii"}</DirectMessagesButton>
      <DirectMessagesButton>{"Sparkplug"}</DirectMessagesButton>
      <DirectMessagesButton>{"Blue Panda"}</DirectMessagesButton>
    </Stack>
  );
};

interface SidebarItemProps {
  children: React.ReactNode;
}

const SidebarItem = ({ children }: SidebarItemProps) => {
  return (
    <Stack
      sx={{
        p: (t) => t.tokens.spacing.group,
      }}
    >
      {children}
    </Stack>
  );
};

export const SideBar = () => {
  return (
    <Stack
      sx={{
        borderWidth: "1px",
        borderLeftStyle: "solid",
        borderTopStyle: "solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: 320,
        "& > :not(:last-of-type)": {
          borderWidth: "1px",
          borderBottomStyle: "solid",
          borderColor: "divider",
        },
      }}
    >
      <SidebarItem>
        <SearchButton />
      </SidebarItem>
      <SidebarItem>
        <Button
          startIcon={<EmojiPeopleIcon />}
          sx={{ justifyContent: "start" }}
        >
          {"Friends"}
        </Button>
      </SidebarItem>
      <SidebarItem>
        <DirectMessages />
      </SidebarItem>
    </Stack>
  );
};
