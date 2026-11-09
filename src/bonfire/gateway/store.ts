import { create } from "zustand";
import { presences, usePresenceStore, type Presence } from "@/presence";
import { useAuthStore } from "../auth";
import { gatewayService, GatewayStatus, type GatewayMessage } from "./service";
import { getEffectivePresence } from "../user";
import { userMessageTypes } from "../user/gateway";
import { broadcaster, broadcastTypes } from "./broadcaster";
import { dispatcher } from "./dispatcher";

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

    gatewayService.subscribeMessage((message: GatewayMessage) => {
      broadcaster.post(broadcastTypes.message, message);
    });

    gatewayService.subscribeStatus((status: GatewayStatus) => {
      set({ status });
      broadcaster.post(broadcastTypes.status, status);
    });

    const initialPresence = getEffectivePresence();
    gatewayService.connect(initialPresence);
    lastSentPresence = initialPresence;

    presenceUnsubscribe = usePresenceStore.subscribe(() => {
      handlePresenceChange(() => get().status);
    });

    const currentStatus = gatewayService.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },

  close: () => {
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
      presenceUnsubscribe = null;
    }
    gatewayService.disconnect();
    const currentStatus = gatewayService.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },

  setLastSentPresence: (presence) => {
    lastSentPresence = presence;
  },
}));

broadcaster.subscribe((type, payload) => {
  switch (type) {
    case broadcastTypes.message: {
      const message = payload as GatewayMessage;
      dispatcher.dispatch(message.t, message.d);
      break;
    }

    case broadcastTypes.presence:
      usePresenceStore.setState({ presence: payload as Presence });
      break;

    case broadcastTypes.status:
      useGatewayStore.setState({ status: payload as GatewayStatus });
      break;
  }
});

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useGatewayStore.getState().close();
  }
  previousToken = state.accessToken;
});

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
    gatewayService.send(userMessageTypes.presenceUpdated, {
      userId: me.id,
      presence: currentPresence,
    });
    broadcaster.post(broadcastTypes.presence, currentPresence);
  }
};
