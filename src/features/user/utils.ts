import { type Me, type Presence } from "@/bonfire-sdk";
import { useAuthStore } from "@/features/auth";
import { usePresenceStore } from "@/features/presence";

export const getEffectivePresence = (): Presence => {
  const activePresence = usePresenceStore.getState().presence;
  const me = useAuthStore.getState().me;
  return resolveEffectivePresence(activePresence, me);
};

export const resolveEffectivePresence = (
  activePresence: Presence,
  me: Me | null,
): Presence => {
  if (!me?.preferredPresence) return activePresence;

  const { preferredPresence, preferredPresenceUntil } = me;

  if (preferredPresenceUntil && new Date() > new Date(preferredPresenceUntil)) {
    return activePresence;
  }

  return preferredPresence;
};

export const isPreferredPresenceActive = (): boolean => {
  const me = useAuthStore.getState().me;

  if (!me?.preferredPresence) return false;

  const { preferredPresenceUntil } = me;

  if (preferredPresenceUntil && new Date() > new Date(preferredPresenceUntil)) {
    return false;
  }

  return true;
};
