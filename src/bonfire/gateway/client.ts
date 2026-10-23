import { Client as BaseClient, type RequestOptions } from "@/http";
import { bonfireClient } from "../client";
import {
  printTicketResponseSchema,
  type PrintTicketResponse,
} from "./validation";

export class Client {
  protected readonly client: BaseClient;

  constructor(client: BaseClient = bonfireClient) {
    this.client = client;
  }

  public printTicket = (
    options?: RequestOptions,
  ): Promise<PrintTicketResponse> => {
    return this.client.post<typeof printTicketResponseSchema>({
      ...options,
      urlPath: "/gateway/ticket",
      schema: printTicketResponseSchema,
    });
  };
}

export const client = new Client();
