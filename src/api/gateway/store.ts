// api/gateway/store.ts
import { create } from "zustand";
import { useTokenStore } from "../auth";
import { Presence, type Activity } from "../presence";
import { gatewayManager, type GatewayStatus } from "./manager";

interface GatewayState {
  status: GatewayStatus;
  activity: Activity;
  initializeGateway: () => void;
  terminateGateway: () => void;
  sendEvent: (type: string, data: unknown) => void;
  setActivity: (activity: Activity) => void;
}

let listenersAttached = false;

export const useGatewayStore = create<GatewayState>((set) => ({
  status: "DISCONNECTED",
  activity: Presence.Online,

  setActivity: (activity) => set({ activity }),

  initializeGateway: () => {
    if (!listenersAttached) {
      gatewayManager.subscribeToStatus((status) => {
        set({ status });
      });

      gatewayManager.subscribeToMessages((message) => {
        switch (message.t) {
          case "PRESENCE_UPDATE":
            break;
          case "MESSAGE_CREATE":
            break;
          default:
            console.debug(
              `[Gateway Router] Unhandled transmission [${message.t}]`,
            );
        }
      });

      listenersAttached = true;
    }

    set({ status: gatewayManager.getStatus() });
    gatewayManager.connect();
  },

  terminateGateway: () => {
    gatewayManager.disconnect();
  },

  sendEvent: (type, data) => {
    gatewayManager.send(type, data);
  },
}));

useTokenStore.subscribe((state) => {
  if (!state.accessToken) {
    gatewayManager.disconnect();
  }
});
