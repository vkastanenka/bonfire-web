import { dispatcher, useGatewayStore } from "../gateway";
import { useAuthStore } from "../auth";
import { useEffect } from "react";
import { presences, usePresenceStore, type Presence } from "@/presence";
import { useNavigate, type UseNavigateResult } from "@tanstack/react-router";
import { paths } from "@/constants";

export const userMessageTypes = {
  emailUpdates: "user.email_updated",
  usernameUpdated: "user.username_updated",
  passwordUpdated: "user.password_updated",
  preferredPresenceUpdated: "user.preferred_presence_updated",
  profileUpdated: "user.profile_updated",
  disabled: "user.disabled",
  presenceUpdated: "user.presence_updated",
} as const;

export interface EmailUpdatedPayload {
  userId: string;
  email: string;
  updatedAt: Date;
}

export interface UsernameUpdatedPayload {
  userId: string;
  username: string;
  updatedAt: Date;
}

export interface PreferredPresenceUpdatedPayload {
  userId: string;
  presence?: "IDLE" | "DND" | "INVISIBLE";
  until?: Date;
  updatedAt: Date;
}

export interface ProfileUpdatedPayload {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerColor?: string;
  updatedAt: Date;
}

export interface DisabledPayload {
  userId: string;
  updatedAt: Date;
}

export interface PresenceUpdatedPayload {
  userId: string;
  presence: Presence;
}

const handleEmailUpdated = (payload: EmailUpdatedPayload) => {
  const currentMe = useAuthStore.getState().me;

  if (currentMe && currentMe.id === payload.userId) {
    useAuthStore.getState().setMe({
      ...currentMe,
      email: payload.email,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleUsernameUpdated = (payload: UsernameUpdatedPayload) => {
  const currentMe = useAuthStore.getState().me;

  if (currentMe && currentMe.id === payload.userId) {
    useAuthStore.getState().setMe({
      ...currentMe,
      username: payload.username,
      updatedAt: payload.updatedAt,
    });
  }
};

const handlePasswordUpdated = (navigate: UseNavigateResult<string>) => {
  useAuthStore.getState().clearSession();
  navigate({ to: paths.login });
};

const handlePreferredPresenceUpdated = (
  payload: PreferredPresenceUpdatedPayload,
) => {
  const currentMe = useAuthStore.getState().me;

  if (currentMe && currentMe.id === payload.userId) {
    if (!payload.presence) {
      usePresenceStore.setState({ presence: presences.online });
    }
    useAuthStore.getState().setMe({
      ...currentMe,
      preferredPresence: payload.presence,
      preferredPresenceUntil: payload.until,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleProfileUpdated = (payload: ProfileUpdatedPayload) => {
  const currentMe = useAuthStore.getState().me;

  if (currentMe && currentMe.id === payload.userId) {
    useAuthStore.getState().setMe({
      ...currentMe,
      displayName: payload.displayName,
      bio: payload.bio,
      avatarUrl: payload.avatarUrl,
      bannerColor: payload.bannerColor,
      updatedAt: payload.updatedAt,
    });
  }
};

const handleDisabled = (
  payload: DisabledPayload,
  navigate: UseNavigateResult<string>,
) => {
  const currentMe = useAuthStore.getState().me;
  if (currentMe && currentMe.id === payload.userId) {
    useAuthStore.getState().clearSession();
    navigate({ to: paths.login });
  }
};

const handlePresenceUpdated = (payload: PresenceUpdatedPayload) => {
  const currentMe = useAuthStore.getState().me;

  if (currentMe && currentMe.id === payload.userId) {
    useGatewayStore.getState().setLastSentPresence(payload.presence);
    usePresenceStore.setState({ presence: payload.presence });
  }
};

export const useUserGatewayEvents = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const unregisterEmailUpdated = dispatcher.register<EmailUpdatedPayload>(
      userMessageTypes.emailUpdates,
      handleEmailUpdated,
    );

    const unregisterUsernameUpdated =
      dispatcher.register<UsernameUpdatedPayload>(
        userMessageTypes.usernameUpdated,
        handleUsernameUpdated,
      );

    const unregisterPasswordUpdated = dispatcher.register(
      userMessageTypes.passwordUpdated,
      () => handlePasswordUpdated(navigate),
    );

    const unregisterPreferredPresenceUpdated =
      dispatcher.register<PreferredPresenceUpdatedPayload>(
        userMessageTypes.preferredPresenceUpdated,
        handlePreferredPresenceUpdated,
      );

    const unregisterProfileUpdated = dispatcher.register<ProfileUpdatedPayload>(
      userMessageTypes.profileUpdated,
      handleProfileUpdated,
    );

    const unregisterDisabled = dispatcher.register<DisabledPayload>(
      userMessageTypes.disabled,
      (payload) => handleDisabled(payload, navigate),
    );

    const unregisterPresenceUpdated =
      dispatcher.register<PresenceUpdatedPayload>(
        userMessageTypes.presenceUpdated,
        handlePresenceUpdated,
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
  }, [navigate]);
};
