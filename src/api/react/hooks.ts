import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../http/services";
import type { ApiNetworkError, ResponseValidationError } from "../http/errors";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../http/schema";
import { useTokenStore } from "./WebStrategy";
import { useGatewayStore } from "../gateway/store";
import { useEffect } from "react";

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
  const { setAccessToken } = useTokenStore();

  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res: LoginResponse) => {
      if (res.access_token) {
        setAccessToken(res.access_token);
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
  const { setAccessToken } = useTokenStore();

  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (res: RegisterResponse) => {
      if (res.access_token) {
        setAccessToken(res.access_token);
      }
    },
    ...options,
  });
};

export function useGateway() {
  const initializeGateway = useGatewayStore((state) => state.initializeGateway);
  const terminateGateway = useGatewayStore((state) => state.terminateGateway);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapLayoutData() {
      try {
        // Step 1: Execute static REST calls safely here (e.g., fetch user settings, channels)
        // await useChannelStore.getState().fetchMeChannels();

        // Step 2: Establish the stateful network pipe once structural models exist in memory
        if (isMounted) {
          initializeGateway("online");
        }
      } catch (err) {
        console.error(
          "[App Switchboard] Resource mapping halted root state resolution:",
          err,
        );
      }
    }

    bootstrapLayoutData();

    return () => {
      isMounted = false;
      terminateGateway();
    };
  }, [initializeGateway, terminateGateway]);
}
