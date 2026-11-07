import { create } from "zustand";
import {
//   type Presence,
//   presences,
//   presenceTracker,
  usePresenceStore,
} from "@/presence";
import { authService, useAuthStore } from "../auth";
import { gatewayService, GatewayStatus, type GatewayMessage } from "./service";
import { BroadcastType, broadcaster } from "./broadcaster";
import { dispatcher } from "./dispatcher";
import { getEffectivePresence } from "../user";

interface State {
  status: GatewayStatus;
  init: () => void;
  close: () => void;
  send: (type: string, data: unknown) => void;
}

let presenceUnsubscribe: (() => void) | null = null;

export const useGatewayStore = create<State>((set, get) => ({
  status: GatewayStatus.disconnected,

  init: () => {
    get().close();

    gatewayService.subscribeStatus((status: GatewayStatus) => {
      set({ status });
    });

    const initialPresence = getEffectivePresence();
    gatewayService.connect(initialPresence);

    presenceUnsubscribe = usePresenceStore.subscribe(() => {
    //   const currentPresence = getEffectivePresence();
    //   if (get().status === GatewayStatus.connected) {
    //     gatewayService.send("UPDATE_PRESENCE", { presence: currentPresence });
    //   }
    });

    set({ status: gatewayService.getStatus() });
  },

  close: () => {
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
      presenceUnsubscribe = null;
    }
    gatewayService.disconnect();
    set({ status: gatewayService.getStatus() });
  },

  send: (type, data) => {
    gatewayService.send(type, data);
  },
}));

// interface State {
//   status: GatewayStatus;
//   init: () => void;
//   close: () => void;
//   send: (type: string, data: unknown) => void;
// }

// export const useGatewayStore = create<State>((set, get) => ({
//   status: GatewayStatus.disconnected,

//   init: () => {
//     get().close();

//     // gatewayService.subscribeMessage((message: GatewayMessage) => {
//     //   broadcaster.post(BroadcastType.message, message);
//     // });

//     gatewayService.subscribeStatus((status: GatewayStatus) => {
//       set({ status });
//       // broadcaster.post(BroadcastType.status, status);
//     });

//     const initialPresence = getEffectivePresence();
//     gatewayService.connect(initialPresence);

//     const initialStatus = gatewayService.getStatus();
//     set({ status: initialStatus });
//   },

//   close: () => {
//     gatewayService.disconnect();
//     set({ status: gatewayService.getStatus() });
//   },

//   send: (type, data) => {
//     gatewayService.send(type, data);
//   },
// }));

// broadcaster.subscribe((type, payload) => {
//   switch (type) {
//     case BroadcastType.message: {
//       const message = payload as GatewayMessage;
//       dispatcher.dispatch(message.t, message.d);
//       break;
//     }

//     case BroadcastType.presence:
//       useGatewayStore.setState({ presence: payload as Presence });
//       break;

//     case BroadcastType.status:
//       useGatewayStore.setState({ status: payload as GatewayStatus });
//       break;
//   }
// });

// let previousToken = useAuthStore.getState().accessToken;

// useAuthStore.subscribe((state) => {
//   if (previousToken && !state.accessToken) {
//     useGatewayStore.getState().close();
//   }
//   previousToken = state.accessToken;
// });

//   init: () => {
//     get().close();

//     // gatewayService.subscribeMessage((message: GatewayMessage) => {
//     //   broadcaster.post(BroadcastType.message, message);
//     // });

//     gatewayService.subscribeStatus((status: GatewayStatus) => {
//       set({ status });
//       // broadcaster.post(BroadcastType.status, status);
//     });

//     const initialPresence = getEffectivePresence();
//     gatewayService.connect(initialPresence);

//     presenceTracker.subscribe((presence: Presence) => {
//       const effectivePresence = authService.getEffectivePresence() ?? presence;

//       if (get().presence !== effectivePresence) {
//         set({ presence: effectivePresence });
//         // gatewayService.send("UPDATE_PRESENCE", { presence: effectivePresence });
//         // broadcaster.post(BroadcastType.presence, effectivePresence);
//       }
//     });

//     // const initialPresence =
//     //   authService.getEffectivePresence() ?? presences.online;

//     // gatewayService.connect(initialPresence);

//     // const initialStatus = gatewayService.getStatus();

//     // set({
//     //   status: initialStatus,
//     //   presence: initialPresence,
//     // });

//     // broadcaster.post(BroadcastType.status, initialStatus);
//     // broadcaster.post(BroadcastType.presence, initialPresence);
//   },
