import { bootstrapClient } from "./client";
import { useAuthStore } from "../auth";
import type { ClientRequestOptions } from "@/http";

export class BootstrapService {
  public async bootstrap(options?: ClientRequestOptions) {
    const data = await bootstrapClient.bootstrap(options);
    useAuthStore.getState().setMe(data.me);
  }
}

export const bootstrapService = new BootstrapService();
