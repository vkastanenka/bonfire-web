import { useEffect } from "react";
import { useGatewayStore } from "./store";
import { logger } from "@/lib";

export function useGateway() {
  const init = useGatewayStore((state) => state.init);
  const close = useGatewayStore((state) => state.close);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      init();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        logger.info("[Gateway] Tab focused. Synchronizing socket activity...");
        init();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      close();
    };
  }, [init, close]);
}

// const BROADCAST_CHANNEL_NAME = "bonfire_gateway_sync";

// interface BroadcastMessage {
//   type: string;
//   payload: unknown;
// }

// class GatewayBroadcastSync {
//   private channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

//   public post(type: string, payload: unknown): void {
//     this.channel.postMessage({ type, payload });
//   }

//   public subscribe(onMessage: (type: string, payload: unknown) => void): () => void {
//     const handler = (event: MessageEvent<BroadcastMessage>) => {
//       const { type, payload } = event.data;
//       onMessage(type, payload);
//     };

//     this.channel.addEventListener("message", handler);
//     return () => this.channel.removeEventListener("message", handler);
//   }
// }

// export const gatewayBroadcast = new GatewayBroadcastSync();

// import { useEffect } from "react";
// import { useGatewayStore } from "./store";
// import { gatewayBroadcast } from "./sync";
// import { logger } from "@/lib";

// const LOCK_NAME = "bonfire_gateway_leader_lock";

// export function useGateway() {
//   const init = useGatewayStore((state) => state.init);
//   const close = useGatewayStore((state) => state.close);

//   useEffect(() => {
//     let isMounted = true;
//     let abortController = new AbortController();

//     // 1. Subscribe follower tabs to leader broadcasts
//     const unsubscribeBroadcast = gatewayBroadcast.subscribe((type, payload) => {
//       // Handle incoming broadcast events from the active leader tab
//       // e.g., syncing Zustand store state or triggering React Query cache invalidations
//       if (type === "GATEWAY_EVENT") {
//         // Example: dispatch incoming message/event to local store or cache
//       }
//     });

//     // 2. Leader Election loop using Web Locks API
//     const acquireLockAndRun = async () => {
//       while (isMounted && !abortController.signal.aborted) {
//         try {
//           await navigator.locks.request(LOCK_NAME, { mode: "exclusive" }, async (lock) => {
//             if (!isMounted || abortController.signal.aborted) return;

//             logger.info("[Gateway] Tab elected as Leader. Initializing WebSocket connection...");
//             init(); // Opens the single active WebSocket connection

//             // Hold the lock until this tab goes away or loses visibility/focus
//             return new Promise<void>((resolve) => {
//               const handleVisibilityOrUnload = () => {
//                 if (document.visibilityState === "hidden") {
//                   logger.info("[Gateway] Leader tab hidden. Yielding leadership...");
//                   resolve();
//                 }
//               };

//               document.addEventListener("visibilitychange", handleVisibilityOrUnload);

//               // Clean up event listener when lock is released
//               abortController.signal.addEventListener("abort", () => {
//                 document.removeEventListener("visibilitychange", handleVisibilityOrUnload);
//                 resolve();
//               }, { once: true });
//             });
//           });
//         } catch (err) {
//           logger.error("[Gateway] Web Lock error:", err);
//         }

//         // If we lost the lock or yielded, close the socket locally until re-elected
//         close();

//         // Brief backoff before attempting to acquire the lock again if still visible
//         if (isMounted && document.visibilityState === "visible") {
//           await new Promise((r) => setTimeout(r, 1000));
//         } else {
//           // Wait until tab becomes visible again before trying to grab leadership
//           await new Promise<void>((resolve) => {
//             const handleVisible = () => {
//               if (document.visibilityState === "visible") {
//                 document.removeEventListener("visibilitychange", handleVisible);
//                 resolve();
//               }
//             };
//             document.addEventListener("visibilitychange", handleVisible);
//           });
//         }
//       }
//     };

//     acquireLockAndRun();

//     return () => {
//       isMounted = false;
//       abortController.abort();
//       unsubscribeBroadcast();
//       close();
//     };
//   }, [init, close]);
// }
