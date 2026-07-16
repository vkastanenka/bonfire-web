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
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../auth";
import { useGatewayStore } from "../gateway/store";
import { useEffect } from "react";
import { authManager, authService } from "../auth";
import { meService } from "../me/service";
import { meManager } from "../me/manager";
import type { Me } from "../me";
import { activityTracker } from "../presence";
import { gatewayManager } from "../gateway/manager";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
  login: () => [...authKeys.all, "login"] as const,
  verify: () => [...authKeys.all, "verify"] as const,
  resendVerify: () => [...authKeys.all, "resendVerify"] as const,
  forgotPassword: () => [...authKeys.all, "forgotPassword"] as const,
  resetPassword: () => [...authKeys.all, "resetPassword"] as const,
  wsTicket: () => [...authKeys.all, "wsTicket"] as const,
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
      if (res?.access_token) {
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
      if (res?.access_token) {
        authManager.setAccessToken(res.access_token);
      }
    },
    ...options,
  });
};

export const useVerifyEmail = (
  options?: Partial<
    UseMutationOptions<
      unknown,
      ApiNetworkError | ResponseValidationError,
      VerifyEmailRequest
    >
  >,
) => {
  return useMutation({
    mutationKey: authKeys.verify(),
    mutationFn: (data: VerifyEmailRequest) => authService.verify(data),
    ...options,
  });
};

export const useResendVerify = (
  options?: Partial<
    UseMutationOptions<unknown, ApiNetworkError | ResponseValidationError, void>
  >,
) => {
  return useMutation({
    mutationKey: authKeys.resendVerify(),
    mutationFn: () => authService.resendVerify(),
    ...options,
  });
};

export const useForgotPassword = (
  options?: Partial<
    UseMutationOptions<
      unknown,
      ApiNetworkError | ResponseValidationError,
      ForgotPasswordRequest
    >
  >,
) => {
  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    ...options,
  });
};

export const useResetPassword = (
  options?: Partial<
    UseMutationOptions<
      ResetPasswordResponse,
      ApiNetworkError | ResponseValidationError,
      ResetPasswordRequest
    >
  >,
) => {
  return useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: (res: ResetPasswordResponse) => {
      if (res?.access_token) {
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
  const setActivity = useGatewayStore((state) => state.setActivity);

  useEffect(() => {
    let isMounted = true;

    // 1. Kickstart low-level browser interaction listeners
    activityTracker.start();

    // 2. Subscribe and stream activity tracker values into Zustand
    const unsubscribeActivity = activityTracker.subscribe((status) => {
      if (isMounted) {
        setActivity(status);
        // Dispatch instant WS frame if we transition between online and idle
        gatewayManager.syncPresence();
      }
    });

    // 3. Mount real-time websocket channel
    if (isMounted) {
      initializeGateway();
    }

    // 4. Tab visibility focus mechanics
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Gateway] Tab focused. Synchronizing socket activity...");
        // Fast recovery path: wake connection up if sleep severed it, then sync presence
        initializeGateway();
        gatewayManager.syncPresence();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      unsubscribeActivity();
      activityTracker.stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      terminateGateway();
    };
  }, [initializeGateway, terminateGateway, setActivity]);
}
