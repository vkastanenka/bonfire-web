import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { AipError, AppError } from "@/errs";
import { toast } from "@/toast";

const handleGlobalError = (err: unknown) => {
  if (err instanceof AipError) {
    if (err.hasFieldViolations()) return;

    const descriptions: string[] = [];

    const formattedDelay = err.getFormattedRetryDelay();
    if (formattedDelay) {
      descriptions.push(`Please wait ${formattedDelay} before trying again.`);
    }

    toast.error(
      err.message,
      descriptions.length > 0 ? descriptions : undefined,
    );
    return;
  }

  if (err instanceof AppError || err instanceof Error) {
    toast.error(err.message);
    return;
  }

  toast.error("An unexpected error occurred.");
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
