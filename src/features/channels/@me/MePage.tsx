import { useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Stack,
  Tooltip,
  Typography,
  IconButton,
} from "@mui/material";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Avatar, Header } from "@/features/components";
import { useUserStore } from "@/features/user";
import {
  useAcceptFriendRequest,
  useDeleteRelation,
  useRelationStore,
  useSendFriendRequest,
} from "@/features/relation";
import {
  presences,
  sendFriendRequestSchema,
  type Presence,
  type SendFriendRequest,
  type User,
} from "@/bonfire-sdk";
import { Form } from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleAipFieldViolations } from "@/utils";
import { toast } from "@/toast";

const labels = {
  friends: "Friends",
  online: "Online",
  pending: "Pending",
  all: "All",
  addFriend: "Add Friend",
  allFriends: "All friends",
  received: "Received",
  sent: "Sent",
  accept: "Accept",
  ignore: "Ignore",
  cancel: "Cancel",
  youCanAdd: "You can add friends with their Bonfire username.",
  enterUsername: "Enter a username",
  sendRequest: "Send friend request",
  sentRequest: (username: string) => `Friend request sent to ${username}!`,
  acceptedIncomingRequest: (username: string) =>
    `Accepted incoming friend request from ${username}!`,
} as const;

const formFields = {
  username: {
    name: "username",
    id: "username-input",
    label: labels.enterUsername,
    required: true,
    autoComplete: "username",
  },
};

const screens = {
  online: "online",
  all: "all",
  pending: "pending",
  add: "add",
} as const;

type Screen = (typeof screens)[keyof typeof screens];

export interface UserPresenceEntry {
  user: User;
  presence: Presence;
}

const isOnlinePresence = (presence: Presence | undefined): boolean => {
  if (!presence) return false;
  return presence !== presences.offline && presence !== presences.invisible;
};

const resolveUsers = (ids: string[], users: Record<string, User>): User[] => {
  const result: User[] = [];
  for (const id of ids) {
    const user = users[id];
    if (user) {
      result.push(user);
    }
  }
  return result;
};

const getPreferredScreen = (
  hasOnlineFriends: boolean,
  hasFriends: boolean,
  hasPending: boolean,
): Screen => {
  if (hasOnlineFriends) return screens.online;
  if (hasFriends) return screens.all;
  if (hasPending) return screens.pending;
  return screens.add;
};

