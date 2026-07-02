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
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // Now this will correctly print the server's error message
      const message = error.response?.data.detail || "Registration failed";
      console.error("Registration failed:", message);
    },
  });
};
