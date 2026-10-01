// api/gateway/resolver.ts
import { Presence, type Presence as PresenceType } from "../presence";
import { meManager } from "../me"; // Path to your MeManager
import { useGatewayStore } from "./store";

export function resolvePresenceState(): PresenceType {
  const preferred = meManager.get()?.presence;
  const activity = useGatewayStore.getState().activity;

  switch (preferred) {
    case Presence.Busy:
      return Presence.Busy;
    case Presence.Dnd:
      return Presence.Dnd;
    case Presence.Invisible:
      return Presence.Offline;
    default:
      return activity;
  }
}
