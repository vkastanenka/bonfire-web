import type { Me } from "@/bonfire-sdk";
import { useAuthStore } from "../store";

export * from "./api";

export const useMe = (): Me => {
  const me = useAuthStore((state) => state.me);

  if (!me) {
    throw new Error(
      "useMe must only be used within an authenticated route where me is guaranteed.",
    );
  }

  return me;
};
