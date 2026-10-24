import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequest,
  useForgotPassword,
} from "@/bonfire";
import { AipError } from "@/errs";

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
        if (err instanceof AipError) {
          if (err.getFieldViolations().length) {
            console.log(err);
            err.getFieldViolations().forEach((violation) => {
              methods.setError(violation.field as keyof ForgotPasswordRequest, {
                type: "manual",
                message: violation.description,
              });
            });
          }
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
