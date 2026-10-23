import { useEffect } from "react";
import { useGatewayStore } from "./store";
import { gatewayBroadcaster, BroadcastType } from "./broadcaster";
import { GatewayStatus, type GatewayMessage } from "./service";
import { Presence } from "./presence";
import { logger } from "@/lib";
import { gatewayDispatcher } from "./dispatcher";

const LEADER_LOCK_NAME = "bonfire_gateway_leader_lock";

export function useGateway() {
  const init = useGatewayStore((state) => state.init);
  const close = useGatewayStore((state) => state.close);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // -----------------------------------------------------------------
    // 1. FOLLOWER SETUP: Listen for broadcasts from the Leader tab
    // -----------------------------------------------------------------
    const unsubscribeBroadcast = gatewayBroadcaster.subscribe(
      (type, payload) => {
        switch (type) {
          case BroadcastType.gatewayStatusChange:
            // [Leader Tab Pattern]: Synchronize connection status on follower tabs
            useGatewayStore.setState({ status: payload as GatewayStatus });
            break;

          case BroadcastType.gatewayEvent: {
            // [Leader Tab Pattern]: Dispatch broadcasted events to follower tab message listeners
            const message = payload as GatewayMessage;
            gatewayDispatcher.dispatch(message.t, message.d);
            break;
          }

          case BroadcastType.presenceSync:
            // [Leader Tab Pattern]: Synchronize presence state across follower tabs
            useGatewayStore.setState({ presence: payload as Presence });
            break;
        }
      },
    );

    // -----------------------------------------------------------------
    // 2. LEADER ELECTION LOOP (Web Locks API)
    // -----------------------------------------------------------------
    const acquireLeadershipLoop = async () => {
      if (typeof navigator === "undefined" || !navigator.locks) {
        logger.warn(
          "[Gateway] Web Locks API unavailable. Falling back to standard connection.",
        );
        if (isMounted) init();
        return;
      }

      while (isMounted && !abortController.signal.aborted) {
        try {
          await navigator.locks.request(
            LEADER_LOCK_NAME,
            { mode: "exclusive" },
            async () => {
              if (!isMounted || abortController.signal.aborted) return;

              logger.info(
                "[Gateway] Tab elected as LEADER. Initializing WebSocket...",
              );
              init(); // Active Leader opens the WebSocket connection

              // Broadcast current status to followers upon becoming leader
              const currentStatus = useGatewayStore.getState().status;
              gatewayBroadcaster.post(
                BroadcastType.gatewayStatusChange,
                currentStatus,
              );

              // Hold the lock until tab becomes hidden, unmounts, or closes
              return new Promise<void>((resolve) => {
                const handleVisibilityChange = () => {
                  if (document.visibilityState === "hidden") {
                    logger.info(
                      "[Gateway] Leader tab hidden. Yielding lock...",
                    );
                    resolve();
                  }
                };

                document.addEventListener(
                  "visibilitychange",
                  handleVisibilityChange,
                );

                abortController.signal.addEventListener(
                  "abort",
                  () => {
                    document.removeEventListener(
                      "visibilitychange",
                      handleVisibilityChange,
                    );
                    resolve();
                  },
                  { once: true },
                );
              });
            },
          );
        } catch (err) {
          logger.error("[Gateway] Leader lock acquisition error:", { err });
        }

        // Stepped down or yielded lock -> Close active socket on this tab
        close();

        // If tab is still visible, retry acquiring lock; otherwise wait for focus
        if (isMounted && document.visibilityState === "visible") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else if (isMounted) {
          await new Promise<void>((resolve) => {
            const handleFocus = () => {
              if (document.visibilityState === "visible") {
                document.removeEventListener("visibilitychange", handleFocus);
                resolve();
              }
            };
            document.addEventListener("visibilitychange", handleFocus);
          });
        }
      }
    };

    acquireLeadershipLoop();

    // -----------------------------------------------------------------
    // 3. CLEANUP
    // -----------------------------------------------------------------
    return () => {
      isMounted = false;
      abortController.abort();
      unsubscribeBroadcast();
      close();
    };
  }, [init, close]);
}
