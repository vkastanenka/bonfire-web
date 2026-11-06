import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AppError } from "@/errs/app";
import { bootstrapService } from "./service";
import type { Me } from "../user";
import { useAuthStore } from "../auth";

export const bootstrapKeys = {
  all: ["bootstrap"] as const,
};

export const useBootstrap = (
  options?: Omit<UseQueryOptions<{ me: Me }, AppError>, "queryKey" | "queryFn">,
) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: bootstrapKeys.all,
    queryFn: () => bootstrapService.bootstrap(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(accessToken),
    ...options,
  });
};
