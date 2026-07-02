import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AxiosError } from "axios";
import { registerSchema } from "./register.validation";
import { type RegisterInputs } from "./register.validation";
import { useRegister } from "./useRegister";
import { type ApiErrorResponse } from "@/lib/api/types";

export const useRegisterForm = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const methods = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", display_name: "", username: "", password: "" },
  });

  const { mutate, isPending } = useRegister({
    onSuccess: (data) => {
      console.log("Registration lifecycle success:", data);
      // Handle redirecting/auth side-effects seamlessly here or inside components
    },
  });

  const onSubmit = (data: RegisterInputs) => {
    setGlobalError(null);

    mutate(data, {
      onError: (err) => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const responseData = axiosError.response?.data;

        console.log("RAW SERVER RESPONSE:", responseData);

        if (responseData) {
          // 1. Process field validations returned from Go backend (RFC 7807)
          if (responseData.invalid_params) {
            responseData.invalid_params.forEach((param) => {
              methods.setError(param.name as keyof RegisterInputs, {
                type: "manual",
                message: param.reason,
              });
            });
          }

          // 2. Fallback to generic problem detail text
          setGlobalError(responseData.detail || "An unknown error occurred.");
        } else {
          setGlobalError("Network error or empty response.");
        }
      },
    });
  };

  return {
    methods,
    onSubmit,
    isSubmitting: isPending,
    apiError: globalError,
  };
};
