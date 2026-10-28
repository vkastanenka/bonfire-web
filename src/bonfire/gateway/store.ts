import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus, type GatewayMessage } from "./service";
import { Presence, presenceTracker } from "./presence";
import { BroadcastType, broadcaster } from "./broadcaster";
import { dispatcher } from "./dispatcher";

interface State {
  status: GatewayStatus;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
}

export const useGatewayStore = create<State>((set, get) => ({
  presence: Presence.online,
  status: GatewayStatus.disconnected,

  init: () => {
    get().close();

    gatewayService.subscribeMessage((message: GatewayMessage) => {
      broadcaster.post(BroadcastType.message, message);
    });

    gatewayService.subscribeStatus((status: GatewayStatus) => {
      set({ status });
      broadcaster.post(BroadcastType.status, status);
    });

    presenceTracker.subscribe((presence: Presence) => {
      const effectivePresence = authService.getEffectivePresence() ?? presence;

      if (get().presence !== effectivePresence) {
        set({ presence: effectivePresence });
        gatewayService.send("UPDATE_PRESENCE", { presence: effectivePresence });
        broadcaster.post(BroadcastType.presence, effectivePresence);
      }
    });

    presenceTracker.start();

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    gatewayService.connect(initialPresence);

    const initialStatus = gatewayService.getStatus();

    set({
      status: initialStatus,
      presence: initialPresence,
    });

    broadcaster.post(BroadcastType.status, initialStatus);
    broadcaster.post(BroadcastType.presence, initialPresence);
  },

  close: () => {
    presenceTracker.stop();
    gatewayService.disconnect();

    set({
      status: gatewayService.getStatus(),
      presence: Presence.online,
    });
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },
}));

broadcaster.subscribe((type, payload) => {
  switch (type) {
    case BroadcastType.message: {
      const message = payload as GatewayMessage;
      dispatcher.dispatch(message.t, message.d);
      break;
    }

    case BroadcastType.presence:
      useGatewayStore.setState({ presence: payload as Presence });
      break;

    case BroadcastType.status:
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
