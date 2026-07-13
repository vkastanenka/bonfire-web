import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { authService } from "../core";
import type { ApiNetworkError, ResponseValidationError } from "../core";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
} from "../http/schema";
import { useTokenStore } from "./WebStrategy";

export const authKeys = {
  all: ["auth"] as const,
  register: () => [...authKeys.all, "register"] as const,
  login: () => [...authKeys.all, "login"] as const,
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
  const { setAccessToken } = useTokenStore();

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

export const useRegister = (
  options?: Partial<
    UseMutationOptions<
      RegisterResponse,
      ApiNetworkError | ResponseValidationError,
      RegisterRequest
    >
  >,
) => {
  const { setAccessToken } = useTokenStore();

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
