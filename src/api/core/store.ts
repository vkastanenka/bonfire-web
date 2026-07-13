import { create } from "zustand";
import { gatewayManager, type GatewayStatus, type Presence } from "./gateway";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAccessToken: () => set({ accessToken: null }),
  clearAuth: () => set({ accessToken: null }),
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string) =>
  useAuthStore.getState().setAccessToken(token);
export const clearAccessToken = () =>
  useAuthStore.getState().clearAccessToken();
export const clearAuth = () => {
  useAuthStore.getState().clearAuth();
  useGatewayStore.getState().terminateGateway();
};

interface GatewayState {
  status: GatewayStatus;
  initializeGateway: (initialPresence?: Presence) => void;
  terminateGateway: () => void;
  sendEvent: (type: string, data: unknown) => void;
  updatePresence: (status: Presence) => void;
}

export const useGatewayStore = create<GatewayState>((set) => {
  // Bind store state directly onto the central singleton observer engine
  gatewayManager.subscribeToStatus((status) => {
    set({ status });
  });

  gatewayManager.subscribeToMessages((message) => {
    switch (message.t) {
      case "PRESENCE_UPDATE":
        // useUserStore.getState().handlePresenceEvent(message.d);
        break;
      case "MESSAGE_CREATE":
        // useChannelStore.getState().handleNewMessage(message.d);
        break;
      default:
        console.debug(
          `[Gateway State Router] Unhandled transmission type [${message.t}]`,
        );
    }
  });

  return {
    status: gatewayManager.getStatus(),

    initializeGateway: (initialPresence = "online") => {
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
  };
});
