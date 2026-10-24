import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { AppError } from "@/errs/app";
import { toast } from "@/toast";

const handleGlobalError = (error: unknown) => {
  if (error instanceof AppError || error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred.");
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleGlobalError(error);
    },
  }),
});
