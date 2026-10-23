import { useEffect } from "react";
import { useStore } from "./store";
import { logger as baseLogger } from "@/lib";

const logger = baseLogger.child({
  package: "Gateway",
  module: "useGateway",
});

const LEADER_LOCK_NAME = "bonfire_gateway_leader_lock";

export function useGateway() {
  const init = useStore((state) => state.init);
  const close = useStore((state) => state.close);

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
