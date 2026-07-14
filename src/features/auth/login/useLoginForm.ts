import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";

import {
  useLogin,
  loginRequestSchema,
  ApiNetworkError,
  type LoginRequest,
} from "@/api";
import { sessionManager } from "@/api/auth/session";

export const useLoginForm = () => {
  const navigate = useNavigate();

  const methods = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "vkastanenka@gmail.com",
      password: "password1234",
    },
  });

  const { mutate, isPending } = useLogin();

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: (res) => {
        console.log(
          "Login successful! Access token acquired:",
          res.access_token,
        );
        sessionManager.setAccessToken(res.access_token);
        navigate({ to: "/channels/@me" });
      },
      onError: (err) => {
        if (err instanceof ApiNetworkError && err.isValidationFailure()) {
          console.log(err.details);
          err.details.invalid_params?.forEach((param) => {
            methods.setError(param.name as keyof LoginRequest, {
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
