import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequest,
  useForgotPassword,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";

export const useForgotPasswordForm = () => {
  const [email, setEmail] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "vkastanenka@gmail.com",
    },
  });

  const { mutate, isPending } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordRequest) => {
    mutate(data, {
      onSuccess: () => {
        setEmail(data.email);
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
    email,
  };
};
