import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { queryClient } from "@/app";
import { AppError } from "@/errs";
import { authService } from "./service";
import {
  type ForgotPasswordRequest,
  type ListValidSessionsResponse,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type Session,
  type VerifyEmailRequest,
} from "./validation";
import type { Me } from "../user";
import { useAuthStore } from "./store";
import { useNavigate } from "@tanstack/react-router";
import { paths } from "@/constants";
import { bootstrapService } from "../bootstrap";
import { broadcaster, broadcastTypes } from "../gateway/broadcaster";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
  login: () => [...authKeys.all, "login"] as const,
  logout: () => [...authKeys.all, "logout"] as const,
  verify: () => [...authKeys.all, "verify"] as const,
  resendVerify: () => [...authKeys.all, "resendVerify"] as const,
  forgotPassword: () => [...authKeys.all, "forgotPassword"] as const,
  resetPassword: () => [...authKeys.all, "resetPassword"] as const,
  listValidSessions: () => [...authKeys.all, "listValidSessions"] as const,
  revokeAllSessions: () => [...authKeys.all, "revokeAllSessions"] as const,
  revokeSession: () => [...authKeys.all, "revokeSession"] as const,
};

export const useMe = (): Me => {
  const me = useAuthStore((state) => state.me);

  if (!me) {
    if (import.meta.env.DEV) {
      // 1. Attempt to refresh tokens/session first to restore the auth header
      authService
        .refresh()
        .then(() => bootstrapService.bootstrap())
        .then((data) => {
          if (data?.me) {
            useAuthStore.getState().setMe(data.me);
          }
        })
        .catch(() => {
          // If refresh fails, user needs to log in again manually
        });

      return {
        id: "00000000-0000-0000-0000-000000000000",
        email: "dev@example.com",
        username: "dev_user",
        displayName: "Dev User",
        avatarUrl: "",
        bio: "",
        bannerColor: "#000000",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    throw new AppError(
      "useMe must only be used within an authenticated route where me is guaranteed.",
    );
  }

  return me;
};

export const useRegister = (
  options?: Partial<UseMutationOptions<void, AppError, RegisterRequest>>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear();
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useLogin = (
  options?: Partial<UseMutationOptions<void, AppError, LoginRequest>>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.login(),
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear();
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useLogout = (
  options?: Partial<UseMutationOptions<unknown, AppError, void>>,
) => {
  const navigate = useNavigate();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.logout(),
    mutationFn: () => authService.logout(),
    onSuccess: async (data, variables, context, mutation) => {
      broadcaster.post(broadcastTypes.logout, null, "useLogout");
      navigate({ to: paths.login });
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useVerifyEmail = (
  options?: Partial<UseMutationOptions<void, AppError, VerifyEmailRequest>>,
) => {
  return useMutation({
    mutationKey: authKeys.verify(),
    mutationFn: (data: VerifyEmailRequest) => authService.verify(data),
    ...options,
  });
};

export const useResendVerify = (
  options?: Partial<UseMutationOptions<void, AppError, void>>,
) => {
  return useMutation({
    mutationKey: authKeys.resendVerify(),
    mutationFn: () => authService.resendVerify(),
    ...options,
  });
};

export const useForgotPassword = (
  options?: Partial<UseMutationOptions<void, AppError, ForgotPasswordRequest>>,
) => {
  return useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    ...options,
  });
};

export const useResetPassword = (
  options?: Partial<UseMutationOptions<void, AppError, ResetPasswordRequest>>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.resetPassword(),
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear();
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useListValidSessions = (
  options?: Omit<
    UseQueryOptions<ListValidSessionsResponse, AppError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: authKeys.listValidSessions(),
    queryFn: () => authService.listValidSessions(),
    staleTime: 1000 * 30,
    ...options,
  });
};

export const useRevokeAllSessions = (
  options?: Partial<UseMutationOptions<unknown, AppError, void>>,
) => {
  const navigate = useNavigate();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.revokeAllSessions(),
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: async (data, variables, context, mutation) => {
      broadcaster.post(broadcastTypes.logout, null, "useRevokeAllSessions");
      navigate({ to: paths.login });
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useRevokeSession = (
  options?: Partial<
    UseMutationOptions<void, AppError, { id: string; isCurrent: boolean }>
  >,
) => {
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.revokeSession(),
    mutationFn: (data: { id: string; isCurrent: boolean }) =>
      authService.revokeSession(data.id),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.setQueryData<Session[]>(
        authKeys.listValidSessions(),
        (oldSessions) => {
          if (!oldSessions) return [];
          return oldSessions.filter((session) => session.id !== variables.id);
        },
      );

      await onSuccess?.(data, variables, context, mutation);
    },
  });
};
