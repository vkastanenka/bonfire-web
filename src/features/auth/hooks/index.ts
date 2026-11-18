import type { Me } from "@/bonfire-sdk";
import { useAuthStore } from "../store";

export * from "./api";

export const useMe = (): Me => {
  const me = useAuthStore((state) => state.me);

  if (!me) {
    // if (import.meta.env.DEV) {
    //   // 1. Attempt to refresh tokens/session first to restore the auth header
    //   authService
    //     .refresh()
    //     .then(() => bootstrapService.bootstrap())
    //     .then((data) => {
    //       if (data?.me) {
    //         useAuthStore.getState().setMe(data.me);
    //       }
    //     })
    //     .catch(() => {
    //       // If refresh fails, user needs to log in again manually
    //     });

    //   return {
    //     id: "00000000-0000-0000-0000-000000000000",
    //     email: "dev@example.com",
    //     username: "dev_user",
    //     displayName: "Dev User",
    //     avatarUrl: "",
    //     bio: "",
    //     bannerColor: "#000000",
    //     isVerified: true,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   };
    // }

    throw new Error(
      "useMe must only be used within an authenticated route where me is guaranteed.",
    );
  }

  return me;
};
