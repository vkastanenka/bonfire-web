import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ApiNetworkError, useResetPassword } from "@/api";
import { passwordSchema } from "@/api/pkg";

const resetPasswordFormSchema = z.object({
  password: passwordSchema,
});

export type TResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export const useResetPasswordForm = (token: string) => {
  const navigate = useNavigate();

  const methods = useForm<TResetPasswordForm>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const { mutate, isPending } = useResetPassword();

  const onSubmit = async (data: TResetPasswordForm) => {
    const req = { token, password: data.password };
    mutate(req, {
      onSuccess: () => {
        console.log("Reset Password Success!");
        navigate({ to: "/channels/@me" });
      },
      onError: (err) => {
        if (err instanceof ApiNetworkError && err.isValidationFailure()) {
          console.log(err.details);
          err.details.invalid_params?.forEach((param) => {
            methods.setError(param.name as keyof TResetPasswordForm, {
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
