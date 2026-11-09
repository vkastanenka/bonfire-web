import { useEffect } from "react";
import { useGatewayStore } from "./store";
import { logger as baseLogger } from "@/logger";
import { broadcaster, broadcastTypes } from "./broadcaster";
import type { GatewayMessage, GatewayStatus } from "./service";
import { usePresenceStore, type Presence } from "@/presence";
import { dispatcher } from "./dispatcher";
import { useAuthStore } from "../auth";
import { paths } from "@/constants";
import { useNavigate } from "@tanstack/react-router";

const logger = baseLogger.child({
  package: "Gateway",
  module: "useGateway",
});

const LEADER_LOCK_NAME = "bonfire_gateway_leader_lock";

export function useGateway() {
  const init = useGatewayStore((state) => state.init);
  const close = useGatewayStore((state) => state.close);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const acquireLeadershipLoop = async () => {
      if (typeof navigator === "undefined" || !navigator.locks) {
        if (isMounted) {
          logger.warn(
            "Web Locks API unavailable. Falling back to standard connection.",
          );
          init();
        }
        return;
      }

      while (isMounted && !abortController.signal.aborted) {
        try {
          await navigator.locks.request(
            LEADER_LOCK_NAME,
            { mode: "exclusive" },
            async () => {
              if (!isMounted || abortController.signal.aborted) return;

              logger.info("Tab elected as LEADER. Initializing WebSocket...");
              init();

              return new Promise<void>((resolve) => {
                const handleVisibilityChange = () => {
                  if (document.visibilityState === "hidden") {
                    logger.info("Leader tab hidden. Yielding lock...");
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
          logger.error("Leader lock acquisition error.", { err });
        }

        close();

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

    return () => {
      isMounted = false;
      abortController.abort();
      close();
    };
  }, [init, close]);
}

export const useBroadcaster = () => {
  const navigate = useNavigate();

  useEffect(() => {
    return broadcaster.subscribe((type, payload) => {
      switch (type) {
        case broadcastTypes.message: {
          const message = payload as GatewayMessage;
          dispatcher.dispatch(message.t, message.d);
          break;
        }

        case broadcastTypes.presence:
          usePresenceStore.setState({ presence: payload as Presence });
          break;

        case broadcastTypes.status:
          useGatewayStore.setState({ status: payload as GatewayStatus });
          break;

        case broadcastTypes.logout:
          useAuthStore.getState().clearSession();
          navigate({ to: paths.login });
      }
    });
  }, [navigate]);
};
