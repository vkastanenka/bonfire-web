import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { bonfireSdk, queryClient } from "@/app";
import type { GatewayMessage, GatewayStatus } from "@/bonfire-sdk";
import { logger as baseLogger } from "@/logger";
import { paths } from "@/constants";
import { useAuthStore } from "@/features/auth";
import { broadcaster, broadcastTypes } from "./broadcaster";
import { useGatewayStore } from "./store";

const logger = baseLogger.child({
  package: "Gateway",
  module: "useGateway",
});

const leaderLockName = "bonfire_leader_lock";

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
            leaderLockName,
            { mode: "exclusive" },
            async () => {
              if (!isMounted || abortController.signal.aborted) return;

              logger.info("Tab elected as LEADER. Initializing WebSocket...");
              init();

              await waitForVisibilityHidden(abortController.signal);
              logger.info("Leader tab hidden or aborted. Yielding lock...");
            },
          );
        } catch (err) {
          logger.error("Leader lock acquisition error.", { err });
        }

        close();

        if (!isMounted) break;

        if (document.visibilityState === "visible") {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          await waitForVisibilityVisible();
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

const waitForVisibilityHidden = (signal: AbortSignal): Promise<void> => {
  return new Promise((resolve) => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        resolve();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    signal.addEventListener(
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
};

const waitForVisibilityVisible = (): Promise<void> => {
  return new Promise((resolve) => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", handleFocus);
        resolve();
      }
    };
    document.addEventListener("visibilitychange", handleFocus);
  });
};

export const useBroadcaster = () => {
  const navigate = useNavigate();

  useEffect(() => {
    return broadcaster.subscribe((type, payload) => {
      switch (type) {
        case broadcastTypes.message:
          bonfireSdk.gateway.handleMessage(payload as GatewayMessage);
          break;

        case broadcastTypes.status:
          useGatewayStore.setState({ status: payload as GatewayStatus });
          break;

        case broadcastTypes.sessionRevoked:
          queryClient.clear();
          useAuthStore.getState().clearSession();
          navigate({ to: paths.login });
          break;
      }
    });
  }, [navigate]);
};
