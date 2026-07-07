import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../core";
import { type ApiNetworkError } from "../core/errors";
import type { RegisterRequest, RegisterResponse } from "../core/schema";
import { authKeys } from "./keys";

export const registerMutationOptions = (
  options?: Partial<
    UseMutationOptions<RegisterResponse, ApiNetworkError, RegisterRequest>
  >,
) => {
  return {
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    ...options,
  };
};

export const useRegister = (
  options?: Partial<
    UseMutationOptions<RegisterResponse, ApiNetworkError, RegisterRequest>
  >,
) => {
  return useMutation(registerMutationOptions(options));
};
