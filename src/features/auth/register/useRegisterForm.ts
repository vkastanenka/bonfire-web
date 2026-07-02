import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInputs } from "./register.validation";
import { useRegister } from "./hooks"; // Import your mutation hook
import { type AxiosError } from "axios";
import { type ApiErrorResponse } from "@/lib/api/types";

export const useRegisterForm = () => {
  // 1. Destructure the mutation methods and state from your hook
  const { mutate, isPending, error } = useRegister();

  const methods = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      displayName: "",
      username: "",
      password: "",
    },
  });

  // 2. Simply trigger the mutation
  const onSubmit = (data: RegisterInputs) => {
    mutate(data);
  };

  // 3. Derive the error message for the UI
  // Cast error to the expected type so we can access the backend message
  const axiosError = error as AxiosError<ApiErrorResponse> | null;
  const apiError = axiosError?.response?.data?.message ?? null;

  return {
    methods,
    onSubmit,
    isSubmitting: isPending, // Use this to disable your button
    apiError, // Use this to display the error text in your UI
  };
};
