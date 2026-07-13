import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../core";
import type { ApiNetworkError, ResponseValidationError } from "../core";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../core/schema";
import { setAccessToken } from "../core/store";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
  login: () => [...authKeys.all, "login"] as const,
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
      if (res.access_token) {
        setAccessToken(res.access_token);
      }
    },
    ...options,
  });
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
      if (res.access_token) {
        setAccessToken(res.access_token);
      }
    },
    ...options,
  });
};
