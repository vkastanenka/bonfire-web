import { dispatcher } from "../gateway";
import { useAuthStore } from "../auth";
import { useEffect } from "react";
import { useNavigate, type UseNavigateResult } from "@tanstack/react-router";
import { paths } from "@/constants";

export const authMessageTypes = {
  sessionRevoked: "auth.session_revoked",
  sessionRevokedAll: "auth.session_revoked_all",
} as const;

const handleSessionRevoked = (navigate: UseNavigateResult<string>) => {
  console.log("handleSessionRevoked");
  useAuthStore.getState().clearSession();
  navigate({ to: paths.login });
};

const handleSessionRevokedAll = (navigate: UseNavigateResult<string>) => {
  console.log("handleSessionRevokedAll");
  useAuthStore.getState().clearSession();
  navigate({ to: paths.login });
};

export const useAuthGatewayEvents = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unregisterSessionRevoked = dispatcher.register(
      authMessageTypes.sessionRevoked,
      () => handleSessionRevoked(navigate),
    );

    const unregisterSessionRevokedAll = dispatcher.register(
      authMessageTypes.sessionRevokedAll,
      () => handleSessionRevokedAll(navigate),
    );

    return () => {
      unregisterSessionRevoked();
      unregisterSessionRevokedAll();
    };
  }, [navigate]);
};
