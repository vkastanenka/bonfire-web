import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ApiNetworkError,
  forgotPasswordRequestSchema,
  useForgotPassword,
  type ForgotPasswordRequest,
} from "@/api";

export const useForgotPasswordForm = () => {
  const [email, setEmail] = useState<string | null>(null);

  const methods = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordRequest) => {
    mutate(data, {
      onSuccess: () => {
        console.log("Forgot Password Success!");
        setEmail(data.email);
      },
      onError: (err) => {
        if (err instanceof ApiNetworkError && err.isValidationFailure()) {
          console.log(err.details);
          err.details.invalid_params?.forEach((param) => {
            methods.setError(param.name as keyof ForgotPasswordRequest, {
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
    email,
  };
};
