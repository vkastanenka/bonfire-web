import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AppError } from "@/errs/app";
import { bootstrapService } from "./service";

export const bootstrapKeys = {
  all: ["bootstrap"] as const,
};

export const useBootstrap = (
  options?: Omit<UseQueryOptions<void, AppError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: bootstrapKeys.all,
    queryFn: () => bootstrapService.bootstrap(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};
