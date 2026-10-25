import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate } from "@tanstack/react-router";
import {
  useRegister,
  registerRequestSchema,
  type RegisterRequest,
} from "@/bonfire";
import { AipError } from "@/errs";

export const useRegisterForm = () => {
  // const navigate = useNavigate();

  const methods = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      email: "",
      displayName: "",
      username: "",
      password: "",
    },
  });

  const { mutate, isPending } = useRegister();

  const onSubmit = (data: RegisterRequest) => {
    mutate(data, {
      onSuccess: () => {
        // navigate({ to: "/channels/@me" });
      },
      onError: (err) => {
        if (err instanceof AipError) {
          if (err.getFieldViolations().length) {
            console.log(err);
            // err.getFieldViolations().forEach((violation) => {
            //   methods.setError(violation.field as keyof RegisterRequest, {
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
