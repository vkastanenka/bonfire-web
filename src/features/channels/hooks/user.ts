import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  type DisableRequest,
  type Me,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { useAuthStore } from "@/features/auth";

export const userKeys = {
  all: ["user"] as const,
  updateEmail: () => [...userKeys.all, "updateEmail"] as const,
  updateUsername: () => [...userKeys.all, "updateUsername"] as const,
  updatePreferredPresence: () =>
    [...userKeys.all, "updatePreferredPresence"] as const,
  updateProfile: () => [...userKeys.all, "updateProfile"] as const,
  updatePassword: () => [...userKeys.all, "updatePassword"] as const,
  disable: () => [...userKeys.all, "disable"] as const,
  scheduleDelete: () => [...userKeys.all, "scheduleDelete"] as const,
};

const useMeMutation = <TVariables>(
  mutationKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<Me>,
  optimisticUpdate: (me: Me, variables: TVariables) => Me,
  options?: UseMutationOptions<Me, Error, TVariables, Me | null>,
) => {
  const setMe = useAuthStore((state) => state.setMe);
  const { onMutate, onSuccess, onError, ...rest } = options ?? {};

  return useMutation({
    ...rest,
    mutationKey,
    mutationFn,
    onMutate: async (variables, context) => {
      const previousMe = useAuthStore.getState().me;
      if (previousMe) setMe(optimisticUpdate(previousMe, variables));
      await onMutate?.(variables, context);
      return previousMe;
    },
    onSuccess: async (data, variables, previousMe, context) => {
      setMe(data);
      await onSuccess?.(data, variables, previousMe, context);
    },
    onError: async (error, variables, previousMe, context) => {
      if (previousMe !== undefined) setMe(previousMe);
      await onError?.(error, variables, previousMe, context);
    },
  });
};

const useSessionResetMutation = <TVariables>(
  mutationKey: readonly unknown[],
  mutationFn: (variables: TVariables) => Promise<unknown>,
  options?: UseMutationOptions<unknown, Error, TVariables>,
) => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { onSettled, ...rest } = options ?? {};

  return useMutation({
    ...rest,
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

export const useUpdateEmail = (
  options?: UseMutationOptions<Me, Error, UpdateEmailRequest, Me | null>,
) =>
  useMeMutation(
    userKeys.updateEmail(),
    (data) => bonfireSdk.user.updateEmail(data),
    (me, req) => ({ ...me, email: req.newEmail }),
    options,
  );

export const useUpdateUsername = (
  options?: UseMutationOptions<Me, Error, UpdateUsernameRequest, Me | null>,
) =>
  useMeMutation(
    userKeys.updateUsername(),
    (data) => bonfireSdk.user.updateUsername(data),
    (me, req) => ({ ...me, username: req.newUsername }),
    options,
  );

export const useUpdatePreferredPresence = (
  options?: UseMutationOptions<
    Me,
    Error,
    UpdatePreferredPresenceRequest,
    Me | null
  >,
) =>
  useMeMutation(
    userKeys.updatePreferredPresence(),
    (data) => bonfireSdk.user.updatePreferredPresence(data),
    (me, req) => ({ ...me, preferredPresence: req.presence }),
    options,
  );

export const useUpdateProfile = (
  options?: UseMutationOptions<Me, Error, UpdateProfileRequest, Me | null>,
) =>
  useMeMutation(
    userKeys.updateProfile(),
    (data) => bonfireSdk.user.updateProfile(data),
    (me, req) => ({ ...me, ...req }),
    options,
  );

export const useUpdatePassword = (
  options?: UseMutationOptions<void, Error, UpdatePasswordRequest>,
) =>
  useMutation({
    ...options,
    mutationKey: userKeys.updatePassword(),
    mutationFn: (data) => bonfireSdk.user.updatePassword(data),
  });

export const useDisableAccount = (
  options?: UseMutationOptions<unknown, Error, DisableRequest>,
) =>
  useSessionResetMutation(
    userKeys.disable(),
    (data) => bonfireSdk.user.disable(data),
    options,
  );

export const useScheduleDeleteAccount = (
  options?: UseMutationOptions<unknown, Error, DisableRequest>,
) =>
  useSessionResetMutation(
    userKeys.scheduleDelete(),
    (data) => bonfireSdk.user.scheduleDelete(data),
    options,
  );
