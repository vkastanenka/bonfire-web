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
  const navigate = useNavigate();

  const methods = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { email: "", display_name: "", username: "", password: "" },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterRequest) => {
    mutate(data, {
      onSuccess: (serverResponse) => {
        console.log(
          "Registration successful! Access token acquired:",
          serverResponse.access_token,
        );
        navigate({ to: "/login" });
      },
      onError: (err) => {
        console.log(err.details);
        if (err instanceof ApiNetworkError && err.isValidationFailure()) {
          err.details.invalid_params?.forEach((param) => {
            methods.setError(param.name as keyof RegisterRequest, {
              type: "manual",
              message: param.reason,
            });
          });
        }
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
