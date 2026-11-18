import { create, type StoreApi } from "zustand";
import { bonfireSdk } from "@/app";
import {
  userMessageTypes,
  gatewayStatuses,
  type GatewayStatus,
  type GatewayMessage,
  type Presence,
} from "@/bonfire-sdk";
import { useAuthStore } from "@/features/auth";
import { usePresenceStore } from "@/features/presence";
import {
  getEffectivePresence,
  isPreferredPresenceActive,
} from "@/features/user";
import { broadcaster, broadcastTypes } from "./broadcaster";

interface GatewayState {
  status: GatewayStatus;
  presence: Presence;
  init: () => void;
  close: () => void;
}

let presenceUnsubscribe: (() => void) | null = null;

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: gatewayStatuses.disconnected,
  presence: getEffectivePresence(),

  init: () => {
    get().close();

    bonfireSdk.gateway.subscribeStatus((status: GatewayStatus) => {
      set({ status });
      broadcaster.post(broadcastTypes.status, status);
    });

    bonfireSdk.gateway.subscribeMessage((message: GatewayMessage) => {
      broadcaster.post(broadcastTypes.message, message);
    });

    bonfireSdk.gateway.connect(get().presence);
    presenceUnsubscribe = setupPresenceSync(set, get);

    const currentStatus = bonfireSdk.gateway.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },

  close: () => {
    if (presenceUnsubscribe) {
      presenceUnsubscribe();
      presenceUnsubscribe = null;
    }

    bonfireSdk.gateway.disconnect();

    const currentStatus = bonfireSdk.gateway.getStatus();
    set({ status: currentStatus });
    broadcaster.post(broadcastTypes.status, currentStatus);
  },
}));

const setupPresenceSync = (
  set: StoreApi<GatewayState>["setState"],
  get: StoreApi<GatewayState>["getState"],
) => {
  return usePresenceStore.subscribe(() => {
    const { status, presence } = get();
    const { me } = useAuthStore.getState();
    if (
      !me ||
      isPreferredPresenceActive() ||
      status !== gatewayStatuses.connected
    ) {
      return;
    }

    const effectivePresence = getEffectivePresence();

    if (presence !== effectivePresence) {
      const message: GatewayMessage = {
        t: userMessageTypes.presenceUpdated,
        d: {
          userId: me.id,
          presence: effectivePresence,
        },
      };

      set({ presence: effectivePresence });
      bonfireSdk.gateway.send(message);
      broadcaster.post(broadcastTypes.message, message);
    }
  });
};
