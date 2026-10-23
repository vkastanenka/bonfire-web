import { useEffect } from "react";
import { useStore } from "./store";
import { broadcaster, BroadcastType } from "./broadcaster";
import { Status, type Message } from "./service";
import { Presence } from "./presence";
import { logger } from "@/lib";
import { dispatcher } from "./dispatcher";

const LEADER_LOCK_NAME = "bonfire_gateway_leader_lock";

export function useGateway() {
  const init = useStore((state) => state.init);
  const close = useStore((state) => state.close);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // -----------------------------------------------------------------
    // 1. FOLLOWER SETUP: Listen for broadcasts from the Leader tab
    // -----------------------------------------------------------------
    const unsubscribeBroadcast = broadcaster.subscribe((type, payload) => {
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
              const currentStatus = useStore.getState().status;
              broadcaster.post(BroadcastType.status, currentStatus);

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
