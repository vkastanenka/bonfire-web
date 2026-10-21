import { bootstrapClient, type BootstrapClient } from "./client";
import { useAuthStore, type AuthStore } from "../auth";
import type { RequestOptions } from "@/http";

export class BootstrapService {
  private readonly client: BootstrapClient;
  private readonly authStore: AuthStore;

  constructor(
    client: BootstrapClient = bootstrapClient,
    authStore: AuthStore = useAuthStore,
  ) {
    this.client = client;
    this.authStore = authStore;
  }

  public async bootstrap(options?: RequestOptions) {
    const data = await this.client.bootstrap(options);
    this.authStore.getState().setMe(data.me);
  }
}

export const bootstrapService = new BootstrapService();
