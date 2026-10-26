import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useResetPassword, passwordSchema } from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";
import { z } from "@/validation";

export const resetPasswordFormSchema = z.object({
  password: passwordSchema,
});

export type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;

export const useResetPasswordForm = (token: string) => {
  const navigate = useNavigate();

  const methods = useForm<ResetPasswordFormSchema>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const { mutate, isPending } = useResetPassword();

  const onSubmit = async (data: ResetPasswordFormSchema) => {
    const req = { token, password: data.password };
    mutate(req, {
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
