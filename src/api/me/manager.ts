import type { Presence } from "../presence";
import type { Me } from "./schema";
import { useMeStore, type UpdateProfileParams } from "./store";

class MeManager {
  public get() {
    return useMeStore.getState().me;
  }

  public set(me: Me | null): void {
    useMeStore.getState().set(me);
  }

  public updateProfile(params: UpdateProfileParams): void {
    useMeStore.getState().updateProfile(params);
  }

  public updatePresence(presence: Presence | null): void {
    useMeStore.getState().updatePresence(presence);
  }

  public clear(): void {
    useMeStore.getState().clear();
  }
}

export const meManager = new MeManager();
