import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInputs } from "./register.validation";

export const useRegisterForm = () => {
  const [apiError, setApiError] = useState<string | null>(null);

  const methods = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      displayName: "",
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterInputs) => {
    setApiError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Registered successfully:", data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Register failed");
      console.log(apiError);
    }
  };

  return {
    methods,
    onSubmit,
  };
};
