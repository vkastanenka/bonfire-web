import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from "@tanstack/react-router";
import { type LoginRequest, loginRequestSchema, useLogin } from "@/bonfire";
import { AipError } from "@/errs";

export const useLoginForm = () => {
  // const navigate = useNavigate();

  const methods = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "vkastanenka@gmail.com",
      password: "password12345678",
    },
  });

  const { mutate, isPending } = useLogin();

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: () => {
        // navigate({ to: "/channels/@me" });
      },
      onError: (err) => {
        if (err instanceof AipError) {
          if (err.getFieldViolations().length) {
            console.log(err);
            // err.getFieldViolations().forEach((violation) => {
            //   methods.setError(violation.field as keyof LoginRequest, {
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
