import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from "@tanstack/react-router";
import { useResetPassword, passwordSchema } from "@/bonfire";
import { AipError } from "@/errs";
import { z } from "@/validation";

export const resetPasswordFormSchema = z.object({
  password: passwordSchema,
});

export type TResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;

export const useResetPasswordForm = (token: string) => {
  // const navigate = useNavigate();

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
        // navigate({ to: "/channels/@me" });
      },
      onError: (err) => {
        if (err instanceof AipError) {
          if (err.getFieldViolations().length) {
            console.log(err);
            // err.getFieldViolations().forEach((violation) => {
            //   methods.setError(violation.field as keyof TResetPasswordForm, {
            //     type: "manual",
            //     message: violation.description,
            //   });
            // });
          }
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
