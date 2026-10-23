import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { service, Status, type Message } from "./service";
import { Presence, presenceTracker } from "./presence";
import { BroadcastType, broadcaster } from "./broadcaster";
import { dispatcher } from "./dispatcher";

interface State {
  status: Status;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
}

export const useStore = create<State>((set, get) => ({
  presence: Presence.online,
  status: Status.disconnected,

  init: () => {
    get().close();

    service.subscribeMessage((message: Message) => {
      broadcaster.post(BroadcastType.message, message);
    });

    service.subscribeStatus((status: Status) => {
      set({ status });
      broadcaster.post(BroadcastType.status, status);
    });

    presenceTracker.subscribe((presence: Presence) => {
      const effectivePresence = authService.getEffectivePresence() ?? presence;

      if (get().presence !== effectivePresence) {
        set({ presence: effectivePresence });
        service.send("UPDATE_PRESENCE", { presence: effectivePresence });
        broadcaster.post(BroadcastType.presence, effectivePresence);
      }
    });

    presenceTracker.start();

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    service.connect(initialPresence);

    const initialStatus = service.getStatus();

    set({
      status: initialStatus,
      presence: initialPresence,
    });

    broadcaster.post(BroadcastType.status, initialStatus);
    broadcaster.post(BroadcastType.presence, initialPresence);
  },

  close: () => {
    presenceTracker.stop();
    service.disconnect();

    set({
      status: service.getStatus(),
      presence: Presence.online,
    });
  },

  send: (type, data) => {
    service.send(type, data);
  },
}));

broadcaster.subscribe((type, payload) => {
  switch (type) {
    case BroadcastType.message: {
      const message = payload as Message;
      dispatcher.dispatch(message.t, message.d);
      break;
    }

    case BroadcastType.presence:
      useStore.setState({ presence: payload as Presence });
      break;

    case BroadcastType.status:
      useStore.setState({ status: payload as Status });
      break;
  }
});

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useStore.getState().close();
  }
  previousToken = state.accessToken;
});
