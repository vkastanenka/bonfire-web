import { useEffect } from "react";
import { useNavigate, type UseNavigateResult } from "@tanstack/react-router";
import { authMessageTypes } from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { paths } from "@/constants";
import { useAuthStore } from "../store";

const handleSessionRevoked = (
  clearSession: () => void,
  navigate: UseNavigateResult<string>,
) => {
  console.log("handleSessionRevoked");
  clearSession();
  navigate({ to: paths.login });
};

const handleSessionRevokedAll = (
  clearSession: () => void,
  navigate: UseNavigateResult<string>,
) => {
  console.log("handleSessionRevokedAll");
  clearSession();
  navigate({ to: paths.login });
};

export const useAuthGatewayEvents = () => {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    const unregisterSessionRevoked = bonfireSdk.gateway.registerMessageHandler(
      authMessageTypes.sessionRevoked,
      () => handleSessionRevoked(clearSession, navigate),
    );

    const unregisterSessionRevokedAll =
      bonfireSdk.gateway.registerMessageHandler(
        authMessageTypes.sessionRevokedAll,
        () => handleSessionRevokedAll(clearSession, navigate),
      );

    return () => {
      unregisterSessionRevoked();
      unregisterSessionRevokedAll();
    };
  }, [clearSession, navigate]);
};
