import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { AppError } from "@/errs/app";
import { userService } from "./service";
import {
  type DisableRequest,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";
import { usePresenceStore, type Presence } from "@/presence";
import { useAuthStore } from "../auth";
import { paths } from "@/constants";
import { useNavigate } from "@tanstack/react-router";
import { broadcaster, broadcastTypes } from "../gateway/broadcaster";

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  updateEmail: () => [...userKeys.all, "updateEmail"] as const,
  updateUsername: () => [...userKeys.all, "updateUsername"] as const,
  updatePreferredPresence: () =>
    [...userKeys.all, "updatePreferredPresence"] as const,
  updateProfile: () => [...userKeys.all, "updateProfile"] as const,
  updatePassword: () => [...userKeys.all, "updatePassword"] as const,
  disable: () => [...userKeys.all, "disable"] as const,
  scheduleDelete: () => [...userKeys.all, "scheduleDelete"] as const,
};

export const useUpdateEmail = (
  options?: Partial<UseMutationOptions<void, AppError, UpdateEmailRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.updateEmail(),
    mutationFn: (data: UpdateEmailRequest) => userService.updateEmail(data),
    ...options,
  });
};

export const useUpdateUsername = (
  options?: Partial<UseMutationOptions<void, AppError, UpdateUsernameRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.updateUsername(),
    mutationFn: (data: UpdateUsernameRequest) =>
      userService.updateUsername(data),
    ...options,
  });
};

export const useUpdatePreferredPresence = (
  options?: Partial<
    UseMutationOptions<void, AppError, UpdatePreferredPresenceRequest>
  >,
) => {
  return useMutation({
    mutationKey: userKeys.updatePreferredPresence(),
    mutationFn: (data: UpdatePreferredPresenceRequest) =>
      userService.updatePreferredPresence(data),
    ...options,
  });
};

export const useUpdateProfile = (
  options?: Partial<UseMutationOptions<void, AppError, UpdateProfileRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.updateProfile(),
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    ...options,
  });
};

export const useUpdatePassword = (
  options?: Partial<UseMutationOptions<void, AppError, UpdatePasswordRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.updatePassword(),
    mutationFn: (data: UpdatePasswordRequest) =>
      userService.updatePassword(data),
    ...options,
  });
};

export const useDisableAccount = (
  options?: Partial<UseMutationOptions<unknown, AppError, DisableRequest>>,
) => {
  const navigate = useNavigate();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: userKeys.disable(),
    mutationFn: (data: DisableRequest) => userService.disable(data),
    onSuccess: async (data, variables, context, mutation) => {
      broadcaster.post(broadcastTypes.logout, null, "useDisableAccount");
      navigate({ to: paths.login });
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useScheduleDeleteAccount = (
  options?: Partial<UseMutationOptions<unknown, AppError, DisableRequest>>,
) => {
  const navigate = useNavigate();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    ...restOptions,
    mutationKey: userKeys.scheduleDelete(),
    mutationFn: (data: DisableRequest) => userService.scheduleDelete(data),
    onSuccess: async (data, variables, context, mutation) => {
      broadcaster.post(broadcastTypes.logout, null, "useScheduleDeleteAccount");
      navigate({ to: paths.login });
      await onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useEffectivePresence = (): Presence => {
  usePresenceStore((state) => state.presence);
  useAuthStore((state) => state.me?.preferredPresence);
  useAuthStore((state) => state.me?.preferredPresenceUntil);
  return getEffectivePresence();
};

export const getEffectivePresence = (): Presence => {
  const presence = usePresenceStore.getState().presence;
  const me = useAuthStore.getState().me;
  const preferredPresence = me?.preferredPresence;
  const preferredPresenceUntil = me?.preferredPresenceUntil;

  if (preferredPresence) {
    if (preferredPresenceUntil) {
      const isExpired = new Date() > new Date(preferredPresenceUntil);
      if (!isExpired) return preferredPresence;
    } else {
      return preferredPresence;
    }
  }

  return presence;
};
