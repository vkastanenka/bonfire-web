import { bonfireSdk } from "@/app";
import { useAuthStore } from "./store";

let activeRefreshPromise: Promise<string | null> | null = null;

export const restoreSession = async (): Promise<string | null> => {
  const activeToken = useAuthStore.getState().accessToken;
  if (activeToken) return activeToken;

  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const data = await bonfireSdk.auth.refresh();
      useAuthStore.getState().setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clearSession();
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
};
