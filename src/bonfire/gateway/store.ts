import { create } from "zustand";
import { authService, useAuthStore } from "../auth";
import { service, Status, type Message } from "./service";
import { Presence, presenceTracker } from "./presence";
import { BroadcastType, broadcaster } from "./broadcaster";

interface State {
  status: Status;
  presence: Presence;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
}

let isInit = false;

export const useStore = create<State>((set, get) => ({
  status: Status.disconnected,
  presence: Presence.online,

  init: () => {
    if (!isInit) {
      service.subscribeStatus((status: Status) => {
        set({ status });
        broadcaster.post(BroadcastType.status, status);
      });

      service.subscribeMessage((message: Message) => {
        broadcaster.post(BroadcastType.message, message);
      });

      presenceTracker.subscribe((presence: Presence) => {
        const effectivePresence =
          authService.getEffectivePresence() ?? presence;

        if (get().presence !== effectivePresence) {
          set({ presence: effectivePresence });
          service.send("UPDATE_PRESENCE", { presence: effectivePresence });
          broadcaster.post(BroadcastType.presence, effectivePresence);
        }
      });

      isInit = true;
    }

    const initialPresence =
      authService.getEffectivePresence() ?? Presence.online;

    presenceTracker.start();
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

let previousToken = useAuthStore.getState().accessToken;

useAuthStore.subscribe((state) => {
  if (previousToken && !state.accessToken) {
    useStore.getState().close();
  }
  previousToken = state.accessToken;
});
