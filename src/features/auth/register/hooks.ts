import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { registerRequestSchema, type RegisterRequest } from "@/bonfire-sdk";
import { useRegister } from "../hooks";
import { handleAipFieldViolations } from "@/utils";
import { paths } from "@/constants";

export const useRegisterForm = () => {
  const navigate = useNavigate();

  const methods = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      email: "",
      displayName: "",
      username: "",
      password: "",
    },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterRequest) => {
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
