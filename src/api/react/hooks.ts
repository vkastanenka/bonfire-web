import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ApiNetworkError, ResponseValidationError } from "../http/errors";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../auth";
import { useGatewayStore } from "../gateway/store";
import { useEffect } from "react";
import { authManager, authService } from "../auth";
import { meService } from "../me/service";
import { meManager } from "../me/manager";
import type { Me } from "../me";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
  login: () => [...authKeys.all, "login"] as const,
};

export const useLogin = (
  options?: Partial<
    UseMutationOptions<
      LoginResponse,
      ApiNetworkError | ResponseValidationError,
      LoginRequest
    >
  >,
) => {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res: LoginResponse) => {
      if (res.access_token) {
        authManager.setAccessToken(res.access_token);
      }
    },
    ...options,
  });
};

export const useRegister = (
  options?: Partial<
    UseMutationOptions<
      RegisterResponse,
      ApiNetworkError | ResponseValidationError,
      RegisterRequest
    >
  >,
) => {
  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (res: RegisterResponse) => {
      if (res.access_token) {
        authManager.setAccessToken(res.access_token);
      }
    },
    ...options,
  });
};

export const meKeys = {
  all: ["me"] as const,
  get: () => [...meKeys.all, "get"] as const,
};

export const useMe = (
  options?: Omit<
    UseQueryOptions<Me, ApiNetworkError | ResponseValidationError>,
    "queryKey" | "queryFn"
  >,
) => {
  const query = useQuery({
    queryKey: meKeys.get(),
    queryFn: () => meService.get(),
    staleTime: 1000 * 60 * 5,
    ...options,
  });

  useEffect(() => {
    if (query.data) {
      meManager.set(query.data);
    }
  }, [query.data]);

  return query;
};

export function useGateway() {
  const initializeGateway = useGatewayStore((state) => state.initializeGateway);
  const terminateGateway = useGatewayStore((state) => state.terminateGateway);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapLayoutData() {
      if (isMounted) {
        initializeGateway("online");
      }
    }

    bootstrapLayoutData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Gateway] Tab focused. Restoring connection...");
        initializeGateway("online");
      } else {
        console.log("[Gateway] Tab backgrounded.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      terminateGateway();
    };
  }, [initializeGateway, terminateGateway]);
}
