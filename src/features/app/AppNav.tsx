import InboxIcon from "@mui/icons-material/Inbox";
import HelpIcon from "@mui/icons-material/Help";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { LABELS } from "./app.constants";

export const AppNav = () => {
  return (
    <Stack
      direction="row"
      sx={{
        height: 32,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: (t) => t.spacingTokens.tight }}
      >
        <EmojiPeopleIcon fontSize="small" />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {LABELS.friends}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          right: 8,
        }}
      >
        <Tooltip title="Inbox">
          <IconButton>
            <InboxIcon fontSize="small" aria-label="inbox" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Help">
          <IconButton>
            <HelpIcon fontSize="small" aria-label="help" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};
