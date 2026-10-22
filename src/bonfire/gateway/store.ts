import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus } from "./service";
import { Presence, presenceService } from "./presence";

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
      });

      presenceService.subscribe((presence: Presence) => {
        const effectivePresence =
          authService.getEffectivePresence() ?? presence;

        if (get().presence !== effectivePresence) {
          set({ presence: effectivePresence });
          get().sendPresence();
        }
      });

      presenceService.start();
      isInit = true;
    }

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    set({
      status: gatewayService.getStatus(),
      presence: initialPresence,
    });

    gatewayService.connect(initialPresence);
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
