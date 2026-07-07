import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { authService, type ApiNetworkError } from "../core";
import type { RegisterRequest, RegisterResponse } from "../core/schema";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
};

export const useRegister = (
  options?: Partial<
    UseMutationOptions<RegisterResponse, ApiNetworkError, RegisterRequest>
  >,
) => {
  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
    ...options,
  });
};
