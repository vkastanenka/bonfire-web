import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AppError } from "@/lib";
import { authService } from "./service";
import {
  type ForgotPasswordRequest,
  type ListValidSessionsResponse,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
} from "./validation";

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

export const useRegister = (
  options?: Partial<UseMutationOptions<void, AppError, RegisterRequest>>,
) => {
  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    ...options,
  });
};

export const useLogin = (
  options?: Partial<UseMutationOptions<void, AppError, LoginRequest>>,
) => {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (data: LoginRequest) => authService.login(data),
    ...options,
  });
};

export const useLogout = (
  options?: Partial<UseMutationOptions<void, AppError, void>>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: () => authService.logout(),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear();
      await options?.onSuccess?.(data, variables, context, mutation);
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
  return useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    ...options,
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
  options?: Partial<UseMutationOptions<void, AppError, void>>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.revokeAllSessions(),
    mutationFn: () => authService.revokeAllSessions(),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.clear();
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useRevokeSession = (
  options?: Partial<
    UseMutationOptions<void, AppError, { id: string; isCurrent: boolean }>
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.revokeSession(),
    mutationFn: (data: { id: string; isCurrent: boolean }) =>
      authService.revokeSession(data.id, data.isCurrent),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      if (variables.isCurrent) {
        queryClient.clear();
      } else {
        await queryClient.invalidateQueries({
          queryKey: authKeys.listValidSessions(),
        });
      }
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
