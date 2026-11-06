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
  options?: Partial<UseMutationOptions<void, AppError, DisableRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.disable(),
    mutationFn: (data: DisableRequest) => userService.disable(data),
    ...options,
  });
};

export const useScheduleDeleteAccount = (
  options?: Partial<UseMutationOptions<void, AppError, DisableRequest>>,
) => {
  return useMutation({
    mutationKey: userKeys.scheduleDelete(),
    mutationFn: (data: DisableRequest) => userService.scheduleDelete(data),
    ...options,
  });
};

export const useEffectivePresence = (): Presence => {
  const presence = usePresenceStore((state) => state.presence);
  const preferredPresence = useAuthStore(
    (state) => state.me?.preferredPresence,
  );
  const preferredPresenceUntil = useAuthStore(
    (state) => state.me?.preferredPresenceUntil,
  );

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
