import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { BootstrapResponse } from "@/bonfire-sdk";
import { bonfireSdk } from "@/app";
import { useAuthStore } from "@/features/auth";

export const bootstrapKeys = {
  all: ["bootstrap"] as const,
};

export const useBootstrap = (
  options?: Omit<
    UseQueryOptions<BootstrapResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(accessToken),
    ...options,
    queryKey: bootstrapKeys.all,
    queryFn: () => bonfireSdk.bootstrap.bootstrap(),
  });
};
