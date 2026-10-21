import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { AppError } from "@/lib";
import { userService } from "./service";
import {
  type DisableRequest,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: userKeys.disable(),
    mutationFn: (data: DisableRequest) => userService.disable(data),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear(); // Clear entire cache since session is destroyed
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};

export const useScheduleDeleteAccount = (
  options?: Partial<UseMutationOptions<void, AppError, DisableRequest>>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: userKeys.scheduleDelete(),
    mutationFn: (data: DisableRequest) => userService.scheduleDelete(data),
    ...options,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.clear(); // Clear entire cache since account is scheduled for deletion & session cleared
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