export const MePage = () => {
  const users = useUserStore((state) => state.users);
  const userPresences = useUserStore((state) => state.userPresences);
  const outgoingPendingIds = useRelationStore(
    (state) => state.outgoingPendingIds,
  );
  const incomingPendingIds = useRelationStore(
    (state) => state.incomingPendingIds,
  );
  const friendIds = useRelationStore((state) => state.friendIds);

  const allFriends = useMemo<UserPresenceEntry[]>(() => {
    const result: UserPresenceEntry[] = [];
    for (const id of friendIds) {
      const user = users[id];
      if (user) {
        result.push({
          user,
          presence: userPresences[id] ?? presences.offline,
        });
      }
    }
    return result;
  }, [friendIds, users, userPresences]);

  const onlineFriends = useMemo<UserPresenceEntry[]>(() => {
    return allFriends.filter((entry) => isOnlinePresence(entry.presence));
  }, [allFriends]);

  const incomingUsers = useMemo(
    () => resolveUsers(incomingPendingIds, users),
    [incomingPendingIds, users],
  );

  const outgoingUsers = useMemo(
    () => resolveUsers(outgoingPendingIds, users),
    [outgoingPendingIds, users],
  );

  const hasFriends = allFriends.length > 0;
  const hasOnlineFriends = onlineFriends.length > 0;
  const hasPending = incomingUsers.length > 0 || outgoingUsers.length > 0;

  const [selectedScreen, setSelectedScreen] = useState<Screen>(() =>
    getPreferredScreen(hasOnlineFriends, hasFriends, hasPending),
  );

  const isScreenAvailable = (candidate: Screen): boolean => {
    if (candidate === screens.online) return hasOnlineFriends;
    if (candidate === screens.all) return hasFriends;
    if (candidate === screens.pending) return hasPending;
    return candidate === screens.add;
  };

  const fallbackScreen = useMemo<Screen>(
    () => getPreferredScreen(hasOnlineFriends, hasFriends, hasPending),
    [hasOnlineFriends, hasFriends, hasPending],
  );

  const activeScreen: Screen = isScreenAvailable(selectedScreen)
    ? selectedScreen
    : fallbackScreen;

  return (
    <Box>
      <Header>
        <Stack direction="row" sx={{ alignItems: "center", gap: 3 }}>
          <PageLabel />
          {hasOnlineFriends && (
            <Button
              size="small"
              onClick={() => setSelectedScreen(screens.online)}
              disabled={activeScreen === screens.online}
            >
              {labels.online}
            </Button>
          )}
          {hasFriends && (
            <Button
              size="small"
              onClick={() => setSelectedScreen(screens.all)}
              disabled={activeScreen === screens.all}
            >
              {labels.all}
            </Button>
          )}
          {hasPending && (
            <Button
              size="small"
              onClick={() => setSelectedScreen(screens.pending)}
              disabled={activeScreen === screens.pending}
            >
              {labels.pending}
            </Button>
          )}
          <Button
            size="small"
            onClick={() => setSelectedScreen(screens.add)}
            disabled={activeScreen === screens.add}
            variant="contained"
          >
            {labels.addFriend}
          </Button>
        </Stack>
      </Header>

      <Box>
        {activeScreen === screens.online && (
          <OnlineScreen friends={onlineFriends} />
        )}
        {activeScreen === screens.all && <AllScreen friends={allFriends} />}
        {activeScreen === screens.pending && (
          <PendingScreen incoming={incomingUsers} outgoing={outgoingUsers} />
        )}
        {activeScreen === screens.add && (
          <AddScreen onRequestSent={() => setSelectedScreen(screens.add)} />
        )}
      </Box>
    </Box>
  );
};

const PageLabel = () => {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: "center", gap: (t) => t.tokens.spacing.tight }}
    >
      <EmojiPeopleIcon />
      <Typography sx={{ fontWeight: 500 }}>{labels.friends}</Typography>
    </Stack>
  );
};

const ScreenTitle = ({
  children,
  relNumber,
}: {
  children: ReactNode;
  relNumber?: number;
}) => {
  const relNumberString = relNumber && relNumber > 0 ? ` — ${relNumber}` : "";
  return (
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {children + relNumberString}
    </Typography>
  );
};

const FriendScreenContainer = ({ children }: { children: ReactNode }) => {
  return <Stack sx={{ p: 2, width: "100%", gap: 2 }}>{children}</Stack>;
};

const OnlineScreen = ({ friends }: { friends: UserPresenceEntry[] }) => {
  return (
    <FriendScreenContainer>
      <ScreenTitle relNumber={friends.length}>{labels.online}</ScreenTitle>
    </FriendScreenContainer>
  );
};

const AllScreen = ({ friends }: { friends: UserPresenceEntry[] }) => {
  return (
    <FriendScreenContainer>
      <ScreenTitle relNumber={friends.length}>{labels.allFriends}</ScreenTitle>
    </FriendScreenContainer>
  );
};

const PendingScreen = ({
  incoming,
  outgoing,
}: {
  incoming: User[];
  outgoing: User[];
}) => {
  return (
    <FriendScreenContainer>
      {incoming.length > 0 && (
        <Stack sx={{ gap: 1 }}>
          <ScreenTitle relNumber={incoming.length}>
            {labels.received}
          </ScreenTitle>
          <Stack>
            {incoming.map((user) => (
              <FriendRequest
                key={`incoming-friend-request-${user.username}`}
                isIncoming
                user={user}
              />
            ))}
          </Stack>
        </Stack>
      )}
      {outgoing.length > 0 && (
        <Stack sx={{ gap: 1 }}>
          <ScreenTitle relNumber={outgoing.length}>{labels.sent}</ScreenTitle>
          <Stack>
            {outgoing.map((user) => (
              <FriendRequest
                key={`outgoing-friend-request-${user.username}`}
                user={user}
              />
            ))}
          </Stack>
        </Stack>
      )}
    </FriendScreenContainer>
  );
};

