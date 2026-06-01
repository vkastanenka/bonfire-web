import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInputs } from "./login.validation";

export const useLoginForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const methods = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInputs) => {
    setApiError(null);

    try {
      // Fake API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Logged in successfully:", data);

      // Handle your routing / state hydration here
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login failed");
      console.log(apiError);
    }
  };

  return {
    formMethods: methods,
    formState: methods.formState,
    onSubmit,
  };
};
