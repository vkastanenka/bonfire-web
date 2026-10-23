import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus, type GatewayMessage } from "./service";
import { Presence, presenceService } from "./presence";
import { BroadcastType, gatewayBroadcaster } from "./broadcaster";

interface GatewayState {
  status: GatewayStatus;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
  sendPresence: () => void;
}

let isInit = false;

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: GatewayStatus.disconnected,
  presence: Presence.online,

  init: () => {
    if (!isInit) {
      gatewayService.subscribeToStatus((status: GatewayStatus) => {
        set({ status });
        // [Leader Tab Pattern]: Broadcast status changes from the leader tab to follower tabs
        gatewayBroadcaster.post(BroadcastType.gatewayStatusChange, status);
      });

      // [Leader Tab Pattern]: Broadcast incoming socket messages from the leader tab to follower tabs
      gatewayService.subscribeToMessages((message: GatewayMessage) => {
        gatewayBroadcaster.post(BroadcastType.gatewayEvent, message);
      });

      presenceService.subscribe((presence: Presence) => {
        const effectivePresence =
          authService.getEffectivePresence() ?? presence;

        if (get().presence !== effectivePresence) {
          set({ presence: effectivePresence });
          get().sendPresence();

          // [Leader Tab Pattern]: Instantly sync presence change to follower tabs
          gatewayBroadcaster.post(
            BroadcastType.presenceSync,
            effectivePresence,
          );
        }
      });

      isInit = true;
    }

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    presenceService.start();
    gatewayService.connect(initialPresence);

    const initialStatus = gatewayService.getStatus();

    set({
      status: initialStatus,
      presence: initialPresence,
    });

    gatewayBroadcaster.post(BroadcastType.gatewayStatusChange, initialStatus);
    gatewayBroadcaster.post(BroadcastType.presenceSync, initialPresence);
  },

  close: () => {
    presenceService.stop();
    set({
      status: GatewayStatus.disconnected,
      presence: Presence.online,
    });
    gatewayService.disconnect();
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },

  sendPresence: () => {
    if (get().status === GatewayStatus.connected) {
      get().send("UPDATE_PRESENCE", { presence: get().presence });
    }
  },
}));

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useGatewayStore.getState().close();
  }
  previousToken = state.accessToken;
});
