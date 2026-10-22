import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus } from "./service";
import { Presence } from "./presence";
// import { gatewayDispatcher } from "./dispatcher";

interface GatewayState {
  status: GatewayStatus;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
  getPresence: () => Presence;
  setPresence: (presence: Presence) => void;
  syncPresence: () => void;
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

      // gatewayDispatcher.initialize();

      isInit = true;
    }

    set({ status: gatewayService.getStatus() });

    gatewayService.connect(get().getPresence());
  },

  close: () => {
    set({
      status: GatewayStatus.disconnected,
      presence: Presence.online,
    });
    gatewayService.disconnect();
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },

  getPresence: () => {
    return authService.getEffectivePresence() ?? get().presence;
  },

  setPresence: (presence) => set({ presence }),

  syncPresence: () => {
    if (get().status === GatewayStatus.connected) {
      gatewayService.send("UPDATE_PRESENCE", {
        presence: get().getPresence(),
      });
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
