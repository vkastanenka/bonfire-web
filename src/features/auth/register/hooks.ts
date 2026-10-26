import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  useRegister,
  registerRequestSchema,
  type RegisterRequest,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";

export const useRegisterForm = () => {
  const navigate = useNavigate();

  const methods = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      email: "vkastanenka@gmail.com",
      displayName: "vkast123",
      username: "vkast123",
      password: "password12345678",
    },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterRequest) => {
    mutate(data, {
      onSuccess: () => {
        navigate({ to: "/channels/@me" });
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
