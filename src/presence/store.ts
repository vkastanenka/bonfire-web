import { create } from "zustand";
import { type Presence, presences } from "./presence";
import { presenceTracker } from "./tracker";

let unsubscribeFn: (() => void) | null = null;

interface PresenceState {
  presence: Presence;
  init: () => void;
  close: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presence: presences.online,

  init: () => {
    if (unsubscribeFn) return;

    unsubscribeFn = presenceTracker.subscribe((presence: Presence) => {
      set({ presence });
    });

    presenceTracker.start();
  },

  close: () => {
    if (unsubscribeFn) {
      unsubscribeFn();
      unsubscribeFn = null;
    }
    presenceTracker.stop();
    set({ presence: presences.online });
  },
}));
