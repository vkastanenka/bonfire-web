import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInputs,
} from "./reset-password.validation";

export const useResetPasswordForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const methods = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInputs) => {
    setApiError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Reset password successfully:", data);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to reset password",
      );
      console.log(apiError);
    }
  };

  return {
    methods,
    onSubmit,
  };
};
