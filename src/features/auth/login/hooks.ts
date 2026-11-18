import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { type LoginRequest, loginRequestSchema } from "@/bonfire-sdk";
import { handleAipFieldViolations } from "@/utils";
import { useLogin } from "../hooks";
import { paths } from "@/constants";

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
      onSuccess: () => {
        navigate({ to: paths.me });
      },
      onError: (err) => {
        handleAipFieldViolations(err, methods);
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
