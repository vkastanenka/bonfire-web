import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  type AccessTokenResponse,
  type ForgotPasswordRequest,
  type ListValidSessionsResponse,
  type LoginRequest,
  type Me,
  type RegisterRequest,
  type ResetPasswordRequest,
  type Session,
  type VerifyEmailRequest,
} from "@/bonfire-sdk";
import { bonfireSdk, queryClient } from "@/app";
import { useAuthStore } from "../store";

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
  options?: UseMutationOptions<AccessTokenResponse, Error, RegisterRequest>,
) =>
  useCreateSessionMutation(
    authKeys.register(),
    (data) => bonfireSdk.auth.register(data),
    options,
  );

export const useLogin = (
  options?: UseMutationOptions<AccessTokenResponse, Error, LoginRequest>,
) =>
  useCreateSessionMutation(
    authKeys.login(),
    (data) => bonfireSdk.auth.login(data),
    options,
  );

export const useResetPassword = (
  options?: UseMutationOptions<
    AccessTokenResponse,
    Error,
    ResetPasswordRequest
  >,
) =>
  useCreateSessionMutation(
    authKeys.resetPassword(),
    (data) => bonfireSdk.auth.resetPassword(data),
    options,
  );

export const useLogout = (options?: UseMutationOptions<void, Error, void>) =>
  useCreateSessionResetMutation(
    authKeys.logout(),
    () => bonfireSdk.auth.logout(),
    options,
  );

export const useRevokeAllSessions = (
  options?: UseMutationOptions<void, Error, void>,
) =>
  useCreateSessionResetMutation(
    authKeys.revokeAllSessions(),
    () => bonfireSdk.auth.revokeAllSessions(),
    options,
  );

export const useVerifyEmail = (
  options?: UseMutationOptions<Me, Error, VerifyEmailRequest>,
) => {
  const setMe = useAuthStore((state) => state.setMe);
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.verify(),
    mutationFn: (data: VerifyEmailRequest) => bonfireSdk.auth.verifyEmail(data),
    onSuccess: async (data, variables, onMutateResult, context) => {
      setMe(data);
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useResendVerify = (
  options?: UseMutationOptions<void, Error, void>,
) =>
  useMutation({
    ...options,
    mutationKey: authKeys.resendVerify(),
    mutationFn: () => bonfireSdk.auth.resendVerifyEmail(),
  });

export const useForgotPassword = (
  options?: UseMutationOptions<void, Error, ForgotPasswordRequest>,
) =>
  useMutation({
    ...options,
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (data: ForgotPasswordRequest) =>
      bonfireSdk.auth.forgotPassword(data),
  });

export const useListValidSessions = (
  options?: Omit<
    UseQueryOptions<ListValidSessionsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    staleTime: 1000 * 30,
    ...options,
    queryKey: authKeys.listValidSessions(),
    queryFn: () => bonfireSdk.auth.listValidSessions(),
  });

export const useRevokeSession = (
  options?: UseMutationOptions<void, Error, string>,
) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: authKeys.revokeSession(),
    mutationFn: (id: string) => bonfireSdk.auth.revokeSession(id),
    onSuccess: async (data, id, onMutateResult, context) => {
      queryClient.setQueryData<Session[]>(
        authKeys.listValidSessions(),
        (oldSessions) =>
          oldSessions?.filter((session) => session.id !== id) ?? [],
      );
      await onSuccess?.(data, id, onMutateResult, context);
    },
  });
};

const useCreateSessionMutation = <TVariables>(
  mutationKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<AccessTokenResponse>,
  options?: UseMutationOptions<AccessTokenResponse, Error, TVariables>,
) => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey,
    mutationFn,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.cancelQueries();
      queryClient.clear();
      setAccessToken(data.accessToken);
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

const useCreateSessionResetMutation = (
  mutationKey: readonly unknown[],
  mutationFn: () => Promise<void>,
  options?: UseMutationOptions<void, Error, void>,
) => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const { onSettled, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey,
    mutationFn,
    onSettled: async (data, error, variables, onMutateResult, context) => {
      await queryClient.cancelQueries();
      queryClient.clear();
      clearSession();
      await onSettled?.(data, error, variables, onMutateResult, context);
    },
  });
};
