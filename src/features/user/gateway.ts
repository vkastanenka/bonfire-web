import { useEffect } from "react";
import { useNavigate, type UseNavigateResult } from "@tanstack/react-router";
import {
  presences,
  userMessageTypes,
  type DisabledPayload,
  type EmailUpdatedPayload,
  type Me,
  type PreferredPresenceUpdatedPayload,
  type Presence,
  type PresenceUpdatedPayload,
  type ProfileUpdatedPayload,
  type UsernameUpdatedPayload,
} from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { paths } from "@/constants";
import { useAuthStore } from "@/features/auth";
import { usePresenceStore } from "@/features/presence";

export const useUserGatewayEvents = () => {
  const navigate = useNavigate();
  const me = useAuthStore((state) => state.me);
  const setMe = useAuthStore((state) => state.setMe);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setPresence = usePresenceStore((state) => state.set);

  useEffect(() => {
    const unregisterEmailUpdated =
      bonfireSdk.gateway.registerMessageHandler<EmailUpdatedPayload>(
        userMessageTypes.emailUpdated,
        (payload) => handleEmailUpdated(payload, me, setMe),
      );

    const unregisterUsernameUpdated =
      bonfireSdk.gateway.registerMessageHandler<UsernameUpdatedPayload>(
        userMessageTypes.usernameUpdated,
        (payload) => handleUsernameUpdated(payload, me, setMe),
      );

    const unregisterPasswordUpdated = bonfireSdk.gateway.registerMessageHandler(
      userMessageTypes.passwordUpdated,
      () => handlePasswordUpdated(clearSession, navigate),
    );

    const unregisterPreferredPresenceUpdated =
      bonfireSdk.gateway.registerMessageHandler<PreferredPresenceUpdatedPayload>(
        userMessageTypes.preferredPresenceUpdated,
        (payload) =>
          handlePreferredPresenceUpdated(payload, me, setMe, setPresence),
      );

    const unregisterProfileUpdated =
      bonfireSdk.gateway.registerMessageHandler<ProfileUpdatedPayload>(
        userMessageTypes.profileUpdated,
        (payload) => handleProfileUpdated(payload, me, setMe),
      );

    const unregisterDisabled =
      bonfireSdk.gateway.registerMessageHandler<DisabledPayload>(
        userMessageTypes.disabled,
        (payload) => handleDisabled(payload, me, clearSession, navigate),
      );

    const unregisterPresenceUpdated =
      bonfireSdk.gateway.registerMessageHandler<PresenceUpdatedPayload>(
        userMessageTypes.presenceUpdated,
        (payload) => handlePresenceUpdated(payload, me, setPresence),
      );

    return () => {
      unregisterEmailUpdated();
      unregisterUsernameUpdated();
      unregisterPasswordUpdated();
      unregisterPreferredPresenceUpdated();
      unregisterProfileUpdated();
      unregisterDisabled();
      unregisterPresenceUpdated();
    };
  }, [navigate, me, setMe, setPresence, clearSession]);
};

const handleEmailUpdated = (
  payload: EmailUpdatedPayload,
  me: Me | null,
  setMe: (me: Me | null) => void,
) => {
  if (me && me.id === payload.userId) {
    setMe({
      ...me,
      email: payload.email,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleUsernameUpdated = (
  payload: UsernameUpdatedPayload,
  me: Me | null,
  setMe: (me: Me | null) => void,
) => {
  if (me && me.id === payload.userId) {
    setMe({
      ...me,
      username: payload.username,
      updatedAt: payload.updatedAt,
    });
  }
};

const handlePasswordUpdated = (
  clearSession: () => void,
  navigate: UseNavigateResult<string>,
) => {
  clearSession();
  navigate({ to: paths.login });
};

const handlePreferredPresenceUpdated = (
  payload: PreferredPresenceUpdatedPayload,
  me: Me | null,
  setMe: (me: Me | null) => void,
  setPresence: (presence: Presence) => void,
) => {
  if (me && me.id === payload.userId) {
    if (!payload.presence) {
      setPresence(presences.online);
    }
    setMe({
      ...me,
      preferredPresence: payload.presence,
      preferredPresenceUntil: payload.until,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleProfileUpdated = (
  payload: ProfileUpdatedPayload,
  me: Me | null,
  setMe: (me: Me | null) => void,
) => {
  if (me && me.id === payload.userId) {
    setMe({
      ...me,
      displayName: payload.displayName,
      bio: payload.bio,
      avatarUrl: payload.avatarUrl,
      bannerColor: payload.bannerColor,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleDisabled = async (
  payload: DisabledPayload,
  me: Me | null,
  clearSession: () => void,
  navigate: UseNavigateResult<string>,
) => {
  if (me && me.id === payload.userId) {
    clearSession();
    navigate({ to: paths.login });
  }
};

const handlePresenceUpdated = (
  payload: PresenceUpdatedPayload,
  me: Me | null,
  setPresence: (presence: Presence) => void,
) => {
  if (me && me.id === payload.userId) {
    setPresence(payload.presence);
  }
};
