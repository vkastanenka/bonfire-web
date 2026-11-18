import { type Presence } from "@/bonfire-sdk";
import { useAuthStore } from "@/features/auth";
import { usePresenceStore } from "@/features/presence";
import { resolveEffectivePresence } from "@/features/user";

export * from "./api";

export const useEffectivePresence = (): Presence => {
  const activePresence = usePresenceStore((state) => state.presence);
  const me = useAuthStore((state) => state.me);
  return resolveEffectivePresence(activePresence, me);
};
