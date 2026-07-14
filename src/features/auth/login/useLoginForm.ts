import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";

import {
  useLogin,
  loginRequestSchema,
  ApiNetworkError,
  type LoginRequest,
  tokenProvider,
} from "@/api";

export const useLoginForm = () => {
  const navigate = useNavigate();

  const methods = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
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
        tokenProvider.setAccessToken(res.access_token);
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
