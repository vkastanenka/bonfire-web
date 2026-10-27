import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AppError } from "@/errs/app";
import { bootstrapService } from "./service";
import type { Me } from "../user";

export const bootstrapKeys = {
  all: ["bootstrap"] as const,
};

export const useBootstrap = (
  options?: Omit<UseQueryOptions<{ me: Me }, AppError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: bootstrapKeys.all,
    queryFn: () => bootstrapService.bootstrap(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    ...options,
  });
};
