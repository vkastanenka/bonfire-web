import { IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import { useRevokeSession, type Session } from "@/bonfire";
import { isMobileOS } from "@/utils";

interface DeviceProps {
  session: Session;
}

export const Device = ({ session }: DeviceProps) => {
  const {
    mutate,
    // isPending
  } = useRevokeSession();

  let Icon = DesktopWindowsIcon;

  if (isMobileOS(session.os)) {
    Icon = SmartphoneIcon;
  }

  const logOut = async () => {
    await mutate({ id: session.id, isCurrent: session.isCurrent });
  };

  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Stack direction="row" sx={{ gap: 2, alignItems: "center" }}>
        <Icon />
        <Stack>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Typography sx={{ fontWeight: 700 }}>{session.os}</Typography>
            <Typography>•</Typography>
            <Typography>{session.client}</Typography>
          </Stack>
          <Typography variant="body2">
            {formatLastSeen(session.lastSeenAt)}
          </Typography>
        </Stack>
      </Stack>
      <IconButton onClick={logOut}>
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};

const formatLastSeen = (dateInput: string | Date): string => {
  const now = new Date().getTime();
  const past = new Date(dateInput).getTime();
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffHours < 1) {
    return "less than an hour ago";
  }
  if (diffDays < 1) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }
  if (diffMonths < 1) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
  if (diffYears < 1) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  }
  return "more than a year ago";
};