const FriendRequest = ({
  user,
  isIncoming,
  ...props
}: {
  user: User;
  isIncoming?: boolean;
}) => {
  const { mutate: mutateAccept, isPending: acceptIsPending } =
    useAcceptFriendRequest();
  const { mutate: mutateIgnore, isPending: ignoreIsPending } =
    useDeleteRelation();

  const accept = () => {
    mutateAccept(user.id);
  };

  const ignore = () => {
    mutateIgnore(user.id);
  };

  const isPending = acceptIsPending || ignoreIsPending;
  const deleteLabel = isIncoming ? labels.ignore : labels.cancel;

  return (
    <Stack
      direction="row"
      sx={{
        p: 1,
        borderRadius: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        justifyContent: "space-between",
        alignItems: "center",
        transition: (theme) =>
          theme.transitions.create(["background-color", "border-top-color"], {
            duration: theme.transitions.duration.shorter,
          }),
        "&:hover": {
          backgroundColor: "background.paper",
          borderTopColor: "transparent",
        },
      }}
      {...props}
    >
      <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
        <Avatar
          username={user.username}
          bgColor={user.bannerColor}
          size="sm"
        ></Avatar>
        <Stack>
          <Typography sx={{ fontWeight: "500" }}>{user.displayName}</Typography>
          <Typography variant="caption">{user.username}</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
        {isIncoming && (
          <Tooltip arrow placement="top" title={labels.accept}>
            <IconButton
              onClick={accept}
              disabled={isPending}
              sx={{
                "&:hover *": {
                  color: "success.main",
                },
              }}
            >
              <CheckIcon aria-label={labels.accept} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip arrow placement="top" title={deleteLabel}>
          <IconButton
            onClick={ignore}
            disabled={isPending}
            sx={{
              "&:hover *": {
                color: "error.main",
              },
            }}
          >
            <CloseIcon aria-label={deleteLabel} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

const AddScreen = ({ onRequestSent }: { onRequestSent: () => void }) => {
  const { methods, onSubmit, isPending } =
    useSendFriendRequestForm(onRequestSent);

  return (
    <Stack sx={{ p: 2, gap: 2 }}>
      <Stack>
        <Typography variant="h6">{labels.addFriend}</Typography>
        <Typography sx={{ fontWeight: 500 }}>{labels.youCanAdd}</Typography>
      </Stack>
      <Form methods={methods} onSubmit={onSubmit} disabled={isPending}>
        <Form.TextField {...formFields.username}></Form.TextField>
        <Form.SubmitButton sx={{ alignSelf: "flex-start" }}>
          {labels.sendRequest}
        </Form.SubmitButton>
      </Form>
    </Stack>
  );
};

const useSendFriendRequestForm = (onRequestSent: () => void) => {
  const methods = useForm<SendFriendRequest>({
    resolver: zodResolver(sendFriendRequestSchema),
    defaultValues: {
      username: "",
    },
  });

  const { mutate, isPending } = useSendFriendRequest();

  const onSubmit = (data: SendFriendRequest) => {
    mutate(data, {
      onSuccess: (response, variables) => {
        onRequestSent();
        methods.reset();

        const { channel, membership } = response;
        const isNewFriend = Boolean(channel && membership);
        const label = isNewFriend
          ? labels.acceptedIncomingRequest
          : labels.sentRequest;

        toast.success(label(response.peerUser?.username ?? variables.username));
      },
      onError: (err) => {
        handleAipFieldViolations(err, methods);
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
