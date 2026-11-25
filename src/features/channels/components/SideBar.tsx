import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Alert,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/features/auth";
import { useChannelStore } from "../store";
import { useUserStore } from "@/features/user";
import { Avatar } from "@/features/components";
import {
  presences,
  type Channel,
  type Member,
  type Presence,
  type User,
} from "@/bonfire-sdk";
import { paths } from "@/constants";

const labels = {
  noFriends: "No friends? No problem!",
  addFriendsToChat: "Add friends to start chatting",
  sendFriendRequest: "Send friend request",
  findOrStart: "Find or start a conversation",
  directMessages: "Direct Messages",
  createMessage: "Create Message",
};

export interface ChannelMemberEntry {
  user: User;
  presence: Presence;
}

export interface DirectMessageData {
  channel: Channel;
  membership: Member;
  members: ChannelMemberEntry[];
}

export const SideBar = () => {
  return (
    <Stack
      sx={{
        borderWidth: "1px",
        borderLeftStyle: "solid",
        borderTopStyle: "solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: 350,
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
        <DirectMessages />
      </SidebarItem>
    </Stack>
  );
};

const DirectMessagesButton = ({ channelId }: { channelId: string }) => {
  const channel = useChannelStore((state) => state.channels[channelId]);
  const memberIds = useChannelStore(
    (state) => state.channelMemberIds[channelId],
  );
  const membership = useAuthStore(
    (state) => state.channelMemberships[channelId],
  );

  const peerIds = useMemo(() => {
    if (!memberIds || !membership) return [];
    return memberIds.filter((id) => id !== membership.userId);
  }, [memberIds, membership]);

  const users = useUserStore((state) => state.users);
  const userPresences = useUserStore((state) => state.userPresences);

  const members = useMemo<ChannelMemberEntry[]>(() => {
    const result: ChannelMemberEntry[] = [];
    for (const peerId of peerIds) {
      const user = users[peerId];
      if (user) {
        result.push({
          user,
          presence: userPresences[peerId] ?? presences.offline,
        });
      }
    }
    return result;
  }, [peerIds, users, userPresences]);

  if (!channel || !membership) return null;

  const dmMember = members[0];
  if (!dmMember) return null;

  return (
    <Button
      component={Link}
      to={`${paths.me}/${channel.id}`}
      sx={{ justifyContent: "start" }}
    >
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        <Avatar
          username={dmMember.user.username}
          bgColor={dmMember.user.bannerColor}
          presence={dmMember.presence}
        />
        <Stack>
          <Typography sx={{ fontWeight: 500 }}>
            {dmMember.user.displayName}
          </Typography>
        </Stack>
      </Stack>
    </Button>
  );
};

const SearchButton = () => {
  return (
    <Button variant="contained" size="small">
      {labels.findOrStart}
    </Button>
  );
};

const DirectMessagesHeader = ({
  hasSidebarIds,
}: {
  hasSidebarIds: boolean;
}) => {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {labels.directMessages}
      </Typography>
      {hasSidebarIds && (
        <Tooltip placement="top" title={labels.createMessage}>
          <IconButton>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

const DirectMessages = () => {
  const sidebarIds = useAuthStore((state) => state.sidebarIds);

  const validChannelIds = useChannelStore(
    useShallow((state) =>
      sidebarIds.filter((id) => Boolean(state.channels[id])),
    ),
  );

  const hasSidebarIds = sidebarIds.length > 0;
  const hasMatchingChannels = validChannelIds.length > 0;

  return (
    <Stack sx={{ gap: (t) => t.tokens.spacing.tight }}>
      <DirectMessagesHeader hasSidebarIds={hasSidebarIds} />
      {!hasSidebarIds || !hasMatchingChannels ? (
        <Alert severity="info" sx={{ mt: 1 }}>
          {labels.addFriendsToChat}
        </Alert>
      ) : (
        validChannelIds.map((channelId) => (
          <DirectMessagesButton key={channelId} channelId={channelId} />
        ))
      )}
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
