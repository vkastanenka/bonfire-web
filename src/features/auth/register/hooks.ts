import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/service";
import { AxiosError } from "axios"; // 1. Import AxiosError
import { type ApiErrorResponse } from "@/lib/api/types"; // 2. Import your response interface

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      console.log("Registration successful", data);
    },
    // 3. Use the generic type here
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // TypeScript now knows error.response.data exists and has a 'message' property
      console.error("Registration failed", error.response?.data?.message);
    },
  });
};
