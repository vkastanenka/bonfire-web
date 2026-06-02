import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInputs,
} from "./forgot-password.validation";

export const useForgotPasswordForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setApiError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Sent password reset email successfully:", data);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Failed to send password reset email",
      );
      console.log(apiError);
    }
  };

  return {
    methods,
    onSubmit,
  };
};
