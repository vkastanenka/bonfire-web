import type { Presence } from "../gateway";
import type { PreferredPresence } from "./validation";

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
  presence?: PreferredPresence;
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
