import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { mutationKeys } from "./register.keys";
import { authService } from "../api/service";
import {
  type RegisterInputs,
  type RegisterResponse,
} from "./register.validation";
import { type ApiErrorResponse } from "@/lib/api/types";

// Encapsulated mutation options configuration matching getLocationsByNameOptions style
export const registerMutationOptions = (
  options?: Partial<
    UseMutationOptions<
      RegisterResponse,
      AxiosError<ApiErrorResponse>,
      RegisterInputs
    >
  >,
) => {
  return {
    mutationKey: mutationKeys.register(),
    mutationFn: (data: RegisterInputs) => authService.register(data),
    ...options,
  };
};

export const useRegister = (
  options?: Partial<
    UseMutationOptions<
      RegisterResponse,
      AxiosError<ApiErrorResponse>,
      RegisterInputs
    >
  >,
) => {
  return useMutation(registerMutationOptions(options));
};
