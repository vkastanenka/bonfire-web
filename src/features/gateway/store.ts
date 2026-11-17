import { create } from "zustand";
import { usePresenceStore, type Presence } from "@/presence";
import { useAuthStore } from "../auth";
import { bonfireSdk } from "@/app";
import {
  gatewayStatuses,
  type GatewayStatus,
  type GatewayMessage,
} from "@/bonfire-sdk";
import { getEffectivePresence } from "../user";
import { userMessageTypes } from "../user/gateway";
import { broadcaster, broadcastTypes } from "./broadcaster";

interface GatewayState {
  status: GatewayStatus;
  init: () => void;
  close: () => void;
}

let presenceUnsubscribe: (() => void) | null = null;
let lastSentPresence: Presence | null = null;

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: gatewayStatuses.disconnected,

  init: () => {
    get().close();

    bonfireSdk.gateway.subscribeStatus((status: GatewayStatus) => {
      set({ status });
      broadcaster.post(broadcastTypes.status, status);
    });

    bonfireSdk.gateway.subscribeMessage((message: GatewayMessage) => {
      broadcaster.post(broadcastTypes.message, message);
    });

    const initialPresence = getEffectivePresence();
    bonfireSdk.gateway.connect(initialPresence);
    lastSentPresence = initialPresence;

    presenceUnsubscribe = usePresenceStore.subscribe(() => {
      handlePresenceChange(() => get().status);
    });

    const currentStatus = bonfireSdk.gateway.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },

  close: () => {
    // if (presenceUnsubscribe) {
    //   presenceUnsubscribe();
    //   presenceUnsubscribe = null;
    // }
    bonfireSdk.gateway.disconnect();
    const currentStatus = bonfireSdk.gateway.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },
}));

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useGatewayStore.getState().close();
  }
  previousToken = state.accessToken;
});

const handlePresenceChange = (getStatus: () => GatewayStatus) => {
  const me = useAuthStore.getState().me;
  if (!me) return;

  const currentPresence = getEffectivePresence();
  if (currentPresence === lastSentPresence) return;

  if (
    getStatus() === GatewayStatus.connected &&
    (currentPresence === "ONLINE" || currentPresence === "IDLE")
  ) {
    lastSentPresence = currentPresence;
    sdk.gateway.send(userMessageTypes.presenceUpdated, {
      userId: me.id,
      presence: currentPresence,
    });
    broadcaster.post(broadcastTypes.presence, currentPresence);
  }
};
