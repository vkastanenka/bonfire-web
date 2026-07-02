import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInputs } from "./register.validation";
import { useRegister } from "./hooks";
import { type AxiosError } from "axios";
import { type ApiErrorResponse } from "@/lib/api/types";

export const useRegisterForm = () => {
  const { mutate, isPending } = useRegister();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const methods = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", displayName: "", username: "", password: "" },
  });

  const onSubmit = (data: RegisterInputs) => {
    setGlobalError(null);

    mutate(data, {
      onError: (err) => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const responseData = axiosError.response?.data;

        if (responseData) {
          // 1. Handle Field-Specific Errors (e.g., "email already taken")
          if (responseData.invalid_params) {
            responseData.invalid_params.forEach((param) => {
              methods.setError(param.name as keyof RegisterInputs, {
                type: "manual",
                message: param.reason,
              });
            });
          }

          // 2. Handle Global Error (e.g., "Internal Server Error")
          setGlobalError(responseData.detail || "An unknown error occurred.");
        } else {
          setGlobalError("Network error. Please try again.");
        }
      },
    });
  };

  return {
    methods,
    onSubmit,
    isSubmitting: isPending,
    apiError: globalError, // Display this in your UI
  };
};
