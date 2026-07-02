import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AxiosError } from "axios";
import { registerSchema } from "./register.validation";
import { type RegisterInputs } from "./register.validation";
import { useRegister } from "./useRegister";
import { type ApiErrorResponse } from "@/lib/api/types";
import { useNavigate } from "@tanstack/react-router";

export const useRegisterForm = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);

  const navigate = useNavigate();

  const methods = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", display_name: "", username: "", password: "" },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterInputs) => {
    setGlobalError(null);

    mutate(data, {
      onSuccess: (serverResponse) => {
        console.log("Registration server response:", serverResponse);
        navigate({
          to: "/login",
        });
      },
      onError: (err) => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const responseData = axiosError.response?.data;
        if (responseData?.invalid_params) {
          responseData.invalid_params.forEach((param) => {
            methods.setError(param.name as keyof RegisterInputs, {
              type: "manual",
              message: param.reason,
            });
          });
        }
        setGlobalError(responseData?.detail || "An unknown error occurred.");
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
    apiError: globalError,
  };
};
