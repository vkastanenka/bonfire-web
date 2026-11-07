import { create } from "zustand";
import { presences, usePresenceStore, type Presence } from "@/presence";
import { useAuthStore } from "../auth";
import { gatewayService, GatewayStatus } from "./service";
import { getEffectivePresence } from "../user";
import { userMessageTypes } from "../user/gateway";

interface State {
  status: GatewayStatus;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
  setLastSentPresence: (presence: Presence) => void;
}

export const useGatewayStore = create<State>((set, get) => ({
  status: GatewayStatus.disconnected,

  init: () => {
    get().close();

    gatewayService.subscribeStatus((status: GatewayStatus) => {
      set({ status });
    });

    const initialPresence = getEffectivePresence();
    gatewayService.connect(initialPresence);

    lastSentPresence = initialPresence;

    presenceUnsubscribe = usePresenceStore.subscribe(() => {
      handlePresenceChange(() => get().status);
    });

    set({ status: gatewayService.getStatus() });
  },

  close: () => {
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
      presenceUnsubscribe = null;
    }
    gatewayService.disconnect();
    set({ status: gatewayService.getStatus() });
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },

  setLastSentPresence: (presence) => {
    lastSentPresence = presence;
  },
}));

let presenceUnsubscribe: (() => void) | null = null;
let lastSentPresence: Presence | null = null;

const handlePresenceChange = (getStatus: () => GatewayStatus) => {
  const me = useAuthStore.getState().me;

  if (!me) return;

  const preferredPresence = me.preferredPresence;
  const preferredPresenceUntil = me.preferredPresenceUntil;

  let hasActiveOverride = false;
  if (preferredPresence) {
    if (preferredPresenceUntil) {
      const isExpired = new Date() > new Date(preferredPresenceUntil);
      hasActiveOverride = !isExpired;
    } else {
      hasActiveOverride = true;
    }
  }

  if (hasActiveOverride) return;

  const currentPresence = getEffectivePresence();

  if (currentPresence === lastSentPresence) return;

  if (
    getStatus() === GatewayStatus.connected &&
    (currentPresence === presences.online || currentPresence === presences.idle)
  ) {
    lastSentPresence = currentPresence;
    console.log("Sent presence to gateway:", lastSentPresence);
    gatewayService.send(userMessageTypes.presenceUpdated, {
      userId: me.id,
      presence: currentPresence,
    });
  }
};
