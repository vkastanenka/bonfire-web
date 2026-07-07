import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";

import {
  useRegister,
  registerRequestSchema,
  ApiNetworkError,
  type RegisterRequest,
} from "@/api";

export const useRegisterForm = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const methods = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { email: "", display_name: "", username: "", password: "" },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterRequest) => {
    setGlobalError(null);

    mutate(data, {
      onSuccess: (serverResponse) => {
        console.log(
          "Registration successful! Access token acquired:",
          serverResponse.access_token,
        );
        navigate({
          to: "/login",
        });
      },
      onError: (err) => {
        console.log("Full Problem Details:", err.details);
        if (err instanceof ApiNetworkError) {
          if (err.isValidationFailure()) {
            err.details.invalid_params?.forEach((param) => {
              methods.setError(param.name as keyof RegisterRequest, {
                type: "manual",
                message: param.reason,
              });
            });
          }
          setGlobalError(err.message);
        } else {
          setGlobalError(
            "A critical unexpected execution environment error occurred.",
          );
        }
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
