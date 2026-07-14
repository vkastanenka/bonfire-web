import { create } from "zustand";
import { gatewayManager, type GatewayStatus, type Presence } from "./manager";
import { useTokenStore } from "../auth/tokens";

interface GatewayState {
  status: GatewayStatus;
  initializeGateway: (initialPresence?: Presence) => void;
  terminateGateway: () => void;
  sendEvent: (type: string, data: unknown) => void;
  updatePresence: (presence: Presence) => void;
}

let listenersAttached = false;

export const useGatewayStore = create<GatewayState>((set) => ({
  status: "DISCONNECTED",

  initializeGateway: (initialPresence = "online") => {
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
    gatewayManager.setPresence(initialPresence);
    gatewayManager.connect();
  },

  terminateGateway: () => {
    gatewayManager.disconnect();
  },

  sendEvent: (type, data) => {
    gatewayManager.send(type, data);
  },

  updatePresence: (presence) => {
    gatewayManager.setPresence(presence);
    gatewayManager.send("UPDATE_PRESENCE", { presence });
  },
}));

useTokenStore.subscribe((state) => {
  if (!state.accessToken) {
    gatewayManager.disconnect();
  }
});
